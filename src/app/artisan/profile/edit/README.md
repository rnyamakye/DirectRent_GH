# Edit Artisan Profile

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/artisan/profile/edit`
- **File:** `page.tsx`
- **Access:** Artisan
- **Layout pattern:** Single-column form

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Trade category selector
2. Service area (text + region)
3. Bio / description
4. Phone number
5. Services offered list (add / remove)
6. Photo upload (up to 6 images)
7. Availability toggle (Available / Busy)

## Inbound links (what brings a user here)

- /artisan/dashboard
- Artisan sidebar nav

## Outbound links (where this page sends users)

- /artisan/dashboard
- /artisans/[id]

## Nav / button routes

- Save → /artisan/dashboard
- Preview public → /artisans/[id]
- Cancel → /artisan/dashboard

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/artisan` prefix requires a signed-in artisan). Unauthenticated requests redirect to `/auth/login?returnTo=...`.

## Notes for whoever builds this out

Photo upload here should use the same non-Supabase storage solution as the listing photo upload — see the note on app/agent/listings/new.
