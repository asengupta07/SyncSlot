"use client";

import { useState, useEffect } from "react";
import {
  addMinutes,
  startOfDay,
  format,
  parseISO,
  eachDayOfInterval,
  isWithinInterval,
} from "date-fns";

const SLOT_MINUTES = 15;
const HOUR_START = 12;
const HOUR_END = 22;

interface MemberAvailabilityViewProps {
  groupId: string;
  startDate: string;
  endDate: string;
  members: { _id: string; name: string }[];
}

interface MemberAvailability {
  userId: string;
  userName: string;
  intervals: { start: string; end: string }[];
}

export function MemberAvailabilityView({
  groupId,
  startDate,
  endDate,
  members,
}: MemberAvailabilityViewProps) {
  const [availabilities, setAvailabilities] = useState<MemberAvailability[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailabilities() {
      try {
        const res = await fetch(`/api/availability/group/${groupId}`);
        if (!res.ok) return;
        const data = await res.json();
        setAvailabilities(data ?? []);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    fetchAvailabilities();
  }, [groupId]);

  const availabilityMap = new Map(
    availabilities.map((a) => [a.userId, a])
  );

  const start = startOfDay(parseISO(startDate));
  const end = parseISO(endDate);
  const days = eachDayOfInterval({ start, end });
  const slotsPerHour = 60 / SLOT_MINUTES;
  const totalSlots = (HOUR_END - HOUR_START) * slotsPerHour;

  const isSlotAvailable = (
    intervals: { start: string; end: string }[],
    day: Date,
    slotIndex: number
  ) => {
    const slotStart = addMinutes(
      startOfDay(day),
      HOUR_START * 60 +
        Math.floor(slotIndex / slotsPerHour) * 60 +
        (slotIndex % slotsPerHour) * SLOT_MINUTES
    );
    const slotEnd = addMinutes(slotStart, SLOT_MINUTES);
    return intervals.some((i) => {
      const wStart = new Date(i.start);
      const wEnd = new Date(i.end);
      return (
        isWithinInterval(slotStart, { start: wStart, end: wEnd }) ||
        isWithinInterval(slotEnd, { start: wStart, end: wEnd }) ||
        (slotStart <= wStart && slotEnd >= wEnd)
      );
    });
  };

  if (members.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Member availability
      </h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        Expand to see each member&apos;s available times
      </p>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading…
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const avail = availabilityMap.get(member._id);
            const hasAvailability = avail && avail.intervals.length > 0;
            const isExpanded = expandedId === member._id;

            return (
              <div
                key={member._id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : member._id)
                  }
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {member.name}
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    {hasAvailability ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {avail!.intervals.length} block
                        {avail!.intervals.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">
                        Not marked yet
                      </span>
                    )}
                    <span
                      className={`text-zinc-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
                    {hasAvailability ? (
                      <div className="overflow-x-auto">
                        <div
                          className="inline-block min-w-[280px]"
                          style={{
                            width: `max(280px, ${52 + days.length * 40}px)`,
                          }}
                        >
                          <div className="grid gap-0.5 text-[10px]">
                            <div
                              className="grid gap-0.5"
                              style={{
                                gridTemplateColumns: `48px repeat(${days.length}, minmax(36px, 1fr))`,
                              }}
                            >
                              <div />
                              {days.map((d) => (
                                <div
                                  key={d.toISOString()}
                                  className="text-center font-medium text-zinc-500 dark:text-zinc-400 truncate"
                                >
                                  {format(d, "EEE")}
                                </div>
                              ))}
                            </div>
                            {Array.from({ length: totalSlots }).map(
                              (_, slotIndex) => (
                                <div
                                  key={slotIndex}
                                  className="grid gap-0.5"
                                  style={{
                                    gridTemplateColumns: `48px repeat(${days.length}, minmax(36px, 1fr))`,
                                  }}
                                >
                                  <div className="py-0.5 pr-1 text-right text-zinc-500 dark:text-zinc-400">
                                    {slotIndex % slotsPerHour === 0 &&
                                      format(
                                        addMinutes(
                                          start,
                                          HOUR_START * 60 +
                                            Math.floor(
                                              slotIndex / slotsPerHour
                                            ) * 60
                                        ),
                                        "h a"
                                      )}
                                  </div>
                                  {days.map((day) => {
                                    const filled = isSlotAvailable(
                                      avail!.intervals,
                                      day,
                                      slotIndex
                                    );
                                    return (
                                      <div
                                        key={`${day.toISOString()}-${slotIndex}`}
                                        className={`h-2 rounded-sm ${
                                          filled
                                            ? "bg-emerald-500"
                                            : "bg-zinc-200 dark:bg-zinc-700"
                                        }`}
                                      />
                                    );
                                  })}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        This member has not marked their available times yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
