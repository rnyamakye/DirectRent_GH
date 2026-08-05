# Renter Dashboard

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/renter/dashboard`
- **File:** `page.tsx`
- **Access:** Renter
- **Layout pattern:** Left sidebar nav + main content area

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Welcome banner + account summary
2. Saved listings panel (shortlist)
3. Recent activity (viewed, reviewed)
4. Quick search bar shortcut
5. Recommended listings (based on last search)

## Inbound links (what brings a user here)

- /auth/login (on success)
- /auth/register (on success)
- Nav bar (when logged in as Renter)

## Outbound links (where this page sends users)

- /listings
- /listings/[id]
- /renter/saved
- /renter/reviews
- /renter/profile

## Nav / button routes

- Browse listings → /listings
- Saved → /renter/saved
- My reviews → /renter/reviews
- Profile → /renter/profile

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/renter` prefix requires a signed-in renter). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
