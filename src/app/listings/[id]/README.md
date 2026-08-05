# Listing Detail

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/listings/[id]`
- **File:** `page.tsx`
- **Access:** Public
- **Layout pattern:** Photo gallery + detail panel + sidebar

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Photo gallery carousel
2. Title, price, landmark description
3. Anti-fraud warning banner
4. Agent info card (name, rating, avg response)
5. Star ratings + reviews list
6. Leave a review (auth required)
7. Related listings (same area)

## Inbound links (what brings a user here)

- /listings (card click)
- / (preview card click)
- Search results
- Shared URL / direct link

## Outbound links (where this page sends users)

- /listings
- /agent/profile/[id]
- /auth/login (review gate)
- /artisans (related services link)

## Nav / button routes

- Breadcrumb → /listings
- Agent name → /agent/profile/[id]
- Leave review → /auth/login if guest
