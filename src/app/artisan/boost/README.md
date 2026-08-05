# Boost Profile (Payment)

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/artisan/boost`
- **File:** `page.tsx`
- **Access:** Artisan
- **Layout pattern:** Centered payment flow card

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Profile summary (photo, trade, area)
2. Boost duration selector
3. MoMo payment form
4. Order summary in GHS
5. Pay via Paystack/Hubtel → success/failure

## Inbound links (what brings a user here)

- /artisan/dashboard (Boost CTA)

## Outbound links (where this page sends users)

- /artisan/boost/success
- /artisan/boost/failed

## Nav / button routes

- Pay → /artisan/boost/success or /artisan/boost/failed
- Cancel → /artisan/dashboard

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/artisan` prefix requires a signed-in artisan). Unauthenticated requests redirect to `/auth/login?returnTo=...`.

## Notes for whoever builds this out

Same as the agent boost page — payment calls belong in the backend (backend/src/routes/payments.ts), this page only triggers/reacts to it.
