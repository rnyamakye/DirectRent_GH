# Artisans Feed

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/artisans`
- **File:** `page.tsx`
- **Access:** Public
- **Layout pattern:** Sidebar filters + profile card grid

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Search bar (trade + area)
2. Filter sidebar: trade category, service area
3. Artisan profile cards grid (paginated)
4. Boost badge on promoted artisans
5. Empty state if no results

## Inbound links (what brings a user here)

- / (hero CTA + featured artisans)
- Nav bar
- /artisans/[id] (breadcrumb)
- /listings/[id] (related services)

## Outbound links (where this page sends users)

- /artisans/[id]
- /auth/register
- /

## Nav / button routes

- Artisan card click → /artisans/[id]
- Sign Up prompt → /auth/register
