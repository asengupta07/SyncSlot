"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  addMinutes,
  startOfDay,
  format,
  parseISO,
  eachDayOfInterval,
} from "date-fns";

const SLOT_MINUTES = 15;
const HOUR_START = 12; // noon
const HOUR_END = 22; // 10 pm (exclusive)

interface AvailabilityCalendarProps {
  groupId: string;
  startDate: string;
  endDate: string;
}

function slotsToIntervals(
  slots: Set<string>
): Array<{ start: string; end: string }> {
  const sorted = Array.from(slots).sort();
  if (sorted.length === 0) return [];
  const intervals: Array<{ start: string; end: string }> = [];
  let currentStart = sorted[0];
  let currentEnd = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(currentEnd).getTime();
    const curr = new Date(sorted[i]).getTime();
    const gap = SLOT_MINUTES * 60 * 1000;
    if (curr - prev <= gap) {
      currentEnd = sorted[i];
    } else {
      intervals.push({
        start: currentStart,
        end: addMinutes(new Date(currentEnd), SLOT_MINUTES).toISOString(),
      });
      currentStart = sorted[i];
      currentEnd = sorted[i];
    }
  }
  intervals.push({
    start: currentStart,
    end: addMinutes(new Date(currentEnd), SLOT_MINUTES).toISOString(),
  });
  return intervals;
}

export function AvailabilityCalendar({
  groupId,
  startDate,
  endDate,
}: AvailabilityCalendarProps) {
  const start = startOfDay(parseISO(startDate));
  const end = parseISO(endDate);
  const days = eachDayOfInterval({ start, end });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove" | null>(null);
  const dragStartKeyRef = useRef<string | null>(null);
  const dragModeRef = useRef<"add" | "remove" | null>(null);
  const lastProcessedKeyRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSlotKey = useCallback(
    (day: Date, hour: number, slot: number) => {
      const d = addMinutes(startOfDay(day), hour * 60 + slot * SLOT_MINUTES);
      return d.toISOString();
    },
    [start]
  );

  const allSlotKeysRef = useRef<string[]>([]);
  if (allSlotKeysRef.current.length === 0) {
    const keys: string[] = [];
    days.forEach((day) => {
      for (let h = HOUR_START; h < HOUR_END; h++) {
        for (let s = 0; s < 60 / SLOT_MINUTES; s++) {
          keys.push(getSlotKey(day, h, s));
        }
      }
    });
    allSlotKeysRef.current = keys.sort();
  }

  function getSlotsInRange(keyA: string, keyB: string): string[] {
    const sorted = [keyA, keyB].sort();
    const low = sorted[0];
    const high = sorted[1];
    return allSlotKeysRef.current.filter((k) => k >= low && k <= high);
  }

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch(`/api/availability/me?groupId=${groupId}`);
      if (!res.ok) return;
      const data = await res.json();
      const intervals = data.intervals ?? [];
      const slots = new Set<string>();
      for (const i of intervals) {
        let t = new Date(i.start).getTime();
        const endTime = new Date(i.end).getTime();
        while (t < endTime) {
          const d = new Date(t);
          const hour = d.getHours();
          if (hour >= HOUR_START && hour < HOUR_END) {
            slots.add(d.toISOString());
          }
          t += SLOT_MINUTES * 60 * 1000;
        }
      }
      setSelected(slots);
    } catch {
      // Ignore - user may not have submitted yet
    }
  }, [groupId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  useEffect(() => {
    if (isDragging) {
      document.body.classList.add("dragging");
    } else {
      document.body.classList.remove("dragging");
    }
    return () => document.body.classList.remove("dragging");
  }, [isDragging]);

  const saveAvailability = useCallback(
    (slots: Set<string>) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const intervals = slotsToIntervals(slots);
          await fetch("/api/availability/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId, intervals }),
          });
        } catch (err) {
          console.error("Failed to save:", err);
        } finally {
          setLoading(false);
          saveTimeoutRef.current = null;
        }
      }, 500);
    },
    [groupId]
  );

  const isSelected = (key: string) => selected.has(key);

  const handlePointerDown = (key: string) => {
    const sel = isSelected(key);
    const mode = sel ? "remove" : "add";
    setDragMode(mode);
    dragModeRef.current = mode;
    setIsDragging(true);
    dragStartKeyRef.current = key;
    lastProcessedKeyRef.current = key;
    setSelected((prev) => {
      const next = new Set(prev);
      if (sel) next.delete(key);
      else next.add(key);
      saveAvailability(next);
      return next;
    });
  };

  const handlePointerEnter = (key: string) => {
    if (!dragModeRef.current || !dragStartKeyRef.current) return;
    if (key === lastProcessedKeyRef.current) return;
    lastProcessedKeyRef.current = key;

    const slotsInRange = getSlotsInRange(dragStartKeyRef.current, key);
    const mode = dragModeRef.current;
    setSelected((prev) => {
      const next = new Set(prev);
      for (const slotKey of slotsInRange) {
        if (mode === "add") next.add(slotKey);
        else next.delete(slotKey);
      }
      saveAvailability(next);
      return next;
    });
  };

  useEffect(() => {
    const up = () => {
      setIsDragging(false);
      setDragMode(null);
      dragModeRef.current = null;
      dragStartKeyRef.current = null;
      lastProcessedKeyRef.current = null;
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    document.addEventListener("visibilitychange", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.removeEventListener("visibilitychange", up);
    };
  }, []);

  const slotsPerHour = 60 / SLOT_MINUTES;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragModeRef.current || !dragStartKeyRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const key = el?.getAttribute?.("data-slot-key");
      if (key && key !== lastProcessedKeyRef.current) {
        lastProcessedKeyRef.current = key;
        const slotsInRange = getSlotsInRange(dragStartKeyRef.current, key);
        const mode = dragModeRef.current;
        setSelected((prev) => {
          const next = new Set(prev);
          for (const slotKey of slotsInRange) {
            if (mode === "add") next.add(slotKey);
            else next.delete(slotKey);
          }
          saveAvailability(next);
          return next;
        });
      }
    },
    [saveAvailability]
  );

  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900 ${
        isDragging ? "touch-none select-none" : ""
      }`}
      style={isDragging ? { touchAction: "none" } : undefined}
      onPointerLeave={() => {
        if (dragStartKeyRef.current) {
          setIsDragging(false);
          setDragMode(null);
          dragModeRef.current = null;
          dragStartKeyRef.current = null;
          lastProcessedKeyRef.current = null;
        }
      }}
    >
      {loading && (
        <p className="mb-3 sm:mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Saving…
        </p>
      )}
      <div className="overflow-x-auto -mx-3 sm:mx-0 overflow-y-auto overscroll-contain">
        <div className="min-w-[480px] sm:min-w-[800px] px-3 sm:px-0">
          <div className="mb-2 grid gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `minmax(44px,44px) repeat(${days.length}, minmax(28px,1fr))`,
              }}
            >
              <div />
              {days.map((d) => (
                <div key={d.toISOString()} className="text-center font-medium truncate">
                  {format(d, "EEE M/d")}
                </div>
              ))}
            </div>
          </div>
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto overscroll-contain">
            {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i).map((hour) =>
              Array.from({ length: slotsPerHour }).map((_, slotIndex) => (
                <div
                  key={`${hour}-${slotIndex}`}
                  className="grid gap-0.5 sm:gap-1"
                  style={{
                    gridTemplateColumns: `minmax(44px,44px) repeat(${days.length}, minmax(28px,1fr))`,
                  }}
                >
                  <div className="py-0.5 pr-1 sm:pr-2 text-right text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                    {slotIndex === 0 &&
                      format(addMinutes(start, hour * 60), "h a")}
                  </div>
                  {days.map((day) => {
                    const key = getSlotKey(day, hour, slotIndex);
                    const selectedSlot = isSelected(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        data-slot-key={key}
                        className={`min-h-[28px] sm:min-h-0 sm:h-4 rounded transition-colors touch-manipulation select-none active:scale-[0.98] [-webkit-tap-highlight-color:transparent] ${
                          selectedSlot
                            ? "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-600"
                            : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:bg-zinc-200 dark:active:bg-zinc-700"
                        }`}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          (e.target as HTMLElement).setPointerCapture(e.pointerId);
                          handlePointerDown(key);
                        }}
                        onPointerMove={handlePointerMove}
                        onPointerEnter={() => handlePointerEnter(key)}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
        Green = available. Tap and drag to select or deselect.
      </p>
    </div>
  );
}
