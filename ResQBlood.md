# ResQBlood
**Blood Donation Matching Platform**
SDLC: Agile (4 Sprints) · Version 1.0

---

## TABLE OF CONTENTS
1. [Project Overview & MVP Scope](#1-project-overview--mvp-scope)
2. [SDLC: Agile Sprint Plan](#2-sdlc-agile-sprint-plan)
3. [Tech Stack](#3-tech-stack)
4. [Initial Setup](#4-initial-setup)
5. [Environment Variables](#5-environment-variables)
6. [Supabase Configuration](#6-supabase-configuration)
7. [Folder Structure](#7-folder-structure)
8. [TypeScript Types](#8-typescript-types)
9. [Design System](#9-design-system)
10. [State Management](#10-state-management)
11. [Feature Specifications](#11-feature-specifications)
12. [Page Specifications](#12-page-specifications)
13. [Component Library](#13-component-library)
14. [Routing](#14-routing)
15. [Constants](#15-constants)
16. [Risk Analysis & Security](#16-risk-analysis--security)
17. [Testing Plan](#17-testing-plan)
18. [Deployment](#18-deployment)
19. [SE Documentation Checklist](#19-se-documentation-checklist)

---

## 1. PROJECT OVERVIEW & MVP SCOPE

### Problem
Blood supply in Indonesia faces critical gaps: requests are broadcast manually via WhatsApp, donor databases are fragmented across PMI branches, and patients face life-threatening delays finding compatible donors.

### Solution
A web platform connecting voluntary blood donors with requesters (patients/family/hospitals), with smart matching by blood type and location. PMI coordination is scoped as a future feature.

### User Roles
| Role | Description |
|------|-------------|
| **Donor** | Registers, sets blood type & availability, browses requests, volunteers to donate |
| **Requester** | Creates blood requests, sees matched donors, tracks request status |

### MVP Feature Scope
| Feature | In MVP |
|---------|--------|
| Auth (register/login) with role selection | ✅ |
| Donor profile with availability toggle | ✅ |
| Blood request creation | ✅ |
| Blood type + city-based matching | ✅ |
| Volunteer / Accept / Decline match flow | ✅ |
| Dashboard per role with stats | ✅ |
| Donation history | ✅ |
| Push notifications | ❌ Future |
| Digital certificate | ❌ Future |
| PMI/UTD integration | ❌ Future |
| Real-time delivery tracking | ❌ Future |

---

## 2. SDLC: AGILE SPRINT PLAN

**Model:** Agile Scrum · **PM Tool:** Trello · **VCS:** GitHub

### Sprint Overview
| Sprint | Weeks | Focus |
|--------|-------|-------|
| Sprint 1 | 1–3 | Setup + Auth + Profile Onboarding |
| Sprint 2 | 4–7 | Blood Request CRUD + Matching Flow |
| Sprint 3 | 8–11 | Dashboards + Donation History + UI Polish |
| Sprint 4 | 12–14 | Testing + Bug Fixes + Deployment + Docs |

### GitHub Branching Strategy
- `main` → production-ready, only merged via PR
- `dev` → integration branch for all features
- `feature/auth` → Sprint 1 work
- `feature/requests` → Sprint 2 work
- `feature/dashboard` → Sprint 3 work
- `fix/bug-name` → hotfixes

**Rule:** Every team member works on their own feature branch. PR to `dev`, at least one reviewer must approve before merge. All team members must have visible commit history throughout.

---

## 3. TECH STACK

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| State Management | Zustand |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| File Storage | Supabase Storage |
| Router | React Router v6 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toast Notifications | react-hot-toast |
| Date Utilities | date-fns |
| Utility Classes | clsx + tailwind-merge |
| Testing | Vitest + Testing Library |
| Deployment | Vercel (frontend) |

---

## 4. INITIAL SETUP

```bash
npm create vite@latest ResQBlood -- --template react-ts
cd ResQBlood

npm install @supabase/supabase-js zustand react-router-dom \
  react-hook-form @hookform/resolvers zod framer-motion \
  lucide-react react-hot-toast date-fns clsx tailwind-merge

npm install -D tailwindcss postcss autoprefixer vitest \
  @testing-library/react @testing-library/jest-dom jsdom

npx tailwindcss init -p
```

**Tailwind config:** extend colors with `brand` palette (see Section 9). Set content to `['./index.html', './src/**/*.{js,ts,jsx,tsx}']`.

**index.css:** Import Inter font from Google Fonts, then Tailwind base/components/utilities directives.

---

## 5. ENVIRONMENT VARIABLES

```env
# .env (never commit)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Rule:** Commit a `.env.example` with empty values. Add `.env` to `.gitignore`.

---

## 6. SUPABASE CONFIGURATION

### 6.1 Auth Settings (Supabase Dashboard)
- Enable Email/Password provider
- Disable email confirmation during development (re-enable for production)
- Add `http://localhost:5173` and production Vercel URL to allowed redirect URLs

### 6.2 Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('donor', 'requester');
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE urgency_level AS ENUM ('critical', 'urgent', 'normal');
CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'fulfilled', 'cancelled');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'declined', 'completed');

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL DEFAULT '',
  role                user_role NOT NULL,
  phone               TEXT DEFAULT '',
  blood_type          blood_type,
  city                TEXT DEFAULT '',
  province            TEXT DEFAULT '',
  avatar_url          TEXT,
  is_profile_complete BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Donor-specific details (only rows for donor role)
CREATE TABLE public.donor_details (
  id               UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_available     BOOLEAN DEFAULT TRUE,
  last_donated_at  DATE,
  weight           NUMERIC(5,2),
  age              INTEGER,
  total_donations  INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Blood requests
CREATE TABLE public.blood_requests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name   TEXT NOT NULL,
  blood_type     blood_type NOT NULL,
  bags_needed    INTEGER NOT NULL DEFAULT 1,
  urgency        urgency_level NOT NULL DEFAULT 'normal',
  hospital_name  TEXT NOT NULL,
  city           TEXT NOT NULL,
  province       TEXT NOT NULL,
  notes          TEXT,
  status         request_status DEFAULT 'open',
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Donor ↔ Request matches
CREATE TABLE public.matches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id      UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donor_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status          match_status DEFAULT 'pending',
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, donor_id)
);

-- Completed donation records
CREATE TABLE public.donation_history (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id       UUID REFERENCES public.matches(id),
  hospital_name  TEXT,
  donated_at     DATE NOT NULL DEFAULT NOW(),
  bags_donated   INTEGER DEFAULT 1,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at      BEFORE UPDATE ON public.profiles      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER donor_details_updated_at BEFORE UPDATE ON public.donor_details  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER blood_requests_updated_at BEFORE UPDATE ON public.blood_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile row on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'role')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 6.3 Row Level Security

```sql
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_details   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_history ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- DONOR DETAILS
CREATE POLICY "Authenticated users view donor details"
  ON public.donor_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "Donors manage own details"
  ON public.donor_details FOR ALL TO authenticated USING (auth.uid() = id);

-- BLOOD REQUESTS
CREATE POLICY "Authenticated users view all requests"
  ON public.blood_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Requesters manage own requests"
  ON public.blood_requests FOR ALL TO authenticated USING (auth.uid() = requester_id);

-- MATCHES
CREATE POLICY "Donors see own matches"
  ON public.matches FOR SELECT TO authenticated USING (auth.uid() = donor_id);
CREATE POLICY "Requesters see matches for their requests"
  ON public.matches FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.blood_requests r WHERE r.id = request_id AND r.requester_id = auth.uid()));
CREATE POLICY "Donors insert matches"
  ON public.matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donors update own match status"
  ON public.matches FOR UPDATE TO authenticated USING (auth.uid() = donor_id);
CREATE POLICY "Requesters update match to completed"
  ON public.matches FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.blood_requests r WHERE r.id = request_id AND r.requester_id = auth.uid()));

-- DONATION HISTORY
CREATE POLICY "Donors see own history"
  ON public.donation_history FOR SELECT TO authenticated USING (auth.uid() = donor_id);
CREATE POLICY "Donors insert own history"
  ON public.donation_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);
```

### 6.4 Storage
Create a bucket named `avatars` — set to **public**, allow `image/jpeg`, `image/png`, `image/webp`, max 2MB.

---

## 7. FOLDER STRUCTURE

```
ResQBlood/
├── public/
│   └── logo.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx                        # Router + auth listener
│   │
│   ├── lib/
│   │   ├── supabase.ts                # Supabase client singleton
│   │   └── utils.ts                   # cn(), formatDate(), label/color helpers, isEligibleToDonate()
│   │
│   ├── types/
│   │   └── index.ts                   # All TypeScript interfaces
│   │
│   ├── constants/
│   │   ├── bloodTypes.ts              # BLOOD_TYPES array + color map
│   │   └── provinces.ts               # Indonesian provinces array
│   │
│   ├── store/
│   │   └── authStore.ts               # Zustand: user, profile, donorDetails, isLoading
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                 # signIn, signUp, signOut, session init
│   │   ├── useProfile.ts              # fetch + update profile
│   │   ├── useDonorDetails.ts         # fetch + update donor_details
│   │   ├── useBloodRequests.ts        # CRUD for blood_requests
│   │   └── useMatches.ts              # create match, accept/decline, fetch by donor/request
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
`   │   │   ├── Spinner.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Sidebar + main content shell
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── requests/
│   │   │   ├── RequestCard.tsx
│   │   │   ├── UrgencyBadge.tsx
│   │   │   └── RequestStatusBadge.tsx
│   │   ├── donors/
│   │   │   ├── DonorCard.tsx
│   │   │   └── AvailabilityToggle.tsx
│   │   └── matches/
│   │       └── MatchCard.tsx
│   │
│   └── pages/
│       ├── Landing.tsx
│       ├── NotFound.tsx
│       ├── auth/
│       │   ├── Login.tsx
│       │   └── Register.tsx
│       ├── onboarding/
│       │   └── ProfileSetup.tsx
│       ├── donor/
│       │   ├── DonorDashboard.tsx
│       │   ├── BrowseRequests.tsx      # Core donor feature
│       │   ├── MyMatches.tsx
│       │   ├── DonorProfile.tsx
│       │   └── DonationHistory.tsx
│       └── requester/
│           ├── RequesterDashboard.tsx
│           ├── CreateRequest.tsx
│           ├── MyRequests.tsx
│           └── RequestDetail.tsx
```

---

## 8. TYPESCRIPT TYPES

Place all types in `src/types/index.ts`. Keep this as the single source of truth.

```typescript
export type UserRole      = 'donor' | 'requester'
export type BloodType     = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type UrgencyLevel  = 'critical' | 'urgent' | 'normal'
export type RequestStatus = 'open' | 'in_progress' | 'fulfilled' | 'cancelled'
export type MatchStatus   = 'pending' | 'accepted' | 'declined' | 'completed'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  phone: string
  blood_type: BloodType | null
  city: string
  province: string
  avatar_url: string | null
  is_profile_complete: boolean
  created_at: string
  updated_at: string
}

export interface DonorDetails {
  id: string
  is_available: boolean
  last_donated_at: string | null
  weight: number | null
  age: number | null
  total_donations: number
  created_at: string
  updated_at: string
}

export interface BloodRequest {
  id: string
  requester_id: string
  patient_name: string
  blood_type: BloodType
  bags_needed: number
  urgency: UrgencyLevel
  hospital_name: string
  city: string
  province: string
  notes: string | null
  status: RequestStatus
  expires_at: string | null
  created_at: string
  updated_at: string
  profiles?: Profile         // joined requester profile
}

export interface Match {
  id: string
  request_id: string
  donor_id: string
  status: MatchStatus
  responded_at: string | null
  created_at: string
  blood_requests?: BloodRequest
  profiles?: Profile           // joined donor profile
}

export interface DonationHistory {
  id: string
  donor_id: string
  match_id: string | null
  hospital_name: string | null
  donated_at: string
  bags_donated: number
  notes: string | null
  created_at: string
}

// Form data shapes (used with React Hook Form + Zod)
export interface RegisterFormData {
  email: string
  password: string
  role: UserRole
}

export interface ProfileSetupFormData {
  full_name: string
  phone: string
  blood_type: BloodType
  city: string
  province: string
  age?: number            // donor only
  weight?: number         // donor only
  last_donated_at?: string // donor only
}

export interface BloodRequestFormData {
  patient_name: string
  blood_type: BloodType
  bags_needed: number
  urgency: UrgencyLevel
  hospital_name: string
  city: string
  province: string
  notes?: string
  expires_at?: string
}
```

---

## 9. DESIGN SYSTEM

### Color Palette (Tailwind custom extension)
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-600` | `#e51d1d` | Primary buttons, CTAs, active states |
| `brand-50` | `#fff1f1` | Light backgrounds, hover on brand elements |
| `gray-900` | `#111827` | Primary headings and body text |
| `gray-500` | `#6b7280` | Secondary/muted text |
| `gray-50` | `#f9fafb` | Page background |
| `white` | `#ffffff` | Card and surface background |
| `green-600` | `#16a34a` | Available status, success |
| `orange-500` | `#f97316` | Urgent warnings |
| `blue-600` | `#2563eb` | Info, in-progress states |
| `red-600` | `#dc2626` | Critical urgency, errors |

### Design Principles
- **Mobile-first.** All layouts must work at 375px before scaling up.
- **Clean and clinical.** Think health app, not social app. No gradients except landing hero.
- **Cards as the primary container.** Use `bg-white rounded-xl shadow-sm p-6` consistently.
- **Readable typography.** Inter font. Headings `font-bold` or `font-semibold`, body `font-normal`.
- **Generous spacing.** Stick to Tailwind's 4/6/8/12/16 spacing scale.
- **Simple interactions.** Hover states, loading spinners, and toast feedback are enough.

### Utility Helpers (in `src/lib/utils.ts`)
Implement the following helpers (no external dependencies):
- `cn(...classes)` — merges Tailwind classes with clsx + tailwind-merge
- `formatDate(dateString)` — formats to Indonesian locale (`id-ID`)
- `getUrgencyColor(urgency)` — returns Tailwind class string per urgency level
- `getUrgencyLabel(urgency)` — returns: critical → "Kritis", urgent → "Mendesak", normal → "Normal"
- `getStatusColor(status)` — returns Tailwind class string per status value
- `getStatusLabel(status)` — returns Indonesian label per status value
- `isEligibleToDonate(lastDonatedAt)` — returns `true` if null or >90 days ago
- `daysSinceLastDonation(lastDonatedAt)` — returns number of days or null

---

## 10. STATE MANAGEMENT

### `src/store/authStore.ts` (Zustand)
State shape:
- `user: { id: string; email: string } | null`
- `profile: Profile | null`
- `donorDetails: DonorDetails | null`
- `isLoading: boolean`

Actions: `setUser`, `setProfile`, `setDonorDetails`, `setLoading`, `clear`

Use `persist` middleware to persist only `user` (not profile) in localStorage under key `ResQBlood-auth`.

### Session Initialization (in `App.tsx`)
On mount, call `supabase.auth.getSession()` to check for existing session, then fetch profile + donorDetails and populate the store. Also set up `supabase.auth.onAuthStateChange()` listener to react to login/logout events.

### Data Fetching Pattern
All Supabase queries live in custom hooks (`src/hooks/`). Components call hooks, not Supabase directly. Hooks return `{ data, isLoading, error }` and mutation functions. Use React's `useState` + `useEffect` within hooks — no need for a dedicated server-state library.

---

## 11. FEATURE SPECIFICATIONS

### F1: Authentication & Onboarding

**Register:**
1. User fills email, password, and selects a role (visual card selector, not a dropdown).
2. Call `supabase.auth.signUp()` with `options.data = { role }`.
3. The `handle_new_user` database trigger auto-creates the profile row with the chosen role.
4. On success, redirect to `/onboarding/profile-setup`.

**Login:**
1. Call `supabase.auth.signInWithPassword()`.
2. After login, fetch `profiles` row for the user.
3. If `is_profile_complete = false` → redirect to `/onboarding/profile-setup`.
4. If `is_profile_complete = true` → redirect to role-based dashboard.

**Profile Setup (one-time onboarding):**
- Fields for all roles: `full_name`, `phone`, `blood_type`, `city`, `province`.
- Additional fields for donors only: `age`, `weight`, `last_donated_at`, `is_available` toggle.
- On submit: upsert `profiles` row + insert `donor_details` row (if donor) + set `is_profile_complete = true`.
- Redirect to dashboard.

**ProtectedRoute logic:**
- No session → redirect to `/login`
- Session but profile incomplete → redirect to `/onboarding/profile-setup`
- Session, profile complete, but wrong role → redirect to correct dashboard

---

### F2: Donor Profile & Availability

**Availability Toggle:**
- Prominent switch on both the dashboard and profile page.
- On toggle: update `donor_details.is_available` in Supabase.
- Visual states: green + "Available to Donate" / gray + "Currently Unavailable".
- If donor is not eligible (donated <90 days ago), still allow toggling but show an info banner explaining they'll appear but may fail screening.

**Eligibility Display:**
- Show clearly on profile and dashboard header:
  - ✅ "You're eligible to donate" — if `last_donated_at` is null or >90 days ago
  - ⏳ "Eligible in X more days" — if <90 days ago
  - 🩸 "First-time donor" — if never donated

**Profile Editing:**
- Editable: `full_name`, `phone`, `city`, `province`, `age`, `weight`.
- **Not editable:** `blood_type` (locked after setup for medical accuracy — note this to user with a tooltip).

---

### F3: Blood Request Management

**Create Request form fields:**
| Field | Type | Validation |
|-------|------|-----------|
| `patient_name` | Text input | Required |
| `blood_type` | Visual grid selector (8 options) | Required |
| `bags_needed` | Number input | 1–10, required |
| `urgency` | 3 visual card options | Required |
| `hospital_name` | Text input | Required |
| `city` | Text input | Required |
| `province` | Select from provinces list | Required |
| `notes` | Textarea | Optional |
| `expires_at` | Date picker | Optional, defaults to 7 days from now |

After creation: navigate to `/requester/requests/:id`.

**Request Status Lifecycle:**
```
open → in_progress → fulfilled
     ↘ cancelled
```
- `open` → request just created, no accepted matches yet
- `in_progress` → at least one match has been accepted
- `fulfilled` → requester manually marks as done
- `cancelled` → requester cancels

Status transitions triggered by the requester from the Request Detail page.

---

### F4: Matching System

**Donor side — Browse Requests (`/donor/requests`):**
1. Query all `blood_requests` where:
   - `status = 'open'` or `'in_progress'`
   - `blood_type` matches the logged-in donor's blood type
   - Not already matched by this donor (left join / NOT EXISTS on `matches` table)
   - `expires_at` is null or in the future
2. Sort: `urgency` (critical → urgent → normal), then `created_at` desc.
3. Filter bar: by urgency, by city (pre-filled with donor's city, editable).
4. Each RequestCard has a "I Can Donate" button.

**Volunteering:**
1. Donor clicks "I Can Donate".
2. Check `is_available = true`. If false, show error toast — "Set availability to active first."
3. Insert into `matches`: `{ request_id, donor_id, status: 'pending' }`.
4. On unique constraint violation (already matched), show "You've already volunteered for this request."
5. Show success toast. Button becomes disabled/greyed out.

**Donor side — My Matches (`/donor/matches`):**
- Tabs: Pending | Accepted | Completed/Declined
- Each match card shows: hospital name, blood type, urgency, city, time volunteered.
- On "Pending" tab: show "Confirm Ready" (accept) and "I Can't Make It" (decline) buttons.
- Accept → update `status = 'accepted'`, `responded_at = NOW()`.
- Decline → update `status = 'declined'`, `responded_at = NOW()`.

**Requester side — Request Detail (`/requester/requests/:id`):**
- Top section: full request info card.
- Status update buttons: "Mark as Fulfilled" (→ `fulfilled`) and "Cancel Request" (→ `cancelled`).
- Bottom section: list of all matched donors.
  - Shows: donor name, city, last donated, match status badge.
  - If match status = `accepted`: show "Mark as Completed" button.
  - Marking completed: update match `status = 'completed'` + insert into `donation_history` + increment `donor_details.total_donations`.
- Empty state if no donors have volunteered yet.

---

### F5: Dashboards

**Donor Dashboard stats:**
| Card | Data Source |
|------|------------|
| Total Donations | COUNT from `donation_history` where `donor_id = me` |
| Pending Responses | COUNT from `matches` where `donor_id = me` AND `status = 'pending'` |
| Requests Near You | COUNT from `blood_requests` where `city = my city` AND `status = 'open'` AND `blood_type = mine` |

Also shows: availability toggle (quick action) + last 5 matches list.
**Link button:** "Browse All Requests →"

**Requester Dashboard stats:**
| Card | Data Source |
|------|------------|
| Active Requests | COUNT where `requester_id = me` AND status in `['open', 'in_progress']` |
| Donors Matched | COUNT from `matches` joined to my requests where match `status = 'accepted'` |
| Fulfilled Requests | COUNT where `requester_id = me` AND `status = 'fulfilled'` |

Also shows: "Create Blood Request" CTA button + last 5 requests list.

---

## 12. PAGE SPECIFICATIONS

### Landing (`/`)
**Access:** Public (redirect to dashboard if already logged in)
Layout (top to bottom):
- **Navbar:** Logo left, "Login" and "Register" buttons right.
- **Hero section:** Bold headline ("One Drop, One Life Saved"), short subtext, two CTA buttons: "Register as Donor" (primary/red) and "I Need Blood" (outline).
- **How It Works:** 3-column section with icon + title + 1-line description per step: (1) Register & set profile → (2) Match by blood type → (3) Save a life.
- **Impact stats:** 3 numbers side by side (mock values ok: e.g., "200+ Donors", "50+ Requests Fulfilled", "15 Cities Covered").
- **Footer:** App name, brief tagline, copyright.

---

### Login (`/login`)
Centered single card, max-w-md. Email + password fields. Submit button. Link to register page. Show toast on error.

---

### Register (`/register`)
Centered single card, max-w-md. Email + password fields. Role selector below: two equal-width cards side by side.
- Left card: blood drop icon + "I Want to Donate"
- Right card: hospital icon + "I Need Blood"
Selected card gets a `brand-600` border. Submit button. Link to login page.

---

### Profile Setup (`/onboarding/profile-setup`)
**Access:** Authenticated, profile incomplete only.
Full-width centered form. Show a progress indicator ("Step 1 of 2 / Step 2 of 2") for donors. Requesters only need one step.
Step 1 (all users): full_name, phone, blood_type (visual grid), city, province.
Step 2 (donors): age, weight, last_donated_at (date), is_available toggle with explanation text.
"Save & Continue" button. On complete, redirect to dashboard.

---

### Donor Dashboard (`/donor`)
- Greeting header: "Hello, {first_name}! 👋"
- Availability toggle card at top — full width, prominent. Red background when available.
- 3 stat cards in a row (or column on mobile).
- Section: "Recent Match Requests" — last 5 MatchCards.
- Link button: "Browse All Requests →"

---

### Browse Requests (`/donor/requests`)
**Access:** Donor only.
- Page header + filter bar (urgency dropdown + city text input, pre-filled with donor's city).
- List of RequestCards, sorted by urgency then recency.
- Empty state: "No matching requests in your area right now."

---

### My Matches (`/donor/matches`)
**Access:** Donor only.
- Tab bar: "Pending" | "Accepted" | "History" (completed + declined).
- List of MatchCards per active tab.
- Empty state per tab.

---

### Donation History (`/donor/history`)
- Summary: "You've donated {total_donations} times. Thank you!"
- Chronological list of donation records: hospital, date, bags.
- Empty state for new donors with encouragement text.

---

### Donor Profile (`/donor/profile`)
- Avatar (click to upload, optional — skip if short on time).
- Eligibility status banner.
- Editable form fields.
- "Save Changes" button.

---

### Requester Dashboard (`/requester`)
- Greeting header.
- Large "Create Blood Request" button (brand-600, full-width on mobile).
- 3 stat cards.
- Section: "Your Recent Requests" — last 5 RequestCards.

---

### Create Request (`/requester/create`)
- Multi-field form (see Feature F3 table).
- Blood type selector: 8-cell visual grid, one selectable.
- Urgency: 3 horizontal cards (Critical / Urgent / Normal) with icon + description, one selectable.
- "Submit Request" button. Success → navigate to Request Detail.

---

### My Requests (`/requester/requests`)
- Tab filter: All | Open | In Progress | Fulfilled.
- List of RequestCards with matched donor count shown.
- Click card → navigate to detail page.

---

### Request Detail (`/requester/requests/:id`)
- Full request info card (read-only).
- Status action buttons: "Mark as Fulfilled" / "Cancel Request" (confirm modal before action).
- Matched Donors section:
  - List of DonorCards per match.
  - Each shows: name, city, match status badge, action button if accepted.
  - "Mark as Completed" → triggers donation recording flow.
- Empty state: "No donors have volunteered yet. Your request is visible to eligible donors."

---

## 13. COMPONENT LIBRARY

### UI Primitives

**Button**
- Variants: `primary` (brand-600 bg), `secondary` (outline brand-600), `ghost` (transparent), `danger` (red-600)
- Sizes: `sm`, `md` (default), `lg`
- Props: `isLoading` (shows spinner + disables), `disabled`

**Input**
- Includes: label above, error message below in red
- Accepts React Hook Form `register` props via spread

**Select**
- Same visual style as Input
- Accepts options array of `{ label, value }`

**Textarea**
- Same visual style as Input

**Badge**
- Small rounded pill: `bg-{color}-100 text-{color}-700`
- Props: `label`, `color`

**Card**
- `bg-white rounded-xl shadow-sm p-6`
- Optional `header` and `footer` slot props

**Modal**
- Centered overlay with backdrop blur
- Props: `isOpen`, `onClose`, `title`, `children`
- Clicking backdrop calls `onClose`

**EmptyState**
- Centered layout: icon (Lucide) + title + subtitle + optional action button

**Spinner**
- Animated SVG circle. Sizes: `sm` / `md` / `lg`

### Feature Components

**UrgencyBadge** — badge with urgency label. Colors: critical=red, urgent=orange, normal=blue.

**RequestStatusBadge** — badge with status label. Colors: open=green, in_progress=yellow, fulfilled=blue, cancelled=gray.

**AvailabilityToggle** — large toggle switch. Shows green "Available" or gray "Unavailable" text. On change, calls `updateAvailability()` from `useDonorDetails` hook, shows loading state.

**RequestCard**
- Props: `request: BloodRequest`, `onVolunteer?: () => void`, `showVolunteerButton?: boolean`
- Shows: blood type badge (large), urgency badge, hospital name, city, bags needed, time posted (relative).
- Optional "I Can Donate" button.

**DonorCard**
- Props: `profile: Profile`, `donorDetails: DonorDetails`, `matchStatus: MatchStatus`, `onMarkComplete?: () => void`
- Shows: donor name, city, eligibility status, match status badge.
- Optional "Mark as Completed" button.

**MatchCard**
- Props: `match: Match`, `onAccept?: () => void`, `onDecline?: () => void`
- Shows: hospital name from joined request, urgency, city, time volunteered.
- If status is `pending`: shows Accept and Decline buttons.

---

## 14. ROUTING

```
/                               → Landing (public)
/login                          → Login (redirect to dashboard if authed)
/register                       → Register (redirect to dashboard if authed)
/onboarding/profile-setup       → ProfileSetup (authed + profile incomplete)

/donor                          → DonorDashboard
/donor/requests                 → BrowseRequests
/donor/matches                  → MyMatches
/donor/history                  → DonationHistory
/donor/profile                  → DonorProfile

/requester                      → RequesterDashboard
/requester/create               → CreateRequest
/requester/requests             → MyRequests
/requester/requests/:id         → RequestDetail
/requester/profile              → RequesterProfile (same as DonorProfile layout)

*                               → NotFound
```

All `/donor/*` and `/requester/*` routes are wrapped in `ProtectedRoute`. ProtectedRoute checks session, profile completion, and role match before rendering children.
The `AppLayout` (sidebar + topbar) wraps all authenticated pages. The `Sidebar` nav items differ per role.

---

## 15. CONSTANTS

### `src/constants/bloodTypes.ts`
- Export `BLOOD_TYPES` as a const array of all 8 blood type strings.
- Export `BLOOD_TYPE_COLORS` as a Record mapping each blood type to a Tailwind class string for visual variety (e.g., A+ → red, B+ → orange, AB+ → purple, O+ → blue, and their `-` variants lighter).

### `src/constants/provinces.ts`
- Export `PROVINCES` as a sorted string array of all 38 Indonesian provinces.

---

## 16. RISK ANALYSIS & SECURITY

### Risk Register
| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R1 | Supabase RLS misconfiguration exposes user health data | Medium | High | Test each policy via Supabase dashboard using anon role; write integration tests |
| R2 | Donor provides false health info (age, weight, conditions) | High | High | Add medical disclaimer on profile setup; PMI screening noted as required before actual donation |
| R3 | Not all team members commit to GitHub | Medium | High | Weekly commit reviews; each member owns a feature branch |
| R4 | Scope creep delays delivery | Medium | Medium | Strict MVP scope; all extra ideas go to "Future Features" section in report |
| R5 | Blood type mismatch in query logic | Low | High | Unit test `isEligibleToDonate` and matching query; test with all 8 blood types |
| R6 | Expired requests remain visible | Medium | Medium | Always filter `expires_at IS NULL OR expires_at > NOW()` in browse queries |
| R7 | Duplicate volunteer attempts | Low | Low | Handled by UNIQUE constraint on `matches(request_id, donor_id)`; catch error on frontend |
| R8 | API keys exposed in Git | Low | Critical | `.env` in `.gitignore`; `.env.example` committed instead |
| R9 | Legal non-compliance with Indonesian Government Regulation PP 7/2011 on blood services | Medium | High | Reframe platform as donor mobilization tool for PMI; no direct donor-recipient transfer |

### Security Measures
- **Row Level Security** on all Supabase tables — users can only read/write their own data.
- **Auth via Supabase** — industry-standard JWT-based, no custom session logic.
- **Input validation** via Zod schemas on all forms — prevents malformed data submission.
- **UUIDs** for all IDs — not guessable sequential integers.
- **No health data in URLs** — sensitive donor details only accessible via authenticated API calls.

### Ethical & Legal Considerations
- **Legal Compliance:** Complies with PP 7/2011 and Indonesian Law UU 17/2023. ResQBlood is built purely as a voluntary mobilization platform, ensuring that actual screening, processing, and distribution of blood are mediated strictly by authorized PMI/UTD branches.
- **Privacy:** Donor health data is private by RLS policy — requesters cannot see donor weight/age, only name and city.
- **Opt-in Matching:** Matching is completely voluntary — donors must actively choose to volunteer to go to a PMI branch, with no forced assignment.
- **Clear Disclaimers:** Medical disclaimer on onboarding: "ResQBlood is a mobilization coordination tool. All donations must be made at an official PMI/UTD branch."

---

## 17. TESTING PLAN

### Unit Tests (Vitest)
Test file: `src/__tests__/utils.test.ts`
Write tests for every function in `utils.ts`:
- `isEligibleToDonate(null)` → `true`
- `isEligibleToDonate(dateMoreThan90DaysAgo)` → `true`
- `isEligibleToDonate(dateLessThan90DaysAgo)` → `false`
- `getUrgencyLabel('critical')` → `'Kritis'`
- `getUrgencyLabel('urgent')` → `'Mendesak'`
- `getStatusLabel('open')` → `'Terbuka'`
- `getStatusLabel('fulfilled')` → `'Terpenuhi'`
- `formatDate('2024-01-15')` → correct Indonesian locale string

Test file: `src/__tests__/constants.test.ts`
- `BLOOD_TYPES.length` → `8`
- All 8 standard blood type values are present

### Integration / Manual Tests
Document all test cases in a spreadsheet (or Notion table) with: Test ID, Feature, Steps, Expected Result, Actual Result, Pass/Fail, Screenshot.

| ID | Feature | Scenario |
|----|---------|---------|
| TC-01 | Register | Successful registration as donor |
| TC-02 | Register | Successful registration as requester |
| TC-03 | Login | Correct credentials → dashboard |
| TC-04 | Login | Wrong password → error toast |
| TC-05 | Profile Setup | All fields filled → redirect to dashboard |
| TC-06 | Profile Setup | Missing required field → validation error |
| TC-07 | Create Request | Valid form → request appears in My Requests |
| TC-08 | Browse Requests | Donor with A+ only sees A+ requests |
| TC-09 | Volunteer | Donor clicks "I Can Donate" → match created |
| TC-10 | Volunteer | Donor tries to volunteer twice → error shown |
| TC-11 | Availability | Donor set unavailable → cannot volunteer |
| TC-12 | Accept Match | Donor accepts → status becomes "accepted" |
| TC-13 | Decline Match | Donor declines → status becomes "declined" |
| TC-14 | Mark Fulfilled | Requester marks request → status "fulfilled" |
| TC-15 | Mark Completed | Requester marks match done → donation history updated |
| TC-16 | Auth Guard | Access /donor without login → redirect to /login |
| TC-17 | Role Guard | Requester accesses /donor/* → redirect to /requester |
| TC-18 | Empty State | No matching requests → empty state component shown |
| TC-19 | Responsive | App functions on 375px mobile viewport |
| TC-20 | Expired request | Expired request not shown in browse list |

### System Test
Full end-to-end flow:
1. Register as requester → complete profile → create blood request (urgency: critical)
2. Register as donor (same blood type) → complete profile → browse → volunteer
3. Donor accepts match
4. Requester sees accepted donor → marks as completed
5. Donor's donation count increments + appears in history

### Acceptance Criteria
- [ ] User can register and select a role
- [ ] Profile completion is enforced before accessing features
- [ ] Blood type filter works correctly for all 8 types
- [ ] Volunteer → Accept → Complete flow works end-to-end
- [ ] Dashboard stats reflect real data
- [ ] App works on mobile (375px) without horizontal scroll
- [ ] Empty states are shown gracefully
- [ ] Form validation prevents invalid submissions
- [ ] Unauthorized access is blocked and redirected

---

## 18. DEPLOYMENT

### Vercel (Frontend)
1. Push `main` branch to GitHub.
2. Connect GitHub repo to Vercel (vercel.com → Import Project).
3. Set environment variables in Vercel dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Add a `vercel.json` at root to handle SPA routing:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
5. Future pushes to `main` auto-deploy.

### Supabase (Production)
- Add Vercel production URL to Auth → URL Configuration → Allowed Redirect URLs.
- Enable email confirmation in Auth settings.
- Enable database backups in project settings.

### README.md (required for GitHub)
Must include: project name, problem statement, solution, tech stack, team members with roles, how to run locally (clone → install → set env → `npm run dev`), link to live demo.

---

## 19. SE DOCUMENTATION CHECKLIST

### Notion / Portfolio Report
- [ ] Project introduction + problem statement with supporting evidence
- [ ] SDLC model selection rationale (why Agile over Waterfall)
- [ ] Sprint plan with Trello board screenshots (one per sprint)
- [ ] Use Case Diagram (draw.io or Lucidchart)
- [ ] Entity Relationship Diagram
- [ ] At least 3 Sequence Diagrams: Register, Create Request, Match Flow
- [ ] Risk register table (Section 16)
- [ ] Security measures documentation (Section 16)
- [ ] Test cases table with results + screenshots (Section 17)
- [ ] Ethical considerations section
- [ ] Emerging SE trends discussion: AI-assisted matching, real-time health platforms, DevSecOps
- [ ] Conclusions + future features roadmap

### PKM-KC Proposal
Standard Dikti PKM-KC format: title page, executive summary, background, problem formulation, objective, methodology, development plan, team structure, budget (mock), references.

### GitHub Repository
- [ ] Clean README.md
- [ ] `.env.example` committed (not `.env`)
- [ ] Feature branches visible in network graph
- [ ] All team members show consistent commit history (not just 1-2 people)
- [ ] Pull Request history with review comments visible

### Presentation Slides
- [ ] Problem statement (with real data if possible — WHO/PMI blood shortage stats)
- [ ] Solution overview and value proposition
- [ ] Tech stack diagram
- [ ] Architecture / data flow diagram
- [ ] Live demo
- [ ] Testing results summary
- [ ] Risk analysis summary
- [ ] Ethical considerations
- [ ] Future features roadmap
- [ ] Team contribution breakdown (who built what)

---
