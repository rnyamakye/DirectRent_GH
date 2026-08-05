# Boost Listing (Payment)

AI-readable reference for this page — kept in sync with the Page Layout & Routing
Guide (section 3) so an AI or a new contributor can understand and extend this route
without re-reading the whole spec document.

- **Route:** `/agent/listings/[id]/boost`
- **File:** `page.tsx`
- **Access:** Agent
- **Layout pattern:** Centered payment flow card

## Page sections

Each is currently a `<Section>` placeholder in the page component, in this order:

1. Listing summary (thumbnail, title, price)
2. Boost duration selector (1 week / 2 weeks / 1 month)
3. MoMo payment form (phone number, network)
4. Order summary + total cost in GHS
5. Pay via Paystack/Hubtel sandbox → success/failure screen

## Inbound links (what brings a user here)

- /agent/dashboard (Boost CTA)
- /agent/listings/[id]/edit

## Outbound links (where this page sends users)

- /agent/dashboard (on success)
- /agent/boost/success
- /agent/boost/failed

## Nav / button routes

- Pay → /agent/boost/success or /agent/boost/failed
- Cancel → /agent/dashboard

## Access control

Protected by `frontend/lib/supabase/middleware.ts` (any `/agent` prefix requires a signed-in agent). Unauthenticated requests redirect to `/auth/login?returnTo=...`.

## Notes for whoever builds this out

Payment logic (Paystack/Hubtel) belongs in the backend (backend/src/routes/payments.ts), not here — this page should only call the backend's boost-initiation endpoint and redirect based on its response.
