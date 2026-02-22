"use client";

import { useState, useEffect, useCallback } from "react";
import { ResultsHeatmap } from "./ResultsHeatmap";
import { ResultsList } from "./ResultsList";
import { FinaliseSlot } from "./FinaliseSlot";
import { MemberAvailabilityView } from "./MemberAvailabilityView";

interface MatchWindow {
  start: string;
  end: string;
  participants: string[];
  participantNames: string[];
  score: number;
  totalParticipants: number;
}

interface ResultsViewProps {
  group: {
    _id: string;
    name: string;
    creatorId: string;
    startDate: string;
    endDate: string;
    members?: { _id: string; name: string }[];
    finalisedSlot?: { start: string; end: string };
  };
}

export function ResultsView({ group }: ResultsViewProps) {
  const [windows, setWindows] = useState<MatchWindow[]>([]);
  const [perfectMatch, setPerfectMatch] = useState(false);
  const [membersWithoutAvailability, setMembersWithoutAvailability] = useState<
    { userId: string; userName: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/match/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: group._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to run matching");
      setWindows(data.windows ?? []);
      setPerfectMatch(data.perfectMatch ?? false);
      setMembersWithoutAvailability(data.membersWithoutAvailability ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [group._id]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {group.name}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          {perfectMatch
            ? "Times when everyone is available"
            : "Best options when not everyone can make it"}
        </p>
      </div>

      {group.finalisedSlot && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <h2 className="mb-2 font-semibold text-green-800 dark:text-green-200">
            Finalised time
          </h2>
          <p className="text-green-700 dark:text-green-300">
            {new Date(group.finalisedSlot.start).toLocaleString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}{" "}
            –{" "}
            {new Date(group.finalisedSlot.end).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
      )}

      {loading && (
        <p className="text-zinc-500 dark:text-zinc-400">Computing matches…</p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {membersWithoutAvailability.length > 0 && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <h2 className="mb-2 font-semibold text-amber-800 dark:text-amber-200">
                Pending availability
              </h2>
              <p className="mb-2 text-sm text-amber-700 dark:text-amber-300">
                The following member{membersWithoutAvailability.length > 1 ? "s have" : " has"} not
                marked their available times yet:
              </p>
              <ul className="list-inside list-disc text-sm text-amber-800 dark:text-amber-200">
                {membersWithoutAvailability.map((m) => (
                  <li key={m.userId}>{m.userName}</li>
                ))}
              </ul>
            </div>
          )}
          <ResultsHeatmap
            windows={windows}
            startDate={group.startDate}
            endDate={group.endDate}
          />
          <div className="mt-8">
            <MemberAvailabilityView
              groupId={group._id}
              startDate={group.startDate}
              endDate={group.endDate}
              members={group.members ?? []}
            />
          </div>
          <div className="mt-8">
            <ResultsList windows={windows} totalParticipants={windows[0]?.totalParticipants ?? 0} />
          </div>
          <div className="mt-8">
            <FinaliseSlot
              groupId={group._id}
              windows={windows}
              finalisedSlot={group.finalisedSlot}
              onFinalised={fetchResults}
            />
          </div>
        </>
      )}
    </div>
  );
}
