# My Reviews

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/renter/reviews`
- **File:** `page.tsx`
- **Access:** Renter
- **Layout pattern:** List view, one review per row

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Reviews left by the renter (listing/artisan name, rating, date)
2. Edit / delete own review actions

## Inbound links (what brings a user here)

- /renter/dashboard
- Renter sidebar nav

## Outbound links (where this page sends users)

- /listings/[id]
- /artisans/[id]

## Nav / button routes

- Listing name → /listings/[id]
- Artisan name → /artisans/[id]

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/renter` prefix requires a signed-in renter). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
