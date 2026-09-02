# DirectRent Project Documentation

Welcome to the DirectRent repository. This document serves as the central source of truth for the project's current state, completed features, pending features, UI preferences, and backend structure. 

**IMPORTANT FOR AI AGENTS:** Always use this file as context before implementing new features to ensure coherence and consistency across the codebase.

## 🏗 Backend Structure & Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS (Utility-first approach)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Storage, Real-time Channels)
- **Maps:** `react-leaflet` / `leaflet`
- **Notifications:** `react-hot-toast` for client-side alerts, Resend for emails (if applicable).
- **Architecture Patterns:**
  - Client and Server components are strictly separated. Use `"use client"` for interactive components.
  - Data fetching is primarily done via Supabase server clients (`@/lib/supabase/server.ts`).
  - Strict Row Level Security (RLS) is enforced at the database level for all operations.

## 🎨 UI & Styling Preferences (Frontend Master Guide)

To maintain consistency, **adhere strictly** to the following design guidelines and patterns without reading the entire codebase:

### 1. General Principles
- **Tailwind CSS First:** Rely exclusively on Tailwind CSS utility classes. Do not write custom CSS in `globals.css` or module files unless it's for a bespoke animation that Tailwind cannot handle.
- **Design Language:** Modern, clean, and premium. Generous padding, rounded corners, and soft shadows.

### 2. Layouts & Containers
- **Main Pages:** Wrap the main content in a container: `<main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-8">` (Use `max-w-7xl` for wider dashboard grids).
- **Positioning:** Based on past feedback, **avoid using `sticky` positioning**. Prefer `relative` or absolute/fixed structures to prevent layout jumping or overlapping issues.

### 3. Colors & Typography
- **Primary Elements:** `bg-primary` for active/brand elements, `hover:bg-primary-hover` for interactions.
- **Text:** `text-heading` for primary text/titles (bold, dark). `text-body` for secondary text (lighter gray, often with `/70` opacity like `text-body/70`).
- **Cards/Containers:** `bg-card` for main cards, with a subtle `border border-border`.
- **Accent Containers:** Use `bg-mint` for rounded avatars/icons. Use soft colors like `bg-amber-50` / `bg-emerald-50` for specific state highlights.

### 4. Components & Elements
- **Cards:** `<div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition">`
- **Primary Buttons:** `<button className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-2.5 text-sm font-bold transition">`
- **Secondary Buttons:** `<button className="border border-border hover:bg-slate-50 text-heading rounded-full px-6 py-2.5 text-sm font-bold transition">`
- **Badges:** `<span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-800">` (Change colors based on status: amber for pending, emerald for confirmed, red for cancelled).
- **Icons:** We use inline `<svg>` elements rather than an icon library package. Use `lucide-react` style standard geometric SVG paths if new ones are needed.

### 5. Forms & Inputs
- **Inputs:** `<input className="w-full px-4 py-3 rounded-xl border border-border bg-card text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />`
- **Feedback:** **Always** use `toast.success('...')` or `toast.error('...')` from `react-hot-toast` for form submissions or API calls.

### 6. Existing Reusable Components
Before building a new section, check if these common components apply:
- `<ProfileCompletenessCard />` - Displays a progress bar for profile setup.
- `<RecentlyViewedSection />` - Shows the user's recently viewed listings.
- `update_toasts.js` - Use this script at the root if you ever need to bulk update toast styles across profile edit pages.

## ✅ Completed Features

1. **Authentication & Roles:** Full Supabase auth flow with specific roles: `renter`, `agent`, and `artisan`.
2. **Listings Management:** Agents can create, manage, and boost property listings. Renters can browse and filter listings.
3. **Map Integration:** Interactive map view for listings using Leaflet.
4. **Real-time Messaging:** Users can chat in real-time via Supabase channels (`/messages`).
5. **Wallet System:** Users have virtual wallets (`/api/wallet/*`). Artisans and Agents can handle payments and payouts.
6. **Booking Management (Phase 1):** Renters can request bookings and cancel them via `/renter/bookings`. Artisans can view, accept, and decline booking requests via `/artisan/overview`.
7. **Property Tour Requests:** Renters can request physical/virtual property tours directly from listings. Agents and Renters manage tours via dedicated dashboard pages (`/agent/tours` and `/renter/tours`).
8. **Review Submission UI:** Reviews are validated server-side via `POST /api/reviews`. Renters can only review artisans after a confirmed booking and listings/agents after a confirmed tour. A polished `<ReviewSubmissionModal>` replaced the old inline form.
7. **Profile Management:** Comprehensive profile setups, avatars, and settings for all three user roles.
8. **Admin Dashboard:** Tools for system administrators to suspend users or moderate content.
9. **Saved Items:** Renters can save listings, agents, and artisans to their dashboard.
10. **Password Reset Flow:** Full frontend implementation for the email confirmation step of password resets, including styled `/auth/forgot-password` and `/auth/reset-password` pages.

11. **Advanced Dashboard Analytics:** Real charts tracking profile views over time and earnings history on the Agent dashboard.
12. **User Verification (KYC):** Identity Verification and Business Registration upload flow.
13. **Renter Search Alerts:** Renters can save search filters and manage alerts.
14. **Reporting and Moderation UI:** Users can flag inappropriate content or scam listings via a reporting modal.

## 🚧 Features Yet To Be Implemented (Feature Audit)

The core feature roadmap is currently complete!

*(Note: Ad banners and Privacy Policy currently use placeholder content and need final integration).*

## 📝 Implementation Changelog

Keep a running log of major features added to provide context for future development:

### August 2026: Password Reset Flow
- **Why:** Users needed a fully functional frontend to recover their accounts when they forgot their passwords.
- **How:**
  - Removed faulty `token` checking logic from `/auth/reset-password` since Supabase's `exchangeCodeForSession` automatically establishes a session during the redirect from email.
  - Revamped `/auth/forgot-password` and `/auth/reset-password` styling to precisely match the clean, premium UI of the existing login and registration pages using standard `bg-canvas`, `bg-card`, and Tailwind utility boundaries.

### August 2026: Property Tour Requests
- **Why:** Renters needed a way to formalize their intent to view a property, bridging the gap between browsing and renting.
- **How:** 
  - Created a `tour_requests` table via SQL migration with RLS policies mapping to `auth.users` and `profiles`.
  - Added RESTful endpoints (`POST /api/tours` and `PATCH /api/tours/[id]`) to handle request creation and status updates (Accept/Cancel/Decline).
  - Integrated `react-hot-toast` notifications.
  - Built a `<RequestTourModal />` triggered from the listing details page sidebar.
  - Added dynamic state to the listing details page: if a tour is already requested, the button transforms into a "Cancel Tour Request" button.
  - Added dedicated UI pages for both sides: `/renter/tours` and `/agent/tours`, linked from their respective dashboard hero headers.
