# Boost Success

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/artisan/boost/success`
- **File:** `page.tsx`
- **Access:** Artisan
- **Layout pattern:** Centered confirmation card

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Success message + boost expiry date
2. View public profile button
3. Dashboard button

## Inbound links (what brings a user here)

- /artisan/boost (on success)

## Outbound links (where this page sends users)

- /artisans/[id]
- /artisan/dashboard

## Nav / button routes

- View profile → /artisans/[id]
- Dashboard → /artisan/dashboard

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/artisan` prefix requires a signed-in artisan). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
