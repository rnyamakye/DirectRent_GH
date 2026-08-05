# Agent Public Profile

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/agent/profile/[id]`
- **File:** `page.tsx`
- **Access:** Public
- **Layout pattern:** Profile header + listings grid

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Agent business name, bio, avg rating
2. All active listings by this agent (card grid)
3. Star ratings + reviews section
4. Report agent link

## Inbound links (what brings a user here)

- /listings/[id] (agent name link)
- /listings (agent badge link)

## Outbound links (where this page sends users)

- /listings/[id]
- /listings
- /auth/login (report gate)

## Nav / button routes

- Listing card → /listings/[id]
- Report → /auth/login if guest

## Notes for whoever builds this out

NOTE: listed as Public here, which conflicts with the routing guide's blanket "all /agent/ routes are protected" rule. The middleware (frontend/lib/supabase/middleware.ts) carves out this exact path as a public exception — keep that carve-out in sync if this route moves.
