# SAI Physiotherapy — Enterprise Clinic Management Platform

**SAI Physiotherapy Spine Care & Paralysis Centre** — Gujarat's leading physiotherapy & rehabilitation centre. Full-stack TypeScript monorepo: public marketing site, patient/admin portal, and clinic management API.

---

## Table of contents

- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Root scripts](#root-scripts)
- [Roles & permissions](#roles--permissions)
- [API reference](#api-reference)
- [State management (Zustand)](#state-management-zustand)
- [File storage (R2 + local fallback)](#file-storage-r2--local-fallback)
- [Docker](#docker)
- [Security](#security)
- [Frontend / SEO / Mobile](#frontend--seo--mobile)
- [Documentation](#documentation)

---

## Project structure

```
sai-physiotherapy/
├── backend/                          # Express.js REST API (TypeScript, MongoDB)
│   ├── src/
│   │   ├── config/                   # env, logger, swagger spec
│   │   ├── controllers/              # one per resource
│   │   ├── middleware/               # auth, error, upload
│   │   ├── models/                   # Mongoose schemas
│   │   ├── routes/                   # one *.routes.ts per resource (Swagger @openapi annotations)
│   │   ├── services/                 # storage.service.ts (R2 + local fallback)
│   │   └── utils/                    # response, id-generator
│   ├── scripts/seed.ts               # idempotent seeder with 12-month historical data
│   └── uploads/                      # local file storage (gitignored)
│
├── frontend/                         # Next.js 14 (App Router)
│   └── src/
│       ├── app/                      # routes + robots.ts/sitemap.ts/manifest.ts
│       │   ├── (public)/             # marketing site (SSR/SSG)
│       │   ├── (auth)/               # login / forgot / reset
│       │   └── admin/                # admin panel (all client components, Zustand-powered)
│       ├── components/
│       │   ├── admin/                # shared admin UI (DataTable, ActionMenu, Modal, FileUpload, …)
│       │   ├── layout/               # header, footer, mobile bottom nav
│       │   ├── sections/             # public page sections
│       │   ├── ui/                   # global widgets (Preloader, WhatsAppFloat, RouteProgress)
│       │   └── seo/                  # <JsonLd>, MedicalDisclaimer, Analytics
│       ├── store/                    # Zustand stores (per-module, see STORE.md)
│       └── lib/
│           ├── cms.ts                # server-side public-page fetcher (RSC)
│           ├── seo/                  # pageMeta, clinic, schema graph, track
│           └── hooks/useAuthGuard.ts # admin route guard backed by auth store
│
├── packages/
│   ├── types/                        # Shared TypeScript interfaces & role enum
│   ├── utils/                        # Shared utilities (dates, id helpers, slugify)
│   └── configs/                      # Shared tsconfig / ESLint
│
├── docker-compose.yml                # Local stack: backend + MongoDB + Redis + Nginx
├── nginx.conf                        # Reverse proxy config
├── CLAUDE.md                         # Development rulebook (read before changes)
├── DESIGN.md                         # Design system spec
├── ARCHITECTURE.md                   # System architecture deep-dive
├── SETUP.md                          # Local-dev setup walkthrough
├── STORE.md                          # Zustand store conventions
├── STORAGE.md                        # File-upload pipeline (R2 + local)
└── SEEDER.md                         # Seeder reference
```

---

## Tech stack

| Layer            | Technology                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Frontend         | Next.js 14 (App Router, RSC/SSG), React 18, TypeScript 5, CSS Modules, **Zustand 4**, Framer Motion, Lenis, React Hook Form + Zod, Recharts |
| SEO / AEO / GEO  | `lib/seo` system — `pageMeta()`, JSON-LD entity graph, dynamic `robots`/`sitemap`/`manifest`, GA4    |
| Backend          | Express 4, TypeScript, MongoDB + Mongoose 8, Zod, Winston, Swagger (OpenAPI 3.0)                      |
| Auth             | JWT (access 15m + refresh 7d), bcryptjs, RBAC (`super_admin` · `admin` · `doctor` · `receptionist` · `patient`) |
| **Storage**      | **Cloudflare R2** (primary, S3-compatible via `@aws-sdk/client-s3`) with automatic **local-disk fallback** at `backend/uploads/{module}/yyyy/mm/` |
| Messaging        | Nodemailer (SMTP), MSG91 (SMS), WATI (WhatsApp)                                                       |
| PDF              | PDFKit (receipts, reports)                                                                            |
| DevOps           | Docker, Nginx, GitHub Actions                                                                         |

---

## Quick start

### Prerequisites

- Node.js **20+** (the seeder + storage layer use `node:crypto.randomUUID` and `node:fs/promises`)
- npm **9+** (workspaces are required)
- MongoDB (Atlas connection string or local instance)

### 1. Install everything

```bash
npm install
```

This installs all workspaces (backend, frontend, packages/\*) in one pass via npm workspaces.

### 2. Configure environment

```bash
npm run env:copy
```

Copies `backend/.env.example` → `backend/.env` and `frontend/.env.example` → `frontend/.env.local` if they don't exist. Edit each and fill in real values.

Or manually:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

**Required `backend/.env` vars** (Zod-validated at boot):

| Var                                            | Purpose                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `MONGODB_URI`                                  | Mongo connection string                                                                          |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`             | ≥32-char random strings                                                                          |
| `FRONTEND_URL`                                 | CORS allow-list origin (`http://localhost:3000` in dev)                                          |
| `BACKEND_URL`                                  | Public URL of this API (`http://localhost:5000` in dev) — used to build `/uploads/*` URLs        |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` | Cloudflare R2 credentials. Leave any blank to use **local-only** storage. |

**Required `frontend/.env.local` vars**:

| Var                                                          | Purpose                                                  |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                                        | Backend API base (`http://localhost:5000/api/v1`)        |
| `NEXT_PUBLIC_SITE_URL`                                       | **Production origin** — drives canonical, OG, sitemap   |
| `NEXT_PUBLIC_GA_ID`                                          | Enables GA4 analytics (inert if unset)                  |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CLINIC_PHONE`    | Contact CTAs                                             |

### 3. Seed the database

```bash
npm run seed
```

Idempotent. After a fresh run you have:

| Collection           | Records | Notes                                                                                                                                              |
| -------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`              | **7**   | Super Admin, 4 Doctors, Receptionist, Billing Staff                                                                                                |
| `services`           | **12**  | Full SEO block, banner image, FAQs                                                                                                                 |
| `doctors`            | **4**   | Rich public profiles linked to User records                                                                                                        |
| `clinicSettings`     | **1**   | Logo, favicon, NAP, socials, business hours, hero slides, stats, promotion banner                                                                  |
| `patients`           | **70**  | 10 hand-crafted + 60 procedurally generated (12 months of `createdAt`)                                                                              |
| `appointments`       | **~297**| Distributed across 12 months — statuses vary by date (older = mostly completed)                                                                    |
| `treatmentSessions`  | **~240**| Full SOAP notes for every completed/in-progress appointment                                                                                        |
| `billings`           | **~240**| Mixed payment scenarios (paid / partial / pending)                                                                                                  |
| `blogs`              | **6**   | Cover image, multi-paragraph HTML, view counts (500-5000 each)                                                                                     |
| `testimonials`       | **25**  | Approved / pending / featured mix; one with video URL, one with before/after images                                                                |
| `gallery`            | **12**  | Across all 5 categories (clinic / treatments / events / awards / team)                                                                             |
| `pages` (CMS)        | **4**   | Privacy Policy · Terms · Refund Policy · About Clinic (all `showInFooter:true`)                                                                    |

Login credentials printed at the end of every run. See **[SEEDER.md](./SEEDER.md)** for details.

### 4. Start dev (backend + frontend concurrently)

```bash
npm run dev
```

- API → http://localhost:5000
- Swagger → http://localhost:5000/api-docs
- Health → http://localhost:5000/health
- Web → http://localhost:3000
- Admin → http://localhost:3000/admin

---

## Root scripts

| Script                | What it does                                                                  |
| --------------------- | ----------------------------------------------------------------------------- |
| `npm install`         | Install all workspaces                                                        |
| `npm run setup`       | `npm install` + copy `.env.example` files                                     |
| `npm run dev`         | Backend + frontend in parallel                                                |
| `npm run dev:backend` | Backend only (ts-node-dev with hot reload)                                    |
| `npm run dev:frontend`| Frontend only (Next.js dev server)                                            |
| `npm run build`       | Build backend (`tsc`) + frontend (`next build`)                               |
| `npm run start`       | Start both built apps in production mode                                      |
| `npm run lint`        | Lint all workspaces                                                           |
| `npm run test`        | Run tests across workspaces                                                   |
| `npm run seed`        | Seed MongoDB with users, services, doctors, gallery, blogs, 12-month history  |
| `npm run clean`       | Remove build artifacts and `node_modules`                                     |

---

## Roles & permissions

| Role            | Access                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| `super_admin`   | Full access to every endpoint and admin module                                                    |
| `admin`         | Patients, appointments, billing, services, doctors, blog, gallery, testimonials, pages, reports   |
| `doctor`        | Assigned patients, SOAP notes, prescriptions, own appointments, can author blogs                  |
| `receptionist`  | Book appointments, register patients, collect payments                                            |
| `patient`       | Own appointments, history, prescriptions, can submit reviews                                      |

Enforced by `auth.middleware.ts` (`authenticate` + `authorize(...roles)`). `super_admin` bypasses all role checks automatically.

---

## API reference

Base URL: `/api/v1`. Every response uses the envelope `{ success, data?, message?, error?, pagination? }`.

**Full interactive docs**: http://localhost:5000/api-docs

| Resource         | Endpoints (selected)                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Auth**         | `POST /auth/login` · `POST /auth/register` · `POST /auth/refresh-token` · `POST /auth/logout` · `GET /auth/me` · `POST /auth/forgot-password` · `POST /auth/reset-password` · `PUT /auth/change-password` · `GET /auth/users` (admin) · `PATCH /auth/users/:id/toggle-status` |
| **Patients**     | `GET/POST /patients` · `GET /patients/search?q=` · `GET/PUT/DELETE /patients/:id` · `GET /patients/:id/sessions` · `GET /patients/:id/bills` |
| **Appointments** | `GET/POST /appointments` · `GET /appointments/today` · `GET /appointments/available-slots?doctorId=&date=` · `GET/PUT /appointments/:id` · `PATCH /appointments/:id/status` |
| **Sessions**     | `POST /sessions` · `GET /sessions/:id` · `PUT /sessions/:id` · `GET /sessions/patient/:patientId` · `GET /sessions/patient/:patientId/recovery` |
| **Billing**      | `GET/POST /billing` · `GET/PUT /billing/:id` · `PATCH /billing/:id/payment` · `GET /billing/reports/daily` · `GET /billing/reports/monthly` · `GET /billing/reports/outstanding` |
| **Services**     | `GET /services` (public) · `GET /services/slug/:slug` · `GET /services/:id` (admin) · `POST/PUT/DELETE /services/:id` (admin) |
| **Doctors**      | `GET /doctors` (public) · `GET /doctors/slug/:slug` · `GET /doctors/admin/list` (admin) · `GET/POST/PUT/DELETE /doctors/:id` (admin) |
| **Blog**         | `GET /blog` (public) · `GET /blog/slug/:slug` · `GET /blog/admin` (admin) · `GET/POST/PUT/DELETE /blog/:id` (admin) |
| **Testimonials** | `GET /testimonials` (public) · `POST /testimonials/submit` (public) · `GET /testimonials/admin` · `POST /testimonials/admin` · `PUT /testimonials/:id` · `PATCH /testimonials/:id/moderate` · `DELETE /testimonials/:id` |
| **Gallery**      | `GET /gallery` (public) · `GET /gallery/admin/list` (admin) · `GET/POST/PUT/DELETE /gallery/:id` (admin) |
| **Pages**        | `GET /pages?footer=true` (public) · `GET /pages/slug/:slug` · `GET /pages/admin/list` · `GET/POST/PUT/DELETE /pages/:id` (admin) |
| **Settings**     | `GET /settings` (public) · `PUT /settings` · `POST /settings/homepage` (super_admin)                                 |
| **Analytics**    | `GET /analytics/dashboard` · `/appointments/trend` · `/appointments/status` · `/appointments/upcoming` · `/revenue` · `/payments/recent` · `/services/breakdown` · `/doctors/workload` · `/doctors/top` · `/patients/growth` · `/activity/recent` · `/content/summary` |
| **Upload**       | `GET /upload/status` · `POST /upload/image/:module` · `POST /upload/images/:module` · `POST /upload/document` · `DELETE /upload` |

`:module` for upload routes ∈ `{gallery, services, doctors, testimonials, blogs, users, patients, pages, settings}`.

---

## State management (Zustand)

The **admin panel** is fully Zustand-powered. Every API call goes through a per-module store; components subscribe with narrow selectors and never call axios directly. Stores expose `devtools` + `persist` middleware (the latter on `auth` and `settings` only).

```
frontend/src/store/
├── api/
│   ├── client.ts                 # axios instance + request/response interceptors
│   └── services.api.ts           # per-resource service functions called by stores
├── constants/                    # status enum, pagination defaults, cache TTL
├── helpers/createCrudStore.ts    # factory powering blogs/services/doctors/gallery/pages
├── shared/                       # ui.store (toasts), settings.store (clinic settings)
├── auth/auth.store.ts            # persisted: user + tokens
├── services/, doctors/, blogs/,  # per-module stores
│   gallery/, testimonials/,
│   pages/, users/, patients/,
│   appointments/, billings/,
│   sessions/, analytics/, upload/
└── index.ts                      # barrel — one import path
```

Usage:

```tsx
import { useBlogsStore } from '@/store';

const posts    = useBlogsStore((s) => s.items);
const loading  = useBlogsStore((s) => s.status === 'loading');
const fetch    = useBlogsStore((s) => s.fetchList);
const remove   = useBlogsStore((s) => s.remove);

useEffect(() => { void fetch(); }, [fetch]);
```

The **public site stays Server-Component-based** and fetches via `frontend/src/lib/cms.ts` (server-side `fetch` with `next.revalidate: 60`). Redux/Zustand can't run in RSC, and this preserves the project's SEO/LCP budget. See **[STORE.md](./STORE.md)** for conventions.

---

## File storage (R2 + local fallback)

The storage layer (`backend/src/services/storage.service.ts`) writes uploads to **Cloudflare R2** when configured. On any R2 failure (network, auth, quota, or missing creds) it transparently falls back to local disk at `backend/uploads/{module}/yyyy/mm/<timestamp>-<uuid>.<ext>`. The same URL shape is served by Express via `app.use('/uploads', express.static(...))`.

Module folders are enforced (no flat dump):

```
backend/uploads/
├── gallery/
├── services/
├── doctors/
├── testimonials/
├── blogs/
├── users/
├── patients/
├── pages/
└── settings/
```

Endpoints:

- `POST /upload/image/:module` — single file (`field=file`), max 5MB
- `POST /upload/images/:module` — multi (`field=files`, up to 10)
- `POST /upload/document` — PDF/image patient documents, max 10MB
- `DELETE /upload` — remove by `{ key, storage }`

See **[STORAGE.md](./STORAGE.md)** for the full pipeline.

---

## Docker

```bash
docker-compose up -d    # backend + MongoDB + Redis + Nginx
docker-compose down
```

---

## Security

- JWT access tokens (15m) + refresh tokens (7d), rotated on use
- bcrypt password hashing (12 rounds)
- Helmet security headers (with cross-origin-resource-policy: `cross-origin` so `/uploads/*` can render on the Next.js origin)
- CORS allow-list (open in dev, strict in prod)
- Rate limiting (200 req/15min general, 10 req/15min on `/auth/login` + `/auth/forgot-password`)
- `express-mongo-sanitize` against NoSQL injection
- All env vars Zod-validated at boot (process exits on misconfiguration)

---

## Frontend / SEO / Mobile

- **Design system**: all tokens + shared utilities in `frontend/src/app/globals.css`. CSS Modules only (no Tailwind). Canonical hero + global `.section` pattern — see **[DESIGN.md](./DESIGN.md)**.
- **SEO/AEO/GEO**: every page uses `pageMeta()` + `<JsonLd>`; client pages get a sibling server `layout.tsx`. Site-wide `@graph` (MedicalClinic / Organization / WebSite) injected at root. `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` generated dynamically. AI crawlers (GPTBot, PerplexityBot, Google-Extended…) allowed.
- **Animation**: per-route transitions (`(public)/template.tsx`), `RouteProgress` bar, CSS/SVG `Preloader`, Lenis smooth scroll — Framer Motion, shared easing, `prefers-reduced-motion` safe. Admin sidebar and every modal carry `data-lenis-prevent` so internal scroll is isolated from the page.
- **Mobile/WebView**: `viewportFit:'cover'` + `env(safe-area-inset-*)` everywhere (never hardcoded); native-app bottom nav; off-white app shell.

---

## Documentation

| Doc                                  | What it covers                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **[CLAUDE.md](./CLAUDE.md)**         | Master development rulebook — the 8 non-negotiables, UI/SEO/animation/mobile standards. **Read before any change.** |
| **[DESIGN.md](./DESIGN.md)**         | Design system spec — tokens, hero/section patterns, components, motion, EEAT                    |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System architecture — request flow, layer responsibilities, deployment                       |
| **[SETUP.md](./SETUP.md)**           | Local dev setup walkthrough — prerequisites, env, seeding, troubleshooting                     |
| **[STORE.md](./STORE.md)**           | Zustand store conventions — folder structure, slice shape, factory usage, migration cheatsheet |
| **[STORAGE.md](./STORAGE.md)**       | File upload pipeline — R2 vs local fallback, module folders, env vars                          |
| **[SEEDER.md](./SEEDER.md)**         | Seeder reference — what each `seed*` function produces, idempotency rules, login credentials   |

> Docs must always mirror the real implementation. If you change architecture, tokens, SEO, animation, or storage patterns, update the relevant docs in the same change.

---

*Built for SAI Physiotherapy Spine Care & Paralysis Centre — Ahmedabad, Gujarat, India.*
