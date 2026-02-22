"use client";

interface MatchWindow {
  start: string;
  end: string;
  participants: string[];
  participantNames: string[];
  score: number;
  totalParticipants: number;
}

interface ResultsListProps {
  windows: MatchWindow[];
  totalParticipants: number;
}

export function ResultsList({ windows, totalParticipants }: ResultsListProps) {
  if (windows.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Best times
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          No matching windows found. Ask participants to add their availability.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Best times
      </h2>
      <ul className="space-y-3">
        {windows.slice(0, 20).map((w, i) => (
          <li
            key={`${w.start}-${w.end}-${i}`}
            className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-2 rounded-lg border border-zinc-200 p-3 sm:p-4 dark:border-zinc-700"
          >
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {new Date(w.start).toLocaleString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                –{" "}
                {new Date(w.end).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {w.participants.length} of {w.totalParticipants} available
                {w.participantNames.length > 0 &&
                  `: ${w.participantNames.join(", ")}`}
              </p>
            </div>
            <div
              className="rounded-full px-3 py-1 text-sm font-medium"
              data-slot-start={w.start}
              data-slot-end={w.end}
            >
              {w.participants.length === totalParticipants ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                  Everyone
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                  Partial
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
