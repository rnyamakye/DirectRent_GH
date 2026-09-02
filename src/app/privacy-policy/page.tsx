export default function PrivacyPolicyPage() {
    return (
        <main className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
            <p className="font-supporting text-sm text-body">Last updated: July 2026</p>

            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-heading">1. What we collect</h2>
                <p className="font-supporting text-sm text-body">
                    When you register, we collect your name, email address, and
                    password (stored securely by our authentication provider — we
                    never see or store your password in plain text). Agents and
                    artisans additionally provide a business name or trade, and any
                    listing/profile details they choose to add, including photos.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-heading">2. How we use it</h2>
                <p className="font-supporting text-sm text-body">
                    Your information is used to operate your account, display your
                    listings/profile to other users, and show reviews you&apos;ve left
                    or received. We do not sell your personal information to third
                    parties.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-heading">3. What&apos;s public</h2>
                <p className="font-supporting text-sm text-body">
                    Your full name, and any listing, artisan profile, or review
                    content you create, is visible to anyone using the platform —
                    including people who aren&apos;t logged in. Your email address and
                    password are never shown publicly.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-heading">4. Payments</h2>
                <p className="font-supporting text-sm text-body">
                    Mobile Money payments for boosted listings/profiles are processed
                    by a third-party payment provider (Paystack or Hubtel). We do not
                    store your Mobile Money PIN or full payment details ourselves.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-heading">5. Account deletion</h2>
                <p className="font-supporting text-sm text-body">
                    You can permanently delete your account at any time from your
                    profile settings. This removes your profile and associated data
                    from our systems.
                </p>
            </section>
        </main>
    );
}
