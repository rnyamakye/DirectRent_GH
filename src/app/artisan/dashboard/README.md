# Artisan Dashboard

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/artisan/dashboard`
- **File:** `page.tsx`
- **Access:** Artisan
- **Layout pattern:** Left sidebar nav + stats + profile completeness

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Stats: profile views, avg rating, active boost status
2. Profile completeness progress bar
3. My services summary
4. Recent reviews received
5. Quick action: Edit profile, Boost profile

## Inbound links (what brings a user here)

- /auth/login (on success)
- /auth/register (on success)
- Nav bar (Artisan)

## Outbound links (where this page sends users)

- /artisan/profile/edit
- /artisan/boost
- /artisan/reviews
- /artisans/[id] (own public profile)

## Nav / button routes

- Edit profile → /artisan/profile/edit
- Boost → /artisan/boost
- My reviews → /artisan/reviews
- View public → /artisans/[id]

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/artisan` prefix requires a signed-in artisan). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
