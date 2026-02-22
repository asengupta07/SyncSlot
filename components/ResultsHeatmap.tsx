"use client";

import {
  addMinutes,
  startOfDay,
  format,
  parseISO,
  eachDayOfInterval,
  isWithinInterval,
} from "date-fns";

const SLOT_MINUTES = 30;
const HOUR_START = 12; // noon
const HOUR_END = 22; // 10 pm (exclusive)

interface MatchWindow {
  start: string;
  end: string;
  participants: string[];
  participantNames: string[];
  score: number;
  totalParticipants: number;
}

interface ResultsHeatmapProps {
  windows: MatchWindow[];
  startDate: string;
  endDate: string;
}

export function ResultsHeatmap({
  windows,
  startDate,
  endDate,
}: ResultsHeatmapProps) {
  const start = startOfDay(parseISO(startDate));
  const end = parseISO(endDate);
  const days = eachDayOfInterval({ start, end });
  const slotsPerHour = 60 / SLOT_MINUTES;
  const totalSlots = (HOUR_END - HOUR_START) * slotsPerHour;

  const getCount = (day: Date, slotIndex: number) => {
    const slotStart = addMinutes(
      startOfDay(day),
      HOUR_START * 60 +
        Math.floor(slotIndex / slotsPerHour) * 60 +
        (slotIndex % slotsPerHour) * SLOT_MINUTES
    );
    const slotEnd = addMinutes(slotStart, SLOT_MINUTES);
    let maxCount = 0;
    for (const w of windows) {
      const wStart = new Date(w.start);
      const wEnd = new Date(w.end);
      const overlaps =
        isWithinInterval(slotStart, { start: wStart, end: wEnd }) ||
        isWithinInterval(slotEnd, { start: wStart, end: wEnd }) ||
        (slotStart <= wStart && slotEnd >= wEnd);
      if (overlaps && w.participants.length > maxCount) {
        maxCount = w.participants.length;
      }
    }
    return maxCount;
  };

  const maxParticipants = Math.max(
    ...windows.map((w) => w.participants.length),
    1
  );

  const getColor = (count: number) => {
    if (count === 0) return "bg-zinc-100 dark:bg-zinc-800";
    const intensity = count / maxParticipants;
    if (intensity >= 1) return "bg-emerald-600";
    if (intensity >= 0.75) return "bg-emerald-500";
    if (intensity >= 0.5) return "bg-emerald-400";
    if (intensity >= 0.25) return "bg-emerald-300";
    return "bg-emerald-200 dark:bg-emerald-900/50";
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Availability heatmap
      </h2>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Darker = more people available
      </p>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="min-w-[min(600px,100%)]">
          <div className="grid gap-1 text-xs">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `60px repeat(${days.length}, 1fr)`,
              }}
            >
              <div />
              {days.map((d) => (
                <div
                  key={d.toISOString()}
                  className="text-center font-medium text-zinc-600 dark:text-zinc-400"
                >
                  {format(d, "EEE M/d")}
                </div>
              ))}
            </div>
            {Array.from({ length: totalSlots }).map((_, slotIndex) => (
                <div
                  key={slotIndex}
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `60px repeat(${days.length}, 1fr)`,
                  }}
                >
                  <div className="py-0.5 pr-2 text-right text-xs text-zinc-500 dark:text-zinc-400">
                    {slotIndex % slotsPerHour === 0 &&
                      format(
                        addMinutes(
                          start,
                          HOUR_START * 60 +
                            Math.floor(slotIndex / slotsPerHour) * 60
                        ),
                        "h a"
                      )}
                  </div>
                  {days.map((day) => {
                    const count = getCount(day, slotIndex);
                    return (
                      <div
                        key={`${day.toISOString()}-${slotIndex}`}
                        className={`h-3 rounded ${getColor(count)}`}
                        title={`${count} available`}
                      />
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
