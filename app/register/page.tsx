import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { AuthHeader } from "@/components/AuthHeader";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AuthHeader />
      <main className="mx-auto max-w-md px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="mb-2 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Create an account
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Username, password, and display name. No email needed.
          </p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:no-underline">
            Log in
          </Link>
        </p>
      </main>
    </div>
  );
}
