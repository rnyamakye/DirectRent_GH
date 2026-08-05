# Saved Listings

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/renter/saved`
- **File:** `page.tsx`
- **Access:** Renter
- **Layout pattern:** Card grid, same shell as listings feed

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Saved listing cards (with unsave button)
2. Empty state with Browse CTA

## Inbound links (what brings a user here)

- /renter/dashboard
- Renter sidebar nav

## Outbound links (where this page sends users)

- /listings/[id]
- /listings

## Nav / button routes

- Card click → /listings/[id]
- Browse CTA → /listings

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/renter` prefix requires a signed-in renter). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
