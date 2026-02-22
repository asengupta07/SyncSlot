"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export function AuthHeader({ backHref, backLabel }: AuthHeaderProps = {}) {
  const router = useRouter();
  const [user, setUser] = useState<{ _id: string; username: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sticky top-0 z-10">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link
          href="/"
          className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          SyncSlot
        </Link>
        {!loading && (
          <nav className="flex items-center gap-2 sm:gap-4">
            {backHref && backLabel && (
              <Link
                href={backHref}
                className="text-xs sm:text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 py-2 px-1 -mx-1"
              >
                {backLabel}
              </Link>
            )}
            {user ? (
              <>
                <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[100px] sm:max-w-none">
                  Hi, {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-zinc-900 px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
