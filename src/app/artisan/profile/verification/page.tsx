import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VerificationFlow } from "@/components/dashboard/verification-flow";

export default async function ArtisanVerificationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [
    { data: profile },
    { data: kycRequest },
  ] = await Promise.all([
    supabase.from("profiles").select("is_verified").eq("id", user.id).single(),
    supabase.from("verification_requests").select("status, notes").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  return (
    <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-8 min-h-[80vh]">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-heading">Identity Verification</h1>
          <p className="text-base text-body/80 mt-2">
            Submit your documents to get verified. Verified artisans receive a badge that increases trust and visibility.
          </p>
        </div>
      </div>

      <VerificationFlow 
        isVerified={profile?.is_verified ?? false}
        kycStatus={kycRequest?.status ?? null}
        kycNotes={kycRequest?.notes ?? null}
      />
    </main>
  );
}
