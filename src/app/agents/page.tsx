import { createClient } from "@/lib/supabase/server";
import { AgentsPageClient } from "@/components/agents-page-client";
import { redirect } from "next/navigation";

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnTo=/agents");
  }

  // 1. Fetch all agent profiles
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, business_name, avatar_url, created_at")
    .eq("role", "agent");

  // 2. Fetch all reviews targeting agents to compute average ratings
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("target_id, rating")
    .eq("target_type", "agent");

  const ratingsByAgent = new Map<string, { total: number; count: number }>();
  (allReviews ?? []).forEach((r) => {
    const entry = ratingsByAgent.get(r.target_id) ?? { total: 0, count: 0 };
    entry.total += r.rating;
    entry.count += 1;
    ratingsByAgent.set(r.target_id, entry);
  });

  // 3. Fetch all active listings to compute active listing counts per agent
  const { data: allListings } = await supabase
    .from("listings")
    .select("agent_id")
    .eq("status", "available");

  const listingsByAgent = new Map<string, number>();
  (allListings ?? []).forEach((l) => {
    if (l.agent_id) {
      const current = listingsByAgent.get(l.agent_id) ?? 0;
      listingsByAgent.set(l.agent_id, current + 1);
    }
  });

  // 3.5 Fetch saved profiles if logged in
  let savedAgentIds = new Set<string>();
  if (user) {
    const { data: savedData } = await supabase
      .from("saved_profiles")
      .select("profile_id")
      .eq("renter_id", user.id);
    if (savedData) {
      savedAgentIds = new Set(savedData.map((s) => s.profile_id));
    }
  }

  // 4. Map into the format expected by the client component
  const agents = (profilesData ?? []).map((row) => {
    const ratingEntry = ratingsByAgent.get(row.id);
    const listingCount = listingsByAgent.get(row.id) ?? 0;
    
    return {
      id: row.id,
      fullName: row.id === user?.id ? "You" : row.full_name,
      businessName: row.id === user?.id ? "You" : row.business_name,
      avatarUrl: row.avatar_url,
      averageRating: ratingEntry ? ratingEntry.total / ratingEntry.count : null,
      reviewCount: ratingEntry?.count ?? 0,
      activeListingsCount: listingCount,
      memberSince: new Date(row.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      isSaved: savedAgentIds.has(row.id),
    };
  });

  return <AgentsPageClient agents={agents} />;
}
