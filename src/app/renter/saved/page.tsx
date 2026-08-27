import { createClient } from "@/lib/supabase/server";
import { SavedListingsClient } from "@/components/saved-listings-client";

export default async function SavedListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("saved_listings")
    .select("listing_id, listings(*)")
    .eq("renter_id", user.id);

  const savedListings = (data ?? [])
    .map((row) => row.listings)
    .filter((listing) => listing !== null)
    .map((l: any) => ({
      id: l.id,
      title: l.title,
      city: l.city || "Ghana",
      propertyType: l.property_type || "Room",
      price: l.price,
      photoUrl: l.photo_urls?.[0] || null,
      rating: null,
      isSaved: true,
      isUnavailable: l.status !== "available",
      isBoosted: !!l.boosted_until && new Date(l.boosted_until) > new Date(),
    }));

  const { data: savedProfilesData } = await supabase
    .from("saved_profiles")
    .select("profile_id")
    .eq("renter_id", user.id);
    
  const savedProfileIds = (savedProfilesData ?? []).map(r => r.profile_id);

  let savedAgents: any[] = [];
  let savedArtisans: any[] = [];

  if (savedProfileIds.length > 0) {
    const { data: agentData } = await supabase
      .from("profiles")
      .select("id, full_name, business_name, avatar_url, created_at")
      .eq("role", "agent")
      .in("id", savedProfileIds);
      
    savedAgents = (agentData ?? []).map((row: any) => ({
      id: row.id,
      fullName: row.id === user.id ? "You" : row.full_name,
      businessName: row.id === user.id ? "You" : row.business_name,
      avatarUrl: row.avatar_url,
      averageRating: null,
      reviewCount: 0,
      activeListingsCount: 0,
      memberSince: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      isSaved: true,
    }));

    const { data: artisanData } = await supabase
      .from("artisan_profiles")
      .select("*, profiles(full_name, avatar_url)")
      .in("id", savedProfileIds);
      
    savedArtisans = (artisanData ?? []).map((row: any) => ({
      id: row.id,
      name: row.id === user.id ? "You" : (row.profiles?.full_name ?? "Artisan"),
      trade: row.trade,
      area: row.service_area ?? "",
      bio: row.bio ?? "",
      photoUrl: row.profiles?.avatar_url ?? row.photo_urls?.[0] ?? null,
      available: row.availability === "available",
      isBoosted: !!row.boosted_until && new Date(row.boosted_until) > new Date(),
      averageRating: null,
      reviewCount: 0,
      isSaved: true,
    }));
  }

  return (
    <SavedListingsClient 
      initialSavedListings={savedListings} 
      initialSavedAgents={savedAgents} 
      initialSavedArtisans={savedArtisans} 
    />
  );
}