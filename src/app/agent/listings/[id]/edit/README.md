# Edit Listing

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/agent/listings/[id]/edit`
- **File:** `page.tsx`
- **Access:** Agent
- **Layout pattern:** Same multi-step form pre-filled

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Pre-filled form with existing listing data
2. Photo management (add / remove / reorder)
3. Mark as Unavailable / Delete listing options

## Inbound links (what brings a user here)

- /agent/dashboard (edit button)
- /agent/profile

## Outbound links (where this page sends users)

- /agent/dashboard
- /listings/[id]

## Nav / button routes

- Save → /agent/dashboard
- Cancel → /agent/dashboard
- View public → /listings/[id]

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/agent` prefix requires a signed-in agent). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
