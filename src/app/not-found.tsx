import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
      <style>{`footer { display: none !important; }`}</style>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="font-supporting text-body max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="flex gap-3 pt-2">
        <Link
          href="/"
          className="bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2.5 font-semibold"
        >
          Go home
        </Link>
        <Link
          href="/listings"
          className="border border-border text-heading rounded-lg px-5 py-2.5 font-semibold"
        >
          Search listings
        </Link>
      </div>
    </main>
  );
}
