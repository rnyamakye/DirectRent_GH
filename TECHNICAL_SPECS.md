# DirectRent: Technical Specifications & Comprehensive In-Depth Documentation

This document expands significantly on the `README.md` to provide highly detailed architectural insights, technical explanations, frontend specifications, and design rationales for the DirectRent project. It is intended for developers, system architects, and AI agents who require a deep, foundational understanding of the codebase structure, conventions, and business logic mapping.

---

## 1. Core Architecture & Technology Stack Deep Dive

DirectRent is constructed on a modern, highly optimized React-based stack designed specifically for performance, Search Engine Optimization (SEO), and an exceptional developer experience.

### Framework: Next.js 14+ (App Router)
- **Why App Router (`src/app`):** The transition to the App Router represents a paradigm shift in how we handle rendering. By leveraging native React Server Components (RSC), we significantly reduce the JavaScript payload sent to the browser. This results in drastically faster Time to Interactive (TTI) and First Contentful Paint (FCP) metrics.
- **Server Components (Default):** By default, every component inside the `app` directory is a Server Component. These components execute entirely on the Node.js server. They are ideal for data fetching because they can communicate securely with the Supabase database without exposing environment variables or requiring intermediary API routes.
- **Client Components (Interactive):** Any file that requires browser APIs, state management (`useState`, `useReducer`), lifecycle effects (`useEffect`), or event listeners (`onClick`, `onChange`) must explicitly declare the `"use client";` directive at the absolute top of the file. 
  - *Best Practice:* Push client boundaries down the component tree as far as possible. Do not make a whole page a Client Component if only a single button requires state. (e.g., `src/app/listings/[id]/page.tsx` is a Server Component, but the `request-tour-button.tsx` imported inside it is a Client Component).

### Database & Authentication: Supabase
- **PostgreSQL Foundation:** The underlying data layer is a robust PostgreSQL relational database, allowing for complex queries and rigid data integrity via foreign keys.
- **Role-Based Authentication (RBAC):** Authentication is managed entirely via Supabase Auth. We utilize three distinct, rigid roles stored within the user's `user_metadata.role` payload:
  1. `renter`: Standard users looking to rent properties or hire artisans.
  2. `agent`: Real estate agents who create and manage property listings.
  3. `artisan`: Skilled workers offering services to renters or agents.
- **Row Level Security (RLS):** This is the core of our security model. Instead of writing authorization checks in every API route or server action, security is strictly enforced at the database level via Postgres RLS policies. For example, a policy explicitly states that only the `auth.uid()` matching the `renter_id` can `SELECT` from their `tour_requests`.
- **Client Architecture:** We maintain strict separation of concerns for database clients:
  - `@/lib/supabase/server.ts`: Used exclusively in Server Components and Route Handlers to securely read/write data using server-side cookies.
  - `@/lib/supabase/client.ts`: Used in Client Components for real-time subscriptions and browser-side auth state.

---

## 2. Frontend Specifications & Design System

The design language of DirectRent is engineered to feel premium, trustworthy, and modern. Consistency across the UI is paramount for user trust in a real estate platform.

### Tailwind CSS Strict Utility Paradigm
- **Utility-First Rule:** All styling must be achieved via Tailwind CSS utility classes written directly into the JSX/TSX `className` attributes. 
- **Zero Custom CSS:** We strictly forbid writing custom CSS rules, classes, or ID selectors in `globals.css` or CSS modules. The only exception is for complex, bespoke keyframe animations that Tailwind's `animate-` utilities cannot accommodate. This ensures a single source of truth for all design tokens (colors, spacing, typography).

### Container & Layout Strategy
- **Max Widths:** We do not utilize full-bleed layouts for main reading content to preserve readability on ultrawide monitors.
  - Main consumer pages use `<main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-8">`.
  - Administrative or Dashboard pages use `max-w-7xl` to comfortably accommodate wider grid layouts and data tables.
- **Positioning Constraints (CRITICAL):** We strictly avoid the use of `sticky` positioning anywhere in the application. Historically, `sticky` has caused severe layout jumping, z-index clipping, and overlapping bugs on iOS Safari and smaller viewports. 
  - *Alternative:* Rely on `relative` document flow, or use explicitly managed `fixed` elements for persistent navbars or modals.

### Typography, Color Tokens, and Theming
- **Brand Colors:** The primary brand color is applied via the `bg-primary` and `text-primary` Tailwind extensions defined in `tailwind.config.js`. Interactive hover states must always use `hover:bg-primary-hover` to provide immediate tactile feedback.
- **Typography Hierarchy:**
  - `text-heading`: Reserved for all `h1`, `h2`, `h3` tags and emphasized text. It renders as a bold, dark, high-contrast slate/black.
  - `text-body`: Utilized for all standard paragraph text and secondary information. 
  - *Muted Text:* When text needs to be de-emphasized (like timestamps or secondary labels), combine `text-body` with an opacity modifier (e.g., `text-body/70` or `text-body/50`).
- **Accent Containers:** Circular icons, user avatars, and decorative background elements frequently utilize `bg-mint` as a soft, welcoming background to contrast against the vibrant `text-primary` icon placed inside it.

### Standardized Interactive Elements
- **Buttons:** 
  - *Primary Call to Action:* `<button className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-2.5 text-sm font-bold transition">`
  - *Secondary Actions:* `<button className="border border-border hover:bg-slate-50 text-heading rounded-full px-6 py-2.5 text-sm font-bold transition">`
- **Cards & Data Containers:** All content cards share a uniform structural definition to maintain rhythm: `<div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition">`
- **Status Badges:** Small, pill-shaped indicators for statuses: `<span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-800">`. The background color must adapt to the state (e.g., amber for pending, emerald for confirmed, red for cancelled).
- **Icons:** We rely entirely on inline `<svg>` elements rather than heavy icon library packages (like FontAwesome) to reduce bundle size. When adding new icons, source them from Lucide React to ensure a consistent, geometric, 2px stroke-width aesthetic.

### Forms, Inputs, and User Feedback
- **Input Fields:** `<input className="w-full px-4 py-3 rounded-xl border border-border bg-card text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />`
- **User Feedback Mechanism:** Silent failures or successes are unacceptable. Every form submission, API call, or state mutation must trigger an immediate visual response using `toast.success('Message')` or `toast.error('Error details')` from the `react-hot-toast` library.
- **Destructive Actions & Confirmations:** The native browser `confirm()` and `alert()` dialogs are strictly forbidden as they break the immersive, premium design language. Any destructive action (like cancelling a tour or booking) must trigger the `<ConfirmationModal>` UI component from `src/components/ui/confirmation-modal.tsx`. This modal supports loading states (`isLoading`) and destructive styling (`isDestructive={true}`).

---

## 3. Database Schema Overview & Relationships

DirectRent relies on a highly relational, normalized PostgreSQL schema. Key tables and their purposes include:

- `profiles`: The central source of truth for user data (Agents, Renters, Artisans). This table links 1-to-1 with the Supabase `auth.users` table via a foreign key on the `id` column.
- `artisan_profiles`: A specialized extension table specific to the `artisan` role, containing trade skills, service radii, and availability schedules.
- `listings`: The core real estate entities created by Agents. Contains pricing, detailed descriptions, geospatial location data (latitude/longitude), and JSON arrays storing `photo_urls` from Supabase Storage buckets.
- `tour_requests`: A transactional table tracking renters who have requested to physically or virtually view a specific listing.
- `bookings`: A transactional table tracking renters who have requested to hire a specific artisan for a job.
- `reviews`: A polymorphic feedback table where the `target_type` column can dynamically point to a `listing`, an `agent`, or an `artisan`.

---

## 4. Implementation Changelog (In-Depth Technical Logs)

### August 2026: Password Reset Flow Completion
**Business Context & Rationale:**
While the Supabase backend was configured to send password recovery emails, the frontend flow was disconnected and unstyled. Users who clicked the reset link in their email were taken to a broken page that expected a manual `token` query parameter, blocking them from recovering their accounts. This created a critical friction point for user retention.

**Detailed Technical Implementation:**
1. **Auth Callback Refactoring Insights:** We identified that Supabase's implicit grant flow via `resetPasswordForEmail` does not pass a raw token to the final redirect URL. Instead, it utilizes PKCE, appending a temporary code to the URL which must be intercepted by a server route (`/auth/callback`). The callback exchanges this code for a secure, HTTP-only session cookie (`exchangeCodeForSession`), then redirects the user to the destination (`/auth/reset-password`). 
2. **Component Logic Simplification:** Because the session is already established by the time the user reaches `src/app/auth/reset-password/page.tsx`, we entirely removed the faulty `useSearchParams` logic that manually checked for a `token`. The form now simply calls `supabase.auth.updateUser({ password })`, leveraging the active session to securely mutate the user's credentials.
3. **UI/UX Standardization:** Rebuilt the JSX structure of both `/auth/forgot-password/page.tsx` and `/auth/reset-password/page.tsx`. They were previously isolated flex containers. They now perfectly mirror the architectural layout of the `<LoginForm>` component, utilizing a `max-w-md bg-canvas rounded-2xl shadow-xl border border-border p-6 md:p-8` wrapper to guarantee visual consistency across all authentication boundaries. Added inline SVG loading spinners for the `updating` state.

---

### August 2026: Property Tour Requests
**Business Context & Rationale:** 
Previously, renters could view a listing and see an agent's raw contact details (phone/email). However, there was no structured, trackable way to formalize an intent to view the property. This led to a disjointed user journey where transactions happened entirely off-platform, preventing us from tracking conversion rates. The Tour Requests feature bridges this gap by introducing a formal, database-backed scheduling system directly within the UI.

**Detailed Technical Implementation:**
1. **Database Layer:** Created the `tour_requests` table via a manual SQL migration. It enforces strict referential integrity with foreign keys pointing to `auth.users` (the renter), `profiles` (the agent), and `listings` (the property). RLS policies were meticulously crafted to ensure renters can only `SELECT` and `UPDATE` (to cancel) their own requests, while agents can only `SELECT` and `UPDATE` (to accept/decline) requests specifically tied to their profile ID.
2. **Backend API Routes:** Built two Next.js Route Handlers:
   - `POST /api/tours`: Handles the creation of a new request. Validates the date/time and triggers an in-app notification to the agent.
   - `PATCH /api/tours/[id]`: Handles state machine transitions (`pending` -> `confirmed` | `cancelled` | `declined`) and notifies the opposing party of the state change.
3. **Frontend Modal (`<RequestTourModal />`):** Created a highly interactive client component that captures the desired date (utilizing HTML5 date inputs validated to be tomorrow or later), time, and preference type (physical vs. virtual). It handles loading states and error boundaries natively.
4. **Dynamic Listing UI State:** The listing details page (`src/app/listings/[id]/page.tsx`) was upgraded to a hybrid server-data approach. It queries the database for any existing `pending` or `confirmed` tour for the currently logged-in user on that specific listing. If a match is found, the default "Request a Tour" button dynamically transforms into a prominent, red "Cancel Tour Request" button. This allows users to back out immediately without having to navigate away to their dashboard.
5. **Dashboard Management Interfaces:** Added two dedicated UI pages to surface this data:
   - `/renter/tours`: A dashboard view for renters to track the status of all their outbound requests.
   - `/agent/tours`: A comprehensive tabular interface for agents to rapidly Accept or Decline inbound requests, heavily utilizing the `PATCH` endpoint for optimistic UI updates.
6. **Confirmation Modal Refactor:** Replaced all primitive, native browser `confirm()` popups (used for cancelling tours and bookings) with a universal, animated `<ConfirmationModal />` to align with the premium design language and support asynchronous loading states during API calls.

---

### August 2026: Review Submission UI
**Business Context & Rationale:**
Previously, renters could technically leave a review via a form embedded inside the `<ReviewsSection>` component, but it called the Supabase client library directly from the browser with no validation. This meant any renter could review any artisan or listing without having had a real interaction. The new system enforces transaction-based trust: you can only review someone you've actually dealt with.

**Detailed Technical Implementation:**
1. **Backend API (`POST /api/reviews`):** Created a validated server-side API route. Before any review is inserted, the route checks the database for an existing `confirmed` booking (for artisans) or `confirmed` tour request (for listings/agents) tied to the current user. Only if a match exists is the review upserted via Supabase.
2. **`<ReviewSubmissionModal />` Component (`src/components/ui/review-submission-modal.tsx`):** Built a new, polished, animated modal (rendered via a React portal into `document.body`) featuring an interactive star selector with hover states, a descriptive label ("Excellent", "Good", etc.), and an optional comment textarea. It is fully reusable and accepts `targetType`, `targetId`, and `targetName` as props.
3. **`<ReviewsSection />` Refactor (`src/components/reviews-section.tsx`):** Removed the old inline review form and direct Supabase client calls. It now triggers the `<ReviewSubmissionModal>` when a renter clicks "Leave a Review". Also added a `targetName` prop to personalize the modal heading.
4. **Renter Bookings Dashboard:** Added a "Leave a Review" link button for any booking with `confirmed` status. Clicking it opens the `<ReviewSubmissionModal>` with the artisan as the target.
5. **Renter Tours Dashboard:** Added a "Leave a Review" link button for any tour with `confirmed` status. Clicking it opens the `<ReviewSubmissionModal>` with the listing as the target.
6. **Artisan Dashboard:** The artisan's own booking management panel (`/artisan/overview`) was also upgraded — the Decline action now uses `<ConfirmationModal>` instead of the native `confirm()` dialog.

---

## 5. Upcoming Features (Audit List)

When planning future development cycles, refer to this prioritized, architecturally-scoped list of missing features:

1. **Review Submission UI:** 
   - *Architecture Definition:* Create a client-side form modal accessible from an Artisan profile, Agent profile, or upon the completion of a Booking/Tour. It must capture a 1-5 star rating and a text comment, sending a `POST` request to `/api/reviews`. The backend must validate that the user actually completed a transaction with the target before allowing the review to persist.
1. **Advanced Dashboard Analytics:** 
   - *Architecture Definition:* Replace the hardcoded, static placeholder metrics on `/agent/dashboard`. This requires querying the `profile_views` and `listing_views` tables over a dynamic time series (e.g., last 7 days vs 30 days) and integrating a lightweight charting library (such as Recharts) to visualize the historical data.
2. **User Verification (KYC - Know Your Customer):** 
   - *Architecture Definition:* Add a secure file upload flow mapping to a private Supabase Storage bucket for Identity Documents (ID) or Business Registration certificates. Add a boolean `is_verified` column to the `profiles` table that can only be toggled to `true` by an administrative role after document review.
3. **Renter Search Alerts:** 
   - *Architecture Definition:* Create a `search_alerts` table storing JSON representations of query parameters (e.g., "2 beds in Accra under GHS 2000") alongside the `user_id`. This feature requires implementing a background cron job (via Supabase Edge Functions or an external trigger like GitHub Actions) to periodically evaluate newly created listings against all active saved searches, dispatching emails via Resend when matches are found.
4. **Reporting and Moderation UI:** 
   - *Architecture Definition:* Implement a "Report this Listing" or "Report User" button across the platform. This writes to a new `reports` table. Must be accompanied by a secure `/admin/moderation` dashboard viewable only by users with an `admin` role, allowing them to suspend listings or ban users.
