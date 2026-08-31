"use client";

import Link from "next/dist/client/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
      <style>{`footer { display: none !important; }`}</style>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="font-supporting text-body max-w-sm">
        An unexpected error occurred on our end. It&apos;s not you — try again
        in a moment.
      </p>
      <div className="bg-red-50 text-red-800 p-4 rounded-lg text-left overflow-auto max-w-2xl w-full text-xs">
        <p className="font-bold">{error.name}: {error.message}</p>
        <pre className="mt-2">{error.stack}</pre>
        <p className="mt-2 text-slate-500">Digest: {error.digest}</p>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={reset}
          className="bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2.5 font-semibold"
        >
          Try again
        </button>
        <Link prefetch={false}
          href="/"
          className="border border-border text-heading rounded-lg px-5 py-2.5 font-semibold"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
