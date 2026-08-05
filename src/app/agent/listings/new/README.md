# New Listing Form

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/agent/listings/new`
- **File:** `page.tsx`
- **Access:** Agent
- **Layout pattern:** Multi-step form, single column

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Step 1 — Basics: title, type, price, viewing fee (optional)
2. Step 2 — Description: landmark, full description, house rules
3. Step 3 — Photos: upload up to 8 images via Supabase Storage
4. Step 4 — Review & publish
5. Anti-fraud reminder before publish

## Inbound links (what brings a user here)

- /agent/dashboard (Add listing CTA)
- /agent/listings/[id]/edit (reuses same form)

## Outbound links (where this page sends users)

- /agent/dashboard (on publish)
- /listings/[id] (View live link after publish)

## Nav / button routes

- Cancel → /agent/dashboard
- Publish → /agent/dashboard then /listings/[id]

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/agent` prefix requires a signed-in agent). Unauthenticated requests redirect to `/auth/login?returnTo=...`.

## Notes for whoever builds this out

Doc says photo upload is 'via Supabase Storage', which conflicts with this project's architecture decision to keep file storage out of Supabase (Supabase is DB + auth only — see root README). Use whatever storage solution the backend settles on for uploads instead.
