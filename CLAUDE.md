# CLAUDE.md — AI Development Context

Context primer for Claude Code (and other AI assistants) working in this repo. Read this before making changes.

---

## 1. Project Overview

**SAI Physiotherapy Spine Care & Paralysis Centre** is a clinic management platform for a real physiotherapy practice in Ahmedabad, Gujarat. The platform consists of:

- A **public marketing website** (services, doctors, blog, testimonials, online appointment booking).
- An **admin/clinic-staff portal** (patient records, appointment calendar, SOAP notes, billing/invoicing, analytics).
- A **REST API** backing both — with RBAC, JWT auth, file uploads, email/SMS notifications.

The codebase is a TypeScript monorepo using **npm workspaces**. Both apps share types and utilities through internal packages.

---

## 2. Architecture

```
┌──────────────┐    HTTPS    ┌────────────────────┐
│   Browser    │ ──────────► │  Next.js Frontend  │
└──────────────┘             │  (SSR + Client)    │
                             └─────────┬──────────┘
                                       │ axios + JWT (Bearer)
                                       ▼
                             ┌────────────────────┐
                             │  Express API       │
                             │  /api/v1/*         │
                             └─────────┬──────────┘
                                       │ Mongoose
                                       ▼
                             ┌────────────────────┐
                             │  MongoDB Atlas     │
                             └────────────────────┘
                External services: Cloudinary, SMTP, MSG91, WATI, Redis (opt.)
```

- **Stateless API**: JWT in `Authorization: Bearer <token>` header. Refresh token persisted on `User.refreshToken`.
- **Shared types**: `@sai-physio/types` and `@sai-physio/utils` are consumed by both apps so DTOs/enums stay in sync.
- **Reverse proxy**: `nginx.conf` fronts `/api/`, `/api-docs/`, and `/health` to the backend; `/` to the frontend (in Docker deploy).

---

## 3. Repository Layout

```
sai-physiotherapy/
├── backend/                        Express + TypeScript API
│   ├── src/
│   │   ├── app.ts                  Express app (middleware pipeline)
│   │   ├── server.ts               HTTP listener + DB connect
│   │   ├── config/
│   │   │   ├── env.ts              Zod-validated env loader
│   │   │   ├── db.ts               Mongoose connection
│   │   │   ├── logger.ts           Winston logger
│   │   │   └── swagger.ts          OpenAPI 3.0 spec
│   │   ├── routes/                 11 route modules (auth, patient, …)
│   │   ├── controllers/            HTTP handlers (1:1 with routes)
│   │   ├── models/                 Mongoose schemas (9 collections)
│   │   ├── middleware/             auth, error, validate
│   │   ├── services/               notification.service.ts (email/SMS/WA)
│   │   └── utils/                  jwt.ts, id-generator.ts, response.ts
│   ├── scripts/seed.ts             Seed users + services + settings
│   └── .env.example
├── frontend/                       Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/           Marketing site routes
│   │   │   ├── (auth)/             login, forgot/reset password
│   │   │   └── admin/              Staff portal routes
│   │   ├── components/             UI + layout + section components
│   │   ├── lib/
│   │   │   ├── api.ts              Axios instance + per-resource API objects
│   │   │   ├── auth.ts             Auth helpers
│   │   │   ├── store/authStore.ts  Zustand store (user, tokens)
│   │   │   └── hooks/              useAuthGuard, etc.
│   │   └── styles/                 CSS modules + globals
│   └── .env.example
├── packages/
│   ├── types/                      @sai-physio/types (UserRole, PERMISSIONS, model interfaces)
│   ├── utils/                      @sai-physio/utils (date helpers, id generators)
│   └── configs/                    tsconfig.base.json
├── docker-compose.yml              Backend + Mongo + Redis + Nginx
├── nginx.conf
├── DESIGN.md                       Brand & design system
└── package.json                    npm workspaces root
```

---

## 4. Main Technologies

**Frontend** — Next.js 14 (App Router, server components), React 18, TypeScript 5, Zustand (auth state), Framer Motion (animations), Lenis (smooth scroll), React Hook Form + Zod (forms), Axios, TanStack Table, Recharts, Lucide + Remixicon icons. Styling via **CSS Modules** (no Tailwind).

**Backend** — Express 4, Mongoose 8, Zod (request + env validation), Winston (logging), Helmet + CORS + rate-limit + mongo-sanitize + xss-clean (security), Swagger (`swagger-jsdoc` + `swagger-ui-express`), JSONWebToken, bcryptjs, Multer + Cloudinary (uploads), Nodemailer, PDFKit.

**Runtime** — Node 20+, npm 9+ workspaces, MongoDB 7, optional Redis 7.

---

## 5. Environment Setup

1. Install: `npm install` from repo root. The `postinstall` hook builds the shared `packages/*` workspaces.
2. Create env files: `npm run env:copy` (copies `*.env.example` → `*.env`/`.env.local` if missing).
3. Fill in:
   - **backend/.env**: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, Cloudinary keys, SMTP creds, MSG91 keys (if SMS), WATI token (if WhatsApp), `REDIS_URL` (optional).
   - **frontend/.env.local**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CLINIC_PHONE`.
4. Seed: `npm run seed` (creates super admin, doctor, receptionist, 12 services, clinic settings).
5. Run: `npm run dev`.

Env vars are validated at boot by `backend/src/config/env.ts` (Zod) — the server will refuse to start if required vars are missing or malformed.

---

## 6. Development Workflow

- **One root install**: `npm install` handles all workspaces. Don't `cd backend && npm install` separately unless adding a package: `npm install <pkg> -w backend`.
- **Hot reload**: backend uses `ts-node-dev --respawn --transpile-only`; frontend uses Next.js dev server. Both watch their own `src/`.
- **Shared packages**: editing `packages/types` or `packages/utils` requires no rebuild step locally because TS path mapping resolves directly to source. Production builds compile them via the `postinstall` hook.
- **API client pattern**: don't call `fetch` from components. Use the per-resource API objects in [frontend/src/lib/api.ts](frontend/src/lib/api.ts) (`patientsApi`, `appointmentsApi`, etc.). Auth and 401-refresh are handled centrally there.
- **Adding an endpoint**: add Mongoose model → controller → route → register route in `app.ts` → add JSDoc/Swagger annotation → add to frontend `lib/api.ts`.
- **Adding a frontend page**: drop a folder under `app/(public)/`, `app/(auth)/`, or `app/admin/`. Admin routes should call `useAuthGuard` and check `user.role`.

---

## 7. Build & Deployment

- **Build**: `npm run build` runs `tsc` for backend (outputs `backend/dist/`) and `next build` for frontend (outputs `frontend/.next/`).
- **Start (prod)**: `npm run start` runs `node dist/server.js` and `next start` concurrently.
- **Docker**: `docker-compose up -d` brings up backend, MongoDB 7, Redis 7, and Nginx. Backend container uses `backend/Dockerfile`. Nginx terminates HTTP and proxies `/api/`, `/api-docs/`, `/health` to backend.
- **Frontend deploy**: typically deployed standalone to Vercel; backend deployed to a VM / container host. When deployed separately, set `FRONTEND_URL` (backend CORS) and `NEXT_PUBLIC_API_URL` (frontend) accordingly.

---

## 8. Important APIs & External Services

| Service       | Purpose                                          | Where it's wired                         |
|---------------|--------------------------------------------------|------------------------------------------|
| MongoDB Atlas | Primary datastore                                | `backend/src/config/db.ts`               |
| Cloudinary    | Patient docs (MRI/X-ray/reports), blog images    | `backend/src/controllers/upload.*`       |
| Nodemailer    | Appointment confirmations, billing receipts      | `backend/src/services/notification.*`    |
| MSG91         | Transactional SMS (India)                        | `notification.service.ts`                |
| WATI          | WhatsApp business messaging                      | `notification.service.ts`                |
| Redis         | Optional — caching / rate-limit store            | reserved, env-gated                      |
| Swagger UI    | Self-served API docs at `/api-docs`              | `backend/src/config/swagger.ts`          |

---

## 9. Coding Standards & Conventions

- **TypeScript everywhere**. No `any` except at boundaries with untyped libs; prefer Zod schemas + inferred types.
- **File names**: kebab-case for files, `*.model.ts`, `*.controller.ts`, `*.routes.ts`, `*.middleware.ts` suffixes in backend.
- **Components**: PascalCase folders/files in frontend (`components/Header/Header.tsx`), CSS Module alongside (`Header.module.css`).
- **Imports**: shared code via `@sai-physio/types` and `@sai-physio/utils`. Avoid relative imports across workspace boundaries.
- **Response shape** (backend): use the helpers in `utils/response.ts` — `{ success: boolean, data?, message?, error? }`. Frontend axios interceptors expect this shape.
- **Validation**: Zod schemas live alongside controllers; validate body/query in `validate.middleware.ts` before the handler runs.
- **Errors**: throw typed errors; the global error middleware in `middleware/error.middleware.ts` formats responses and logs via Winston.
- **No console.log in committed code** — use the Winston logger (`backend`) or remove (`frontend`).
- **Styling**: CSS Modules + design tokens from `DESIGN.md`. Do not introduce Tailwind, styled-components, or other styling systems.

---

## 10. State Management & Database

**Frontend state**
- **Zustand** (`lib/store/authStore.ts`) — auth: `user`, `accessToken`, `isAuthenticated`, `loading`, with `login()`, `logout()`, `loadUser()`, `setTokens()`. Tokens persisted in `localStorage`.
- **React Hook Form** — all forms; Zod resolvers for validation.
- **Server state**: currently raw axios in components / route loaders (no TanStack Query yet). If you add it, do so consistently.

**Database (MongoDB via Mongoose)** — collections:
- `users` — staff + patient login accounts; refresh token stored here.
- `patients` — clinical profile (`personalInfo`, `medicalHistory`, `documents[]`, `assignedDoctor`, `status`).
- `appointments` — `patient`, `doctor`, `service`, `scheduledAt`, `status`, `tokenNumber`, reminder flags.
- `treatmentsessions` — per-visit clinical record with SOAP notes, vitals, recovery %.
- `billings` — invoice items, totals, payment status; auto-generated `invoiceNumber`.
- `services`, `blogs`, `testimonials`, `clinicsettings` — public content.

ID generation (patient IDs, appointment tokens, invoice numbers) uses helpers in `@sai-physio/utils` and `backend/src/utils/id-generator.ts`.

---

## 11. Authentication Flow

1. **Login** (`POST /auth/login`) — verifies email + password (bcrypt), returns `{ accessToken, refreshToken, user }`. Refresh token is also stored on `User.refreshToken`.
2. **Client storage** — frontend stores tokens in `localStorage` via `authStore.setTokens()`; axios request interceptor attaches `Authorization: Bearer <accessToken>` on every call.
3. **Authenticate middleware** (`backend/src/middleware/auth.middleware.ts`) — verifies JWT with `JWT_SECRET`, loads user, attaches `req.user`.
4. **Authorize middleware** — RBAC; pass allowed roles (`authorize('admin', 'super_admin')`). Roles come from the `UserRole` enum in `@sai-physio/types`.
5. **401 → refresh** — axios response interceptor (`frontend/src/lib/api.ts`) catches 401, calls `POST /auth/refresh-token`, replays the original request. On refresh failure, logs out + redirects to `/login`.
6. **Logout** — clears `User.refreshToken` server-side and `localStorage` client-side.

Access token TTL = `JWT_EXPIRES_IN` (default 15m); refresh = `JWT_REFRESH_EXPIRES_IN` (default 7d).

---

## 12. Key Business Modules

- **Patient** — comprehensive intake (chief complaint, past history, surgical history, meds, allergies, comorbidities) + uploaded documents (MRI/X-ray/reports) via Cloudinary. Status: `active | discharged | followup`.
- **Appointment** — scheduling with `tokenNumber`, types (`new | followup | emergency`), status machine (`scheduled → confirmed → in_progress → completed`, plus `cancelled / no_show`). Reminder flags drive SMS/email/WhatsApp dispatch.
- **TreatmentSession** — SOAP notes (subjective, objective, assessment, plan), vitals (BP, pulse, temp, SpO2, pain scale), `treatmentsGiven[]`, `exercisesPrescribed[]`, `recoveryPercentage`, `nextSessionDate`.
- **Billing** — line items, discount (flat or %), tax, totals, payment method (`cash | upi_manual | bank_transfer | cheque | pending`), payment status (`paid | partial | pending | waived`). PDF receipt generation via PDFKit.
- **Services / Blog / Testimonials** — public content surfaces, admin CRUD.
- **Analytics** — admin dashboard aggregates: revenue, appointment counts, recovery trends.

---

## 13. Common Commands

```bash
# Setup
npm install                      # install all workspaces
npm run setup                    # install + copy .env files
npm run seed                     # seed MongoDB

# Dev
npm run dev                      # both apps in parallel
npm run dev:backend              # backend only
npm run dev:frontend             # frontend only

# Build / Run
npm run build                    # build both
npm run start                    # run both (production)

# Quality
npm run lint
npm run test

# Add a dep to a specific workspace
npm install <pkg> -w backend
npm install <pkg> -w frontend
npm install <pkg> -w @sai-physio/types

# Clean
npm run clean                    # remove dist/.next + node_modules
```

---

## 14. Troubleshooting

- **`Cannot find module '@sai-physio/types'`** — run `npm install` at the root; the workspace symlink wasn't created. If it persists, delete `node_modules` and reinstall.
- **Backend exits immediately on startup** — Zod is rejecting `.env`. Check the console; required vars (`MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`) are missing or too short (JWT secrets need ≥32 chars).
- **CORS error in browser** — `FRONTEND_URL` in `backend/.env` doesn't match the actual origin. For dev with a non-default port, update it.
- **401 loop on the frontend** — refresh token was rotated/invalidated. Clear `localStorage` and log in again. Check that `JWT_REFRESH_SECRET` didn't change between restarts.
- **Cloudinary uploads fail** — confirm the three `CLOUDINARY_*` env vars; the unsigned preset is not used — uploads are signed server-side.
- **MongoDB connection timeout** — Atlas IP allow-list. Add your current IP, or `0.0.0.0/0` for dev only.
- **Port already in use** — `5000` (API) or `3000` (web). Change `PORT` in `backend/.env`, and update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to match.
- **Old `pnpm-lock.yaml`** — this repo migrated to npm workspaces. Use `npm install`; ignore the legacy `pnpm-lock.yaml` (kept temporarily for reference and can be deleted once everyone is on npm).

---

## 15. Developer Context & Implementation Notes

- **Single-tenant**: there is no multi-clinic / multi-tenancy. `ClinicSettings` is a single document.
- **Indian context**: phone numbers default to +91, currency is INR, SMS via MSG91, time zone Asia/Kolkata (server should be configured accordingly in prod).
- **Manual UPI / cash**: payment statuses are recorded but there is **no payment gateway integration**. Receipts are issued by clinic staff.
- **Design system is fixed**: see [DESIGN.md](./DESIGN.md). Don't introduce new colors/typography ad hoc — extend the documented tokens.
- **CSS Modules only**: previous attempts to add Tailwind were reverted. Stay with CSS Modules + the design tokens.
- **`workspace:*` protocol**: package.json files reference shared packages as `"@sai-physio/types": "workspace:*"`. npm 9+ accepts this; if you upgrade npm tooling, verify resolution still works.
- **Swagger first**: when adding endpoints, write the JSDoc `@openapi` block. The `/api-docs` page is treated as the source of truth for API consumers.
- **Server-side rendering**: most public pages are server components fetching from the public API. Don't mark them `"use client"` unless you need browser-only behavior — it disables SSR/SEO.
- **Roles enum is shared**: import `UserRole` and `PERMISSIONS` from `@sai-physio/types` in both apps. Don't redefine role strings inline.
- **Phase status** — Phase 1 (backend) and Phase 2 (public site + admin scaffolding) are complete; Phase 3 (billing UI, calendar UX), Phase 4 (EMR depth, patient portal), and Phase 5 (perf/testing/deploy hardening) are in progress.
