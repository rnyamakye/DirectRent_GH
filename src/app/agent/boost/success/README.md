# Boost Success

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/agent/boost/success`
- **File:** `page.tsx`
- **Access:** Agent
- **Layout pattern:** Centered confirmation card

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Success message + boost details (duration, expiry date)
2. View listing button
3. Back to dashboard button

## Inbound links (what brings a user here)

- /agent/listings/[id]/boost (on payment success)

## Outbound links (where this page sends users)

- /listings/[id]
- /agent/dashboard

## Nav / button routes

- View listing → /listings/[id]
- Dashboard → /agent/dashboard

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/agent` prefix requires a signed-in agent). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
