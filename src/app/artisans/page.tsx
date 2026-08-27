import { createClient } from "@/lib/supabase/server";
import { ArtisansPageClient } from "@/components/artisans-page-client";
import { redirect } from "next/navigation";

export default async function ArtisansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?returnTo=/artisans");
  }

  const { data } = await supabase
    .from("artisan_profiles")
    .select("*, profiles(full_name, avatar_url)")
    .order("boosted_until", { ascending: false, nullsFirst: false });

  // One extra query to compute a real average rating per artisan,
  // rather than showing a card with no rating at all (which reads as
  // broken/unfinished on a marketplace card, not just "no data yet").
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("target_id, rating")
    .eq("target_type", "artisan");

  const ratingsByArtisan = new Map<string, { total: number; count: number }>();
  (allReviews ?? []).forEach((r) => {
    const entry = ratingsByArtisan.get(r.target_id) ?? { total: 0, count: 0 };
    entry.total += r.rating;
    entry.count += 1;
    ratingsByArtisan.set(r.target_id, entry);
  });

  // Fetch saved profiles if logged in
  let savedArtisanIds = new Set<string>();
  if (user) {
    const { data: savedData } = await supabase
      .from("saved_profiles")
      .select("profile_id")
      .eq("renter_id", user.id);
    if (savedData) {
      savedArtisanIds = new Set(savedData.map((s) => s.profile_id));
    }
  }

  const artisans = (data ?? []).map((row) => {
    const ratingEntry = ratingsByArtisan.get(row.id);
    return {
      id: row.id as string,
      name: row.id === user?.id ? "You" : (row.profiles?.full_name ?? "Artisan"),
      trade: row.trade as string,
      area: row.service_area ?? "",
      bio: row.bio ?? "",
      photoUrl: row.profiles?.avatar_url ?? row.photo_urls?.[0] ?? null,
      available: row.availability === "available",
      isBoosted: !!row.boosted_until && new Date(row.boosted_until) > new Date(),
      averageRating: ratingEntry ? ratingEntry.total / ratingEntry.count : null,
      reviewCount: ratingEntry?.count ?? 0,
      isSaved: savedArtisanIds.has(row.id),
    };
  });

  return <ArtisansPageClient artisans={artisans} />;
}