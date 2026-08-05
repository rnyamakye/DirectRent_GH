# Agent Dashboard

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/agent/dashboard`
- **File:** `page.tsx`
- **Access:** Agent
- **Layout pattern:** Left sidebar nav + stats cards + table

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Stats row: total listings, total views, active boosts, avg rating
2. My listings table (title, status, views, boost status)
3. Quick actions: Add listing, Boost listing
4. Recent reviews received

## Inbound links (what brings a user here)

- /auth/login (on success)
- /auth/register (on success)
- Nav bar (Agent)

## Outbound links (where this page sends users)

- /agent/listings/new
- /agent/listings/[id]/edit
- /agent/listings/[id]/boost
- /agent/profile
- /listings/[id]

## Nav / button routes

- Add listing → /agent/listings/new
- Edit → /agent/listings/[id]/edit
- Boost → /agent/listings/[id]/boost
- View public → /listings/[id]

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/agent` prefix requires a signed-in agent). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
