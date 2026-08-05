# My Reviews Received

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/artisan/reviews`
- **File:** `page.tsx`
- **Access:** Artisan
- **Layout pattern:** List view

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. All reviews received (reviewer name, rating, comment, date)
2. Aggregate star average + breakdown bar chart

## Inbound links (what brings a user here)

- /artisan/dashboard
- Artisan sidebar nav

## Outbound links (where this page sends users)

- /artisan/dashboard

## Nav / button routes

- Back → /artisan/dashboard

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/artisan` prefix requires a signed-in artisan). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
