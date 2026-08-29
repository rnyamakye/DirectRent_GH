import { createClient } from "@/lib/supabase/server";
import { MarketingHome } from "@/components/marketing-home";
import { LoggedInHome } from "@/components/logged-in-home";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const [
      { count: usersCount },
      { count: listingsCount },
      { count: artisansCount },
      { data: blogPosts }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "available"),
      supabase.from("artisan_profiles").select("*", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id, title, excerpt, category, published_at, image").order("published_at", { ascending: false }).limit(3)
    ]);

    const stats = {
      users: usersCount ?? 0,
      listings: listingsCount ?? 0,
      artisans: artisansCount ?? 0
    };

    return <MarketingHome stats={stats} blogs={blogPosts ?? []} />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "agent") {
    redirect("/agent/dashboard");
  }

  if (profile?.role === "artisan") {
    redirect("/artisan/dashboard");
  }

  const { data: listingsData } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "available")
    .order("boosted_until", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(60);

  const listingIds = (listingsData ?? []).map(l => l.id);

  const { data: listingReviews } = await supabase
    .from("reviews")
    .select("target_id, rating")
    .eq("target_type", "listing")
    .in("target_id", listingIds.length ? listingIds : ['']);

  const ratingsByListing = new Map<string, { total: number; count: number }>();
  (listingReviews ?? []).forEach((r) => {
    const entry = ratingsByListing.get(r.target_id) ?? { total: 0, count: 0 };
    entry.total += r.rating;
    entry.count += 1;
    ratingsByListing.set(r.target_id, entry);
  });

  const { data: savedRows } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("renter_id", user.id);
  const savedIds = new Set((savedRows ?? []).map((r) => r.listing_id));

  const { data: savedProfileRows } = await supabase
    .from("saved_profiles")
    .select("profile_id")
    .eq("renter_id", user.id);
  const savedProfileIds = new Set((savedProfileRows ?? []).map((r) => r.profile_id));

  const allListings = (listingsData ?? []).map((l) => {
    const ratingEntry = ratingsByListing.get(l.id);
    return {
      id: l.id as string,
      title: l.title as string,
      city: (l.city as string) ?? "Ghana",
      propertyType: (l.property_type as string) ?? "Room",
      price: l.price as number,
      photoUrl: (l.photo_urls?.[0] as string) ?? null,
      rating: ratingEntry ? ratingEntry.total / ratingEntry.count : null,
      isSaved: savedIds.has(l.id),
      isBoosted: !!l.boosted_until && new Date(l.boosted_until) > new Date(),
    };
  });

  const cities = Array.from(new Set(allListings.map((l) => l.city))).slice(0, 4);
  const listingsByCity = cities
    .map((city) => ({
      title: `Popular homes in ${city}`,
      listings: allListings.filter((l) => l.city === city).slice(0, 10),
    }))
    .filter((group) => group.listings.length > 0);

  const newListings = allListings.slice(0, 10);

  const { data: artisanRows } = await supabase
    .from("artisan_profiles")
    .select("id, trade, photo_urls, boosted_until, profiles(full_name)")
    .order("boosted_until", { ascending: false, nullsFirst: false })
    .limit(10);

  const artisanIds = (artisanRows ?? []).map(a => a.id);

  const { data: artisanReviews } = await supabase
    .from("reviews")
    .select("target_id, rating")
    .eq("target_type", "artisan")
    .in("target_id", artisanIds.length ? artisanIds : ['']);

  const ratingsByArtisan = new Map<string, { total: number; count: number }>();
  (artisanReviews ?? []).forEach((r) => {
    const entry = ratingsByArtisan.get(r.target_id) ?? { total: 0, count: 0 };
    entry.total += r.rating;
    entry.count += 1;
    ratingsByArtisan.set(r.target_id, entry);
  });

  const artisans = (artisanRows ?? []).map((a) => {
    const ratingEntry = ratingsByArtisan.get(a.id);
    return {
      id: a.id as string,
      name: (a.profiles as any)?.full_name ?? "Artisan",
      trade: a.trade as string,
      photoUrl: (a.photo_urls?.[0] as string) ?? null,
      rating: ratingEntry ? ratingEntry.total / ratingEntry.count : null,
      isSaved: savedProfileIds.has(a.id),
      isBoosted: !!a.boosted_until && new Date(a.boosted_until) > new Date(),
    };
  });

  return (
    <LoggedInHome newListings={newListings} listingsByCity={listingsByCity} artisans={artisans} />
  );
}