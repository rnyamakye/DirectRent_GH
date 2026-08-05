# Reset Password

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/auth/reset-password`
- **File:** `page.tsx`
- **Access:** Public
- **Layout pattern:** Centered single-column form card

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. New password + confirm password fields
2. Token validated from email URL
3. Submit → login page with success toast

## Inbound links (what brings a user here)

- /auth/forgot-password (email link — contains token)

## Outbound links (where this page sends users)

- /auth/login

## Nav / button routes

- On success → /auth/login
