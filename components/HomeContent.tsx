"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { GroupCreator } from "@/components/GroupCreator";
import { JoinGroup } from "@/components/JoinGroup";
import { AuthHeader } from "@/components/AuthHeader";

function JoinGroupFallback() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

function AuthPrompt() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Log in or register to create or join groups
      </h2>
      <p className="mb-4 sm:mb-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
        Create an account to save your groups and availability across devices.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-zinc-900 px-6 py-2.5 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-zinc-300 px-6 py-2.5 font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

export function HomeContent() {
  const [user, setUser] = useState<{ _id: string } | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <AuthHeader />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AuthHeader />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="mb-2 sm:mb-3 text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Find the best time for everyone
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Mark your availability. We&apos;ll find when everyone can meet.
          </p>
        </div>
        {user ? (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            <GroupCreator />
            <Suspense fallback={<JoinGroupFallback />}>
              <JoinGroup />
            </Suspense>
          </div>
        ) : (
          <AuthPrompt />
        )}
      </main>
    </div>
  );
}
