"use client";

import { useState } from "react";

interface MatchWindow {
  start: string;
  end: string;
  participants: string[];
  participantNames: string[];
  score: number;
  totalParticipants: number;
}

interface FinaliseSlotProps {
  groupId: string;
  windows: MatchWindow[];
  finalisedSlot?: { start: string; end: string };
  onFinalised: () => void;
}

export function FinaliseSlot({
  groupId,
  windows,
  finalisedSlot,
  onFinalised,
}: FinaliseSlotProps) {
  const [selected, setSelected] = useState<MatchWindow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFinalise() {
    if (!selected) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/group/${groupId}/finalise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: selected.start,
          end: selected.end,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to finalise");
      onFinalised();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (windows.length === 0) return null;
  if (finalisedSlot) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Time finalised
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          {new Date(finalisedSlot.start).toLocaleString()} –{" "}
          {new Date(finalisedSlot.end).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Finalise a time
      </h2>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Group creators can lock in a meeting time. Select a slot below and
        confirm.
      </p>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        {windows.slice(0, 10).map((w, i) => (
          <button
            key={`${w.start}-${i}`}
            type="button"
            onClick={() => setSelected(selected === w ? null : w)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selected === w
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {new Date(w.start).toLocaleString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleFinalise}
        disabled={!selected || loading}
        className="rounded-lg bg-zinc-900 px-6 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "Finalising…" : "Finalise selected time"}
      </button>
    </div>
  );
}
