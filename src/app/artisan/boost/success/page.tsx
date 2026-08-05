import Link from "next/link";

export default async function ArtisanBoostSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days } = await searchParams;

  return (
    <div className="flex flex-col items-center text-center gap-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold text-primary">Boost activated 🎉</h1>
      <p className="font-supporting text-sm text-body">
        Your profile is now boosted for the next {days ?? "—"} days and will
        show at the top of the artisans feed.
      </p>
      <div className="flex gap-3 pt-2">
        <Link
          href="/artisans"
          className="border border-border rounded-lg px-4 py-2 text-sm font-semibold"
        >
          View public profile
        </Link>
        <Link
          href="/artisan/dashboard"
          className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}