"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AuthHeader } from "@/components/AuthHeader";

interface GroupDashboardProps {
  group: {
    _id: string;
    name: string;
    description?: string;
    joinCode: string;
    members: Array<{ _id: string; name: string }>;
    finalisedSlot?: { start: string; end: string };
  };
}

export function GroupDashboard({ group }: GroupDashboardProps) {
  const joinPath = `/join?code=${group.joinCode}`;
  const [joinLink, setJoinLink] = useState(joinPath);
  useEffect(() => {
    setJoinLink(`${window.location.origin}${joinPath}`);
  }, [joinPath]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AuthHeader />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {group.name}
          </h1>
          {group.description && (
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              {group.description}
            </p>
          )}
        </div>

        <div className="mb-6 sm:mb-8 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Share with participants
          </h2>
          <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="rounded-lg bg-zinc-100 px-3 py-2 font-mono text-base sm:text-lg dark:bg-zinc-800">
              {group.joinCode}
            </code>
            <CopyButton text={group.joinCode} label="Copy code" />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={joinLink}
              className="flex-1 min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs sm:text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
            <CopyButton text={joinPath} label="Copy link" />
          </div>
        </div>

        <div className="mb-6 sm:mb-8 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Members ({group.members.length})
          </h2>
          <ul className="space-y-2">
            {group.members.map((m) => (
              <li
                key={m._id}
                className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <span className="h-2 w-2 rounded-full bg-zinc-400" />
                {m.name}
              </li>
            ))}
          </ul>
        </div>

        {group.finalisedSlot && (
          <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/30">
            <h2 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-200">
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

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <Link
            href={`/group/${group._id}/availability`}
            className="rounded-lg bg-zinc-900 px-6 py-3 sm:py-2.5 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-center min-h-[44px] flex items-center justify-center"
          >
            Mark availability
          </Link>
          <Link
            href={`/group/${group._id}/results`}
            className="rounded-lg border border-zinc-300 px-6 py-3 sm:py-2.5 font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 text-center min-h-[44px] flex items-center justify-center"
          >
            View results
          </Link>
        </div>
      </main>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const handleCopy = () => {
    const full = text.startsWith("/")
      ? `${window.location.origin}${text}`
      : text;
    navigator.clipboard.writeText(full);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg bg-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
    >
      {label}
    </button>
  );
}
