# ARCHITECTURE

System overview, request flow, layer responsibilities, and deployment topology.

---

## High-level

```
                  ┌─────────────────────────────────────────┐
                  │ Public site (Next.js RSC + SSG)         │
                  │ /, /services, /doctors, /blog, ...      │
                  └──────────────┬──────────────────────────┘
                                 │ HTTPS · fetch with revalidate:60
                                 ▼
                  ┌─────────────────────────────────────────┐
                  │ Admin panel (Next.js client + Zustand)  │
                  │ /admin/*                                │
                  └──────────────┬──────────────────────────┘
                                 │ HTTPS · axios + JWT
                                 ▼
                  ┌─────────────────────────────────────────┐
                  │ Express API   /api/v1/*                 │
                  │  routes → controllers → models          │
                  │           ↘ services (storage, etc.)    │
                  └──────┬───────────────────────┬──────────┘
                         │ Mongoose              │ @aws-sdk/client-s3
                         ▼                       ▼
                ┌──────────────────┐     ┌──────────────────┐
                │ MongoDB Atlas    │     │ Cloudflare R2    │
                │                  │     │ (+ local fallback)│
                └──────────────────┘     └──────────────────┘
                External:  SMTP · MSG91 · WATI · GA4
```

---

## Layer responsibilities

### Frontend — public site (Server Components)

- `app/(public)/page.tsx` and friends are **async server components**
- Data is fetched via `lib/cms.ts` helpers using `fetch(...)` with `next.revalidate: 60`
- HTML streams to the crawler / browser pre-rendered — required by the SEO/AEO budget
- Client interactivity (Lenis, RouteProgress, animation, forms) lives in `'use client'` sub-components below these RSCs

### Frontend — admin panel (client + Zustand)

- Every `/admin/*` page is `'use client'`
- Data layer is the per-module Zustand stores at `src/store/*` — see **[STORE.md](./STORE.md)**
- The central axios client (`src/store/api/client.ts`) attaches `Authorization: Bearer <accessToken>` on every request, refreshes once on 401
- Components subscribe with narrow selectors so a list update doesn't re-render an unrelated card

### Frontend — admin shared components

- `components/admin/` — `PageHeader`, `AddButton`, `DataTable`, `ActionMenu`, `Modal`, `ConfirmDialog`, `FileUpload`, `StatusBadge`, `AsyncBoundary`, `TagInput`, `EmptyState`
- All themed via tokens in `app/globals.css` (no Tailwind)
- Modals carry `data-lenis-prevent` so their scroll doesn't conflict with the page-level Lenis smooth-scroll

### Backend — pipeline per request

```
Express route (with Swagger @openapi)
    ├─ rate limiter
    ├─ helmet / mongo-sanitize / compression
    ├─ auth middleware (authenticate + authorize)
    ├─ upload middleware (multer.memoryStorage) — for /upload/*
    ├─ controller — uses Mongoose models + services
    └─ response envelope: { success, data, message, pagination, error }
```

- **`config/`** — env (Zod-validated), Winston logger, Swagger spec
- **`middleware/`** — `auth`, `error`, `upload`
- **`models/`** — Mongoose schemas; one file per collection
- **`routes/`** — one `*.routes.ts` per resource, each with Swagger `@openapi` annotations
- **`controllers/`** — business logic, never imports `mongoose` directly outside the models
- **`services/`** — cross-cutting infrastructure (currently `storage.service.ts`)
- **`utils/`** — `response.ts` (envelope helpers), `id-generator.ts` (patient/appointment/invoice IDs)

### Shared packages

- **`@sai-physio/types`** — TypeScript interfaces consumed by both backend (model types) and frontend (axios response types). Built by `packages/types/tsconfig.json` on `npm install`.
- **`@sai-physio/utils`** — small pure helpers: `formatCurrency`, `formatDate`, `generateSlug`, `calculateAge`, ID prefix builders.

---

## Authentication flow

```
1. POST /auth/login
   ↓ checks email + password (bcrypt)
   ↓ signs JWT access (15m) + refresh (7d)
   ↓ stores refreshToken on User.refreshToken in the DB
   → returns { accessToken, refreshToken, user }

2. Frontend
   ↓ authStore.login() persists tokens in localStorage
   ↓ axios interceptor attaches Authorization on every subsequent request

3. On any 401 from the API:
   ↓ axios interceptor calls POST /auth/refresh-token with the stored refresh token
   ↓ if successful, retries the original request with the new accessToken
   ↓ if not, clears localStorage and redirects to /login
```

`auth.middleware.ts.authenticate` verifies the JWT and loads `req.user` from the User collection. `auth.middleware.ts.authorize(...roles)` is the RBAC gate — `super_admin` bypasses it transparently.

---

## SEO / AEO / GEO

The `lib/seo` system is intentionally separated from the rest of the frontend so SEO is a build-time guarantee, not a runtime concern:

- `clinic.ts` — single source of truth for NAP (name/address/phone)
- `content.ts` — index of programmatic content (services, blogs, doctors) for the sitemap
- `metadata.ts` — `pageMeta({ title, description, path, ... })` returns a fully populated Next.js `Metadata` object with canonical, OG, Twitter, robots
- `schema.ts` — JSON-LD builders: `siteGraph()` for the root, `serviceSchema()`, `articleSchema()`, `physicianSchema()`, `faqSchema()`, `breadcrumbSchema()`
- `track.ts` — GA4 conversion helpers, no-op when `NEXT_PUBLIC_GA_ID` is unset

Root `app/layout.tsx` injects the `@graph` (`Organization`, `MedicalOrganization`, `MedicalClinic`, `WebSite`) so every page schema can reference these as `@id`. Crawlers (Google, GPT, Perplexity, Google-Extended, Applebot-Extended) get one consistent knowledge graph for the clinic.

Client pages can't export `metadata` directly. Pattern:

```
app/(public)/<route>/
├── layout.tsx     ← server: exports metadata + <JsonLd/>
└── page.tsx       ← 'use client': interactive view
```

---

## File storage

Two-tier — see **[STORAGE.md](./STORAGE.md)** for the full pipeline.

- **Primary**: Cloudflare R2 via `@aws-sdk/client-s3` (R2 is S3-compatible at `https://<account>.r2.cloudflarestorage.com`)
- **Fallback**: local disk at `backend/uploads/{module}/yyyy/mm/<file>` served via `express.static('/uploads')`

The storage service abstracts both — controllers call `storeFile({ module, buffer, mimetype, originalName })` and get back `{ url, key, storage, mimetype, size, originalName }` without knowing which backend served the request.

---

## Deployment topology

Recommended:

```
                Internet
                   │
                   ▼
            ┌──────────────┐
            │ Cloudflare   │  ← DNS + DDoS + CDN for /uploads/* and static next assets
            └──────┬───────┘
                   │
       ┌───────────┼────────────┐
       ▼                        ▼
┌────────────┐         ┌──────────────────┐
│ Next.js    │         │ Express API      │
│ (Vercel /  │  HTTPS  │ (Railway / Fly / │
│  Cloud Run)│ ──────▶ │  Docker)         │
└────────────┘         └────────┬─────────┘
                                │ DB
                                ▼
                       ┌────────────────┐
                       │ MongoDB Atlas  │
                       └────────────────┘
```

For self-hosted deployments use the included `docker-compose.yml` — backend + MongoDB + Redis + Nginx in one stack.

Make sure on production:

- `BACKEND_URL` is the public origin of the API (drives `/uploads/*` URL building)
- `FRONTEND_URL` is the production frontend origin (CORS becomes strict)
- `NEXT_PUBLIC_SITE_URL` matches the production frontend origin (drives canonical/OG/sitemap)
- All five R2 vars set, otherwise local uploads disappear on container restart

---

## Performance budgets

Per `CLAUDE.md §0`:

- **LCP** < 2.5s
- **INP** < 200ms
- **CLS** < 0.1
- **TTFB** low (server-side render keeps the public site close to this)

Public pages stay in RSC by default. Client components are scoped to leaves (Lenis provider, RouteProgress, individual interactive sections). `next/image` with AVIF/WebP, long-cache hashed assets, lazy by default — only the LCP hero gets `priority`.

The admin panel is allowed heavier client JS — it's not in the SEO budget.

---

## Where to add a new module

1. **Backend** — model in `models/`, controller in `controllers/`, routes in `routes/` (with `@openapi`), register in `app.ts`
2. **Frontend types** — types referenced via `@sai-physio/types` if cross-cutting
3. **Frontend service** — add a `*Api` export in `store/api/services.api.ts`
4. **Frontend store** — `store/<module>/<module>.store.ts` — usually `createCrudStore(...)`, custom for non-CRUD
5. **Frontend admin page** — `app/admin/<module>/page.tsx` using the store
6. **Public-site fetcher (if visible publicly)** — add a helper to `lib/cms.ts`
7. **Docs** — append to README's API reference table

See `frontend/src/app/admin/gallery/`, `frontend/src/app/admin/doctors/`, or `frontend/src/app/admin/pages/` as reference implementations — they're the newest modules and follow the conventions exactly.
