# Boost Failed

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/artisan/boost/failed`
- **File:** `page.tsx`
- **Access:** Artisan
- **Layout pattern:** Centered error card

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Failure message + reason
2. Retry button
3. Dashboard button

## Inbound links (what brings a user here)

- /artisan/boost (on failure)

## Outbound links (where this page sends users)

- /artisan/boost
- /artisan/dashboard

## Nav / button routes

- Retry → /artisan/boost
- Dashboard → /artisan/dashboard

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/artisan` prefix requires a signed-in artisan). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
