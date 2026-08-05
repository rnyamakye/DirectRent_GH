# Listings Feed

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/listings`
- **File:** `page.tsx`
- **Access:** Public
- **Layout pattern:** Sidebar filters + main card grid

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Search bar (keyword + location)
2. Filter sidebar: price range, type, landmark
3. Listing cards grid (paginated)
4. Boost badge on promoted listings
5. Empty state if no results

## Inbound links (what brings a user here)

- / (hero CTA + preview cards)
- Nav bar
- /listings/[id] (breadcrumb)
- /agent/dashboard

## Outbound links (where this page sends users)

- /listings/[id]
- /auth/register (gated actions)
- /

## Nav / button routes

- Listing card click → /listings/[id]
- Sign Up prompt → /auth/register
