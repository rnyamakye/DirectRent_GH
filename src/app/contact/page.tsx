import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ContactForm from "./contact-form";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex-1 px-6 py-24 max-w-2xl mx-auto w-full flex flex-col items-center justify-center text-center gap-6">
        <h1 className="text-3xl font-bold text-heading">Contact Us</h1>
        <p className="font-supporting text-lg text-body max-w-md">
          To ensure the best support experience and prevent spam, please log in or create an account before contacting our team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <Link 
            href="/auth/login"
            className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition hover:bg-primary-hover shadow-sm w-full sm:w-auto"
          >
            Log In
          </Link>
          <Link 
            href="/auth/register"
            className="rounded-full bg-card border border-border px-8 py-3 text-sm font-bold text-heading transition hover:bg-slate-50 shadow-sm w-full sm:w-auto"
          >
            Sign Up
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-heading mb-3">Contact Us</h1>
        <p className="font-supporting text-base text-body">
          Have a question or need assistance? We&apos;re here to help. Reach out to us using any of the methods below.
        </p>
      </div>

      <div className="mt-4">
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-heading">Email Support</h3>
          <p className="font-supporting text-sm text-body mb-2">For general inquiries and support.</p>
          <a href="mailto:support@directrent.gh" className="text-sm font-medium text-primary hover:text-primary-hover">support@directrent.gh</a>
        </div>
      </div>

      <section className="flex flex-col gap-4 mt-6">
        <h2 className="text-xl font-semibold text-heading">Send us a message</h2>
        <ContactForm />
      </section>
    </main>
  );
}
