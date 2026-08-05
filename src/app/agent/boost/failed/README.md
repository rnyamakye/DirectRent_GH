# Boost Failed

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/agent/boost/failed`
- **File:** `page.tsx`
- **Access:** Agent
- **Layout pattern:** Centered error card

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Failure message + reason (if provided by Paystack/Hubtel)
2. Retry button
3. Back to dashboard button

## Inbound links (what brings a user here)

- /agent/listings/[id]/boost (on payment failure)

## Outbound links (where this page sends users)

- /agent/listings/[id]/boost
- /agent/dashboard

## Nav / button routes

- Retry → /agent/listings/[id]/boost
- Dashboard → /agent/dashboard

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/agent` prefix requires a signed-in agent). Unauthenticated requests redirect to `/auth/login?returnTo=...`.

## Notes for whoever builds this out

The scaffolded page currently only links to /agent/dashboard — a real Retry button needs the listing id in scope to link back to /agent/listings/[id]/boost; that id isn't available yet since this page has no dynamic segment of its own. Likely needs the id passed via query param from the boost page's failure redirect.
