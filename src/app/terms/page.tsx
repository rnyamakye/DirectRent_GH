export default function TermsPage() {
    return (
        <main className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Terms of Service</h1>
            <p className="font-supporting text-sm text-body">Last updated: July 2026</p>

            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-heading">1. What DirectRent GH is</h2>
                <p className="font-supporting text-sm text-body">
                    DirectRent GH is a platform connecting renters with agents listing
                    rooms and apartments, and with artisans offering home services. We
                    do not own, manage, or inspect any listed property, and we are not
                    a party to any agreement between renters, agents, or artisans.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-heading">2. Accounts</h2>
                <p className="font-supporting text-sm text-body">
                    You&apos;re responsible for the accuracy of the information you
                    provide when registering, and for keeping your password secure.
                    Agents and artisans are responsible for the accuracy of their own
                    listings and profiles.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-heading">3. No deposits before viewing</h2>
                <p className="font-supporting text-sm text-body">
                    Renters should never pay a deposit or service fee before meeting an
                    agent or artisan in person and verifying what is being offered.
                    DirectRent GH does not mediate, guarantee, or refund any payment
                    made directly between users.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-heading">4. Reviews</h2>
                <p className="font-supporting text-sm text-body">
                    Reviews must reflect a genuine interaction with the listing, agent,
                    or artisan being reviewed. We may remove reviews that are false,
                    abusive, or unrelated to an actual transaction.
                </p>
            </section>

            <section className="flex flex-col gap-2">
                <h2 className="font-semibold text-heading">5. Changes</h2>
                <p className="font-supporting text-sm text-body">
                    These terms may be updated from time to time. Continued use of the
                    platform after a change means you accept the updated terms.
                </p>
            </section>
        </main>
    );
}
