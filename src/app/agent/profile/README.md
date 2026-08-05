# Agent Profile

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/agent/profile`
- **File:** `page.tsx`
- **Access:** Agent
- **Layout pattern:** Split: public preview left, edit form right

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Business name, phone, bio (editable)
2. Avatar upload
3. All my listings summary (count + link)
4. Change password
5. Delete account (danger zone)

## Inbound links (what brings a user here)

- /agent/dashboard
- Agent sidebar nav

## Outbound links (where this page sends users)

- /agent/dashboard
- /auth/login (after delete/logout)

## Nav / button routes

- Save → stays on page
- Dashboard → /agent/dashboard
- Delete → /auth/login

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/agent` prefix requires a signed-in agent). Unauthenticated requests redirect to `/auth/login?returnTo=...`.
