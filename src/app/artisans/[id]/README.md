# Artisan Profile

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/artisans/[id]`
- **File:** `page.tsx`
- **Access:** Public
- **Layout pattern:** Profile header + details + sidebar

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Profile photo + trade category badge
2. Bio and service area
3. Services offered list
4. Anti-fraud warning banner
5. Star ratings + reviews list
6. Leave a review (auth required)
7. Contact / hire prompt

## Inbound links (what brings a user here)

- /artisans (card click)
- / (featured card)
- Shared URL / direct link

## Outbound links (where this page sends users)

- /artisans
- /auth/login (review gate)
- /auth/register

## Nav / button routes

- Breadcrumb → /artisans
- Leave review → /auth/login if guest
- Contact → /auth/login if guest
