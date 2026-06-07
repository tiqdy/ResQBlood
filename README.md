<div align="center">

<img src="src/assets/resqblood-logo.png" alt="ResQBlood Logo" width="80" />

# ResQBlood

### Voluntary Blood Donation Matching Platform

**Connecting donors with patients across Indonesia — fast, safe, and community-driven.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://resqblood.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## Table of Contents

1. [Our Background](#our-background)
2. [Problem](#problem)
3. [ResQ Impact](#resq-impact)
4. [Our Vision & Goals](#our-vision--goals)
5. [Target Users](#target-users)
6. [How It Works](#how-it-works)
7. [Core Features](#core-features)
8. [Functional Requirements](#functional-requirements)
9. [Non-Functional Requirements](#non-functional-requirements)
10. [Project Stack](#project-stack)
11. [Software Design Pattern](#software-design-pattern)
12. [Software Architecture](#software-architecture)
13. [Project Directory Structure](#project-directory-structure)
14. [Software Development Lifecycle](#software-development-lifecycle)
15. [Risk Evaluation](#risk-evaluation)
16. [Risk Mitigation](#risk-mitigation)
17. [Getting Started](#getting-started)
18. [Team](#team)

---

## Our Background

Indonesia's voluntary blood donation system faces a structural crisis. The national blood supply is coordinated through the Indonesian Red Cross (PMI/Palang Merah Indonesia) network, yet the system remains fragmented, manually operated, and heavily dependent on informal communication channels — primarily WhatsApp group broadcasts.

When a patient urgently needs blood, hospitals typically request PMI branches to check their stock. If stock is insufficient, families and medical staff resort to posting on social media, messaging personal contacts, or manually calling multiple PMI branches across cities. This process is inefficient, inconsistent, and in critical cases, **life-threatening**.

According to the World Health Organization (WHO), Indonesia needs approximately **5.6 million units** of blood annually (2% of the ~282 million population) but consistently falls short of this target. The gap is most severe during national holidays and in smaller cities far from major PMI hubs.

**ResQBlood** was created to address this gap — not by replacing the medical system, but by empowering voluntary donors to act faster and more effectively through a coordinated digital platform.

---

## Problem

| Issue | Impact |
|-------|--------|
| Blood requests broadcast manually via WhatsApp | Slow reach, unverified info, chaotic response |
| No centralized donor database per blood type | Cannot quickly identify compatible donors nearby |
| No real-time visibility into stock shortages | Hospitals and families have no predictive info |
| Donors have no formal way to track their contributions | Low retention of voluntary donors |
| Patients face multi-hour delays finding compatible donors | Increased mortality risk in critical conditions |
| Seasonal drops during holidays | Critical supply gaps during highest-risk periods |

---

## ResQ Impact

ResQBlood is designed to create measurable, real-world impact:

- **Faster donor response** — blood requests reach compatible donors within seconds, not hours
- **Improved donor retention** — donation history and community belonging keep donors engaged
- **PMI coordination support** — PMI staff can perform and log donor screening directly on the platform
- **Transparency** — requesters can see who has volunteered and track match status in real time
- **Data for decisions** — donation patterns and blood type demand data can inform PMI stock planning
- **Community empowerment** — voluntary donors become an organized, searchable, accountable network

> A single blood donation can save up to 3 lives. ResQBlood helps more of those donations happen.

---

## Our Vision & Goals

### Vision
To become Indonesia's most trusted voluntary blood donation coordination platform — where any patient can find a compatible, willing donor within their city, and every donor can see the direct impact of their contribution.

### Goals
| Priority | Goal |
|----------|------|
| **G1** | Enable voluntary blood donors to register, set availability, and respond to compatible blood requests |
| **G2** | Allow patients/families to create blood requests and receive donor match notifications |
| **G3** | Give PMI staff tools to manage donor screenings and authorize blood-ready status |
| **G4** | Provide each user with a personal dashboard showing their real-time contribution and impact |
| **G5** | Ensure medical compliance — all donations routed through authorized PMI/UTD branches |
| **G6** | Build a scalable, secure platform that can expand to all 38 provinces of Indonesia |

---

## Target Users

### 1. Blood Donors (Voluntary)
Individuals aged 17–65, weight ≥ 45 kg, willing to donate blood at an official PMI branch. They register their blood type, city, and availability status. When a compatible request appears, they can volunteer to help.

### 2. Requesters (Patients / Families / Hospitals)
Individuals or medical representatives who need blood urgently. They create blood requests specifying blood type, bags needed, urgency level, and hospital information.

### 3. PMI Staff
Authorized staff from PMI (Palang Merah Indonesia) branches who review donor eligibility at the point of donation, log screening results, and mark blood as ready for collection.

---

## How It Works

```
Step 1: Register & Set Profile
   → Donor: blood type, age, weight, city, availability
   → Requester: name, city, contact info
   → PMI Staff: branch name, province coverage

Step 2: Create or Browse Blood Requests
   → Requester creates request: blood type, bags needed, hospital, urgency
   → Request is visible to all compatible donors in the system

Step 3: Smart Matching
   → Donors browse requests filtered by their blood type
   → Donor clicks "Volunteer" → match record created with status: Pending

Step 4: Coordination
   → Donor confirms readiness (Pending → Accepted)
   → PMI Staff performs physical health screening at branch
   → PMI marks blood as "Ready for Collection"

Step 5: Donation Completed
   → Requester or PMI confirms collection
   → Match status set to "Completed"
   → Donor's total_donations incremented
   → Donation recorded in donor's history

Step 6: Impact Tracked
   → Donor sees their lifetime donation count
   → Requester sees fulfilled request history
```

---

## Core Features

### For Donors
- **Registration** with blood type, age, weight, and city
- **Availability Toggle** — go active/inactive with one tap
- **Browse Requests** — filtered by blood type and city
- **Volunteer to Donate** — one-click response to compatible requests
- **My Matches** — manage pending, accepted, and completed matches
- **Donation History** — track lifetime donations with date and hospital
- **Eligibility Display** — live status showing days until next eligible donation (90-day rule)

### For Requesters
- **Create Blood Request** — patient name, blood type, urgency level, hospital, bags needed
- **My Requests** — view all requests with donor match count
- **Request Detail** — see all volunteers, accept/decline matches, mark as fulfilled
- **Status Lifecycle** — Open → In Progress → Fulfilled / Cancelled

### For PMI Staff
- **PMI Dashboard** — overview of pending screenings in branch area
- **Donation Screenings** — manage donor eligibility per match
- **Blood Ready Status** — mark blood as collected and ready for recipient
- **Branch Management** — province/city scoping for national or local coverage

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | Users must register with email, password, and role (Donor / Requester / PMI Staff) |
| FR-02 | Donors must complete a health profile: blood type, age (17–65), weight (≥45 kg), city, province |
| FR-03 | Requesters must fill: patient name, blood type, urgency, hospital name, city, bags needed |
| FR-04 | The system must filter blood requests by donor's blood type automatically |
| FR-05 | Donors must be able to toggle their availability status on/off |
| FR-06 | A donor can volunteer for any compatible open request (one volunteer per request) |
| FR-07 | A donor can accept or decline a pending match |
| FR-08 | PMI Staff can perform screening on matched donors and update status |
| FR-09 | Requesters can mark requests as fulfilled or cancelled |
| FR-10 | When a match is marked completed, donation history must be recorded and total_donations incremented |
| FR-11 | Each role must only see their relevant dashboard and pages (role-based access control) |
| FR-12 | Unverified or incomplete profiles must be redirected to profile setup before accessing features |
| FR-13 | All authenticated routes must redirect unauthenticated users to /login |

---

## Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | **Performance** | Page load under 2 seconds on standard broadband |
| NFR-02 | **Availability** | 99.5% uptime (leveraging Vercel + Supabase managed infrastructure) |
| NFR-03 | **Security** | All data access enforced by Supabase Row Level Security; no server-side code can bypass RLS |
| NFR-04 | **Privacy** | Donor health data (age, weight) not visible to requesters; protected by RLS policies |
| NFR-05 | **Scalability** | Architecture must support 10,000+ concurrent users without code changes |
| NFR-06 | **Responsiveness** | Full functionality on screen widths from 375px (mobile) to 1440px (desktop) |
| NFR-07 | **Accessibility** | WCAG AA compliance — ARIA labels, keyboard navigation, focus management |
| NFR-08 | **Data Integrity** | Unique constraint on (donor_id, request_id) prevents duplicate volunteer records |
| NFR-09 | **Compliance** | Platform complies with PP 7/2011 and UU No.17 Tahun 2023 on blood donation services |
| NFR-10 | **Maintainability** | TypeScript strict mode enforced; no `any` types in production code |

---

## Project Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| **Framework** | React 18 + Vite | Fast development, component-based, industry standard |
| **Language** | TypeScript (strict) | Type safety prevents runtime bugs in medical data |
| **Styling** | Tailwind CSS v4 | Utility-first, consistent design system, minimal bundle |
| **Animation** | Framer Motion | Smooth transitions for premium UX |
| **State Management** | Zustand | Lightweight global state for auth session |
| **Backend / DB** | Supabase (PostgreSQL) | Managed backend with real-time, auth, and RLS built in |
| **Authentication** | Supabase Auth | JWT-based, email/password, no custom session logic needed |
| **File Storage** | Supabase Storage | Avatar uploads with bucket policies |
| **Router** | React Router v6 | Client-side routing with nested protected routes |
| **Icons** | Lucide React | Consistent, accessible, tree-shakable icon set |
| **Notifications** | react-hot-toast | Non-intrusive user feedback toasts |
| **Utilities** | clsx + tailwind-merge | Clean conditional class merging |
| **Deployment** | Vercel | Zero-config SPA deployment with edge CDN |

---

## Software Design Pattern

ResQBlood follows several established software design patterns:

### 1. Custom Hook Pattern (React)
All data-fetching and mutation logic is encapsulated in custom hooks (`useAuth`, `useProfile`, `useDonorDetails`, `useBloodRequests`, `useMatches`). Components remain purely presentational — they receive data and call hook functions, never calling Supabase directly.

```
Component → Custom Hook → Supabase Client → Database
```

### 2. Observer Pattern (Zustand Store)
The global auth store (`authStore`) implements an observer-style pattern. Any component subscribed to `useAuthStore()` re-renders automatically when state changes — without prop drilling.

### 3. Protected Route Pattern
Route-level access control using a `ProtectedRoute` wrapper that checks authentication state, profile completion, and role before rendering children. Unauthenticated or unauthorized access results in immediate redirect.

### 4. Repository Pattern (Implicit)
Custom hooks act as a lightweight repository layer — abstracting all Supabase queries behind named functions (`fetchMyRequests`, `volunteer`, `acceptMatch`). The UI layer never writes raw SQL or Supabase calls.

### 5. Compound Component Pattern
Layout components (`AppLayout`, `Sidebar`, `TopBar`) use React composition — the `Outlet` pattern from React Router renders role-specific page content inside a shared shell.

---

## Software Architecture

ResQBlood follows a **3-tier client-serverless architecture**:

```
┌─────────────────────────────────────────────────┐
│                  CLIENT TIER                      │
│  React SPA (Vite)                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Pages   │ │Components│ │  Zustand Store   │  │
│  └──────────┘ └──────────┘ └──────────────────┘  │
│  ┌──────────────────────────────────────────────┐ │
│  │         Custom Hooks (Data Layer)            │ │
│  │  useAuth  useProfile  useBloodRequests       │ │
│  │  useDonorDetails      useMatches             │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────┘
                           │ HTTPS / REST / Realtime
┌──────────────────────────▼──────────────────────┐
│                 BACKEND TIER (Supabase)           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │  Auth (JWT) │  │  PostgREST   │  │ Storage │ │
│  └─────────────┘  └──────────────┘  └─────────┘ │
└──────────────────────────┬──────────────────────┘
                           │
┌──────────────────────────▼──────────────────────┐
│                  DATA TIER                        │
│  PostgreSQL Database                              │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ profiles │ │blood_requests│ │   matches    │ │
│  └──────────┘ └──────────────┘ └──────────────┘ │
│  ┌───────────────┐ ┌──────────────────────────┐  │
│  │ donor_details │ │    donation_history       │  │
│  └───────────────┘ └──────────────────────────┘  │
│  Row Level Security enforced on all tables        │
└─────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend rendering | SPA (Client-Side) | Fast navigation, offline-first UX pattern |
| Backend model | Serverless (Supabase) | No infrastructure to manage; scales automatically |
| Auth model | JWT via Supabase Auth | Industry-standard; RLS policies bind to `auth.uid()` |
| Database | PostgreSQL | Relational integrity for medical data; ACID compliance |
| State | Zustand (not Redux) | Minimal boilerplate for global auth session management |
| Routing | React Router v6 | Nested layouts, protected routes, role-based access |

---

## Project Directory Structure

A detailed overview of the ResQBlood project structure, illustrating the organization of source files, assets, components, state management, and configuration:

```text
ResQBlood/
├── .env                       # Local environment variables containing secrets (git-ignored)
├── .gitignore                 # Specifies intentionally untracked files to ignore
├── README.md                  # Comprehensive project documentation
├── eslint.config.js           # ESLint configuration for code quality checks
├── index.html                 # Main HTML entry point for the single page application
├── package-lock.json          # Dependency tree lockfile
├── package.json               # Project metadata and dependencies manifest
├── postcss.config.js          # PostCSS configuration for styling processing
├── supabase_schema.sql        # Database schema definitions and Row-Level Security (RLS) policies
├── tailwind.config.js         # Tailwind CSS styling and theme configuration
├── tsconfig.app.json          # TypeScript compilation configuration for application code
├── tsconfig.json              # Root TypeScript configuration
├── tsconfig.node.json         # TypeScript compilation configuration for development toolchain
├── vite.config.ts             # Vite build tool and development server configuration
├── public/                    # Static assets served directly (logo, favicon, etc.)
│   ├── favicon.svg            # Browser tab icon
│   ├── logo.svg               # SVG logo representation
│   └── resqblood-logo.png     # Brand logo PNG image
└── src/                       # Application source code directory
    ├── App.css                # Global React CSS overrides
    ├── App.tsx                # Core Application component, routing declarations, and layout setup
    ├── index.css              # Main tailwind imports and custom design tokens (HIG variables)
    ├── main.tsx               # Main entry point that renders the App component to the DOM
    ├── setupTests.ts          # Test setup script
    ├── __tests__/             # Unit tests folder
    │   ├── constants.test.ts  # Unit tests for core constants
    │   └── utils.test.ts      # Unit tests for utility functions
    ├── assets/                # Local graphic assets imported directly into TypeScript files
    │   ├── News 1.jpeg        # Blood donation news image 1
    │   ├── News 2.jpg         # Blood donation news image 2
    │   ├── News 3.jpg         # Blood donation news image 3
    │   ├── donor-darah.png    # Informational donor illustration
    │   ├── hero.png           # Hero section visual banner
    │   ├── react.svg          # React library default graphic
    │   ├── resqblood-logo.png # Logo image reference for branding
    │   └── vite.svg           # Vite tool default graphic
    ├── components/            # Reusable UI component elements
    │   ├── layout/            # Layout shells and navigation components
    │   │   ├── AppLayout.tsx      # Main wrapper with Sidebar and TopBar
    │   │   ├── ProtectedRoute.tsx # Route guard wrapper for role-based authentication and profile validation
    │   │   ├── Sidebar.tsx        # Navigation sidebar optimized for different user roles
    │   │   └── TopBar.tsx         # Header section showing profile actions and title context
    │   ├── donors/            # Components specifically for donor flows
    │   │   ├── AvailabilityToggle.tsx # Interactive toggle for donor availability status
    │   │   └── DonorCard.tsx      # Visual representation of donor details in matching interfaces
    │   ├── matches/           # Components for donation matchmaking flows
    │   │   └── MatchCard.tsx      # Card representing active donation match details and coordination actions
    │   ├── requests/          # Components for blood request cards and tags
    │   │   ├── RequestCard.tsx        # Card listing request overview (patient name, bags, hospital)
    │   │   ├── RequestStatusBadge.tsx # Semantic badge for request status (Open, In Progress, Fulfilled)
    │   │   └── UrgencyBadge.tsx       # Colored badge representing request urgency (Critical, Urgent, Normal)
    │   └── ui/                # Base design system components (Apple HIG visual guidelines)
    │       ├── Badge.tsx          # Reusable semantic tag container
    │       ├── Button.tsx         # Custom interactive button with micro-interactions and states
    │       ├── Card.tsx           # Glassmorphism container element with consistent shadows and depth
    │       ├── EmptyState.tsx     # Graceful fallback display for empty datasets
    │       ├── Input.tsx          # Standard visual text inputs
    │       ├── Modal.tsx          # Accessible popup overlay dialogue box
    │       ├── Select.tsx         # Premium dropdown selector interface
    │       ├── Spinner.tsx        # Accessible loading indicator
    │       └── Textarea.tsx       # Standard multi-line text input
    ├── constants/             # Centralized constant definition files
    │   ├── bloodTypes.ts      # Compatible blood type definitions and recipient combinations
    │   ├── cities.ts          # Static list of Indonesian cities mapped by province code
    │   ├── pmiBranches.ts     # Pre-configured PMI branch listings with coordinates and locations
    │   └── provinces.ts       # Static list of Indonesian provinces
    ├── hooks/                 # Custom React Hooks (encapsulated query and mutation repository layers)
    │   ├── useAuth.ts         # User auth operations (login, register, sign out)
    │   ├── useBloodRequests.ts# CRUD actions for creating, editing, and fetching blood requests
    │   ├── useDonorDetails.ts # Query and updates for detailed donor eligibility data
    │   ├── useMatches.ts      # Matchmaking coordination logic (volunteer, screen, complete matches)
    │   └── useProfile.ts      # Onboarding profile data queries and updates
    ├── lib/                   # External configurations and utility modules
    │   ├── supabase.ts        # Supabase client instantiation and database API helper functions
    │   └── utils.ts           # Shared general utilities (date formatting, styling helper functions)
    ├── store/                 # Zustand state stores
    │   └── authStore.ts       # Global state management for authentication session and user state
    └── pages/                 # Full view components mapped to paths in the router
        ├── Landing.tsx        # High-converting landing page with news, statistics, and onboarding entry point
        ├── NotFound.tsx       # 404 Fallback error page
        ├── auth/              # Authentication-related views
        │   ├── Login.tsx          # Sign-in portal
        │   └── Register.tsx       # Multi-step signup form and role assignment
        ├── donor/             # Voluntary Donor dashboard pages
        │   ├── BrowseRequests.tsx # Interface for active donors to discover compatible local requests
        │   ├── DonationHistory.tsx# List of completed donations with verified tags
        │   ├── DonorDashboard.tsx # Overview dashboard displaying eligibility status and current stats
        │   ├── DonorProfile.tsx   # Detailed configuration for blood profile, age, weight, and location
        │   └── MyMatches.tsx      # Active volunteering engagements and status progress
        ├── pmi/               # PMI (Indonesian Red Cross) dashboard pages
        │   ├── DonationScreenings.tsx # Detailed workflows to perform donor screening at PMI branches
        │   ├── PmiDashboard.tsx   # Dashboard with real-time statistics and pending local screenings
        │   └── PmiProfile.tsx     # Branch details management interface
        └── requester/         # Recipient / Requester dashboard pages
            ├── CreateRequest.tsx      # Multi-field form for publishing urgent blood requirements
            ├── MyRequests.tsx         # Dashboard list containing requester's own created blood requests
            ├── RequestDetail.tsx      # Real-time list of volunteering donors with action to accept/complete matches
            └── RequesterDashboard.tsx # Requester landing board showing summary of requests and matches
```

---

## Software Development Lifecycle

ResQBlood follows the **Agile Scrum** methodology across **4 sprints**.

### Why Agile?
- Allows iterative delivery core features ship first, polish follows
- Enables continuous feedback from testing and peer review
- Supports team with parallel feature development across branches
- Sprint retrospectives catch blockers early

### Sprint Plan

| Sprint | Duration | Focus | Deliverables |
|--------|----------|-------|--------------|
| **Sprint 1** | Week 1–3 | Foundation & Auth | Project setup, Supabase schema, Auth (register/login), profile onboarding |
| **Sprint 2** | Week 4–7 | Core Features | Blood request CRUD, browse & filter, volunteer/match flow |
| **Sprint 3** | Week 8–11 | Dashboards & Polish | Donor/Requester/PMI dashboards, donation history, UI refinement |
| **Sprint 4** | Week 12–14 | QA & Deployment | Testing (unit + manual), bug fixes, Vercel deployment, documentation |


## Risk Evaluation

| ID | Risk | Probability | Impact |
|----|------|-------------|--------|
| R1 | Supabase RLS misconfiguration exposes donor health data | Medium | **Critical** |
| R2 | Donor provides false health info (age, weight) | High | High |
| R3 | Unequal GitHub commit distribution across team | Medium | High |
| R4 | Scope creep beyond MVP delays delivery | Medium | Medium |
| R5 | Blood type mismatch in query/filter logic | Low | **Critical** |
| R6 | Expired blood requests remain visible to donors | Medium | Medium |
| R7 | Duplicate volunteer records for same request | Low | Low |
| R8 | API keys accidentally committed to Git | Low | **Critical** |
| R9 | Non-compliance with PP 7/2011 blood service regulations | Medium | High |
| R10 | Feature branch conflicts blocking integration | Medium | Medium |

---

## Risk Mitigation

| ID | Mitigation Strategy |
|----|---------------------|
| R1 | Test every RLS policy via Supabase Dashboard using `anon` role; write integration tests for data access boundaries |
| R2 | Display medical disclaimer on onboarding: "Actual donation requires PMI health screening." All donations occur at authorized PMI branches only |
| R3 | Weekly commit reviews; each sprint assigns specific features per member; shared PR review ensures active participation |
| R4 | Lock MVP scope in Sprint 1; all feature requests beyond MVP logged as "Future Roadmap" — not implemented |
| R5 | Unit test blood type matching for all 8 types; integration tests verify filtered results per donor profile |
| R6 | Always filter `expires_at IS NULL OR expires_at > NOW()` in all browse request queries |
| R7 | UNIQUE constraint on `matches(request_id, donor_id)` at database level; frontend catches the error and shows toast |
| R8 | `.env` in `.gitignore`; only `.env.example` (with empty values) committed; Vercel env vars set via dashboard |
| R9 | Platform framed as voluntary mobilization tool only — no direct donor-recipient transfers; all blood processed by PMI/UTD |
| R10 | Feature branch owners must rebase from `dev` before raising PRs; CI lint check on every PR |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- A Supabase project (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tiqdy/ResQBlood.git
cd ResQBlood

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env
# Then fill in your Supabase URL and Anon Key in .env

# 4. Run the SQL schema
# Copy contents of supabase_schema.sql into your Supabase SQL Editor and run it

# 5. Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file (never commit this):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder. Deploy to Vercel by connecting your GitHub repository — set the same env vars in the Vercel dashboard under **Project Settings → Environment Variables**.

---

<div align="center">

**ResQBlood** — Built with care for patients across Indonesia.

*"Every drop counts. Every donor matters."*

© 2025 ResQBlood Team

</div>
