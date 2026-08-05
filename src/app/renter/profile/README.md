# Renter Profile Settings

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/renter/profile`
- **File:** `page.tsx`
- **Access:** Renter
- **Layout pattern:** Form panel

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Edit name, email, avatar
2. Change password
3. Delete account (danger zone)

## Inbound links (what brings a user here)

- /renter/dashboard
- Renter sidebar nav

## Outbound links (where this page sends users)

- /auth/login (after deletion or logout)

## Nav / button routes

- Save → stays on page
- Delete account → /auth/login

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/renter` prefix requires a signed-in renter). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
