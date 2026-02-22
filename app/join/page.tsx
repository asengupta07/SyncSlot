import { Suspense } from "react";
import Link from "next/link";
import { JoinGroup } from "@/components/JoinGroup";
import { AuthHeader } from "@/components/AuthHeader";

function JoinGroupFallback() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AuthHeader />
      <main className="mx-auto max-w-md px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="mb-2 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Join a group
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Log in first, then enter the join code shared with you.
          </p>
        </div>
        <Suspense fallback={<JoinGroupFallback />}>
          <JoinGroup />
        </Suspense>
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="underline hover:no-underline">
            Create a group instead
          </Link>
        </p>
      </main>
    </div>
  );
}
