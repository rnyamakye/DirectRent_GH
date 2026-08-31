import Link from "next/link";

export default async function ArtisanBoostFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="flex flex-col items-center text-center gap-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold text-accent">Payment failed</h1>
      <p className="font-supporting text-sm text-body">
        {reason ?? "Something went wrong processing your payment."}
      </p>
      <div className="flex gap-3 pt-2">
        <Link prefetch={false}
          href="/artisan/boost"
          className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Try again
        </Link>
        <Link prefetch={false}
          href="/artisan/dashboard"
          className="border border-border rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}