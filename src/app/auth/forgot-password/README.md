# Forgot Password

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/auth/forgot-password`
- **File:** `page.tsx`
- **Access:** Public
- **Layout pattern:** Centered single-column form card

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Email input
2. Submit sends reset link
3. Confirmation message
4. Back to login link

## Inbound links (what brings a user here)

- /auth/login (forgot password link)

## Outbound links (where this page sends users)

- /auth/login
- /auth/reset-password (from email link)

## Nav / button routes

- Back → /auth/login
- Reset email → /auth/reset-password
