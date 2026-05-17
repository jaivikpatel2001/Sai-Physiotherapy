# SAI Physiotherapy — Enterprise Clinic Management Platform

**SAI Physiotherapy Spine Care & Paralysis Centre** — Gujarat's leading physiotherapy and rehabilitation center. Full-stack TypeScript monorepo: public marketing site, patient/admin portal, and clinic management API.

## Project Structure

```
sai-physiotherapy/
├── backend/                 # Express.js REST API (TypeScript, MongoDB)
├── frontend/                # Next.js 14 App Router (public site + admin panel)
│   └── src/
│       ├── app/             # routes + robots.ts/sitemap.ts/manifest.ts; globals.css = design system
│       ├── components/      # layout · sections · ui · seo · providers
│       └── lib/seo/         # clinic NAP · content index · pageMeta() · schema graph · track
├── packages/
│   ├── types/               # Shared TypeScript interfaces & enums
│   ├── utils/               # Shared utilities (dates, id generators)
│   └── configs/             # Shared tsconfig / ESLint
├── docker-compose.yml       # Local stack: backend + MongoDB + Redis + Nginx
├── nginx.conf               # Reverse proxy config
└── package.json             # npm workspaces root
```

## Tech Stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Frontend    | Next.js 14 (App Router, RSC/SSG), React 18, TypeScript, CSS Modules, Zustand, Framer Motion, Lenis, React Hook Form + Zod |
| SEO/AEO/GEO | `lib/seo` system — `pageMeta()`, JSON-LD entity graph, dynamic `robots`/`sitemap`/`manifest`, GA4 |
| Backend     | Express.js, TypeScript, MongoDB + Mongoose, Zod, Winston, Swagger |
| Auth        | JWT (access 15m + refresh 7d), RBAC                     |
| Storage     | Cloudinary (documents/images)                           |
| Messaging   | Nodemailer (SMTP), MSG91 (SMS), WATI (WhatsApp)         |
| PDF         | PDFKit (receipts, reports)                              |
| DevOps      | Docker, Nginx, GitHub Actions                           |

## Quick Start

### Prerequisites
- Node.js **20+**
- npm **9+**
- MongoDB (Atlas connection string or local instance)

### 1. Install everything
```bash
npm install
```
This installs all workspaces (backend, frontend, packages/*) in one pass via npm workspaces.

### 2. Configure environment
```bash
npm run env:copy
```
This copies `backend/.env.example` → `backend/.env` and `frontend/.env.example` → `frontend/.env.local` if they don't exist. Edit them and fill in `MONGODB_URI`, JWT secrets, Cloudinary keys, etc.

> Or do it manually:
> ```bash
> cp backend/.env.example backend/.env
> cp frontend/.env.example frontend/.env.local
> ```

**Key `frontend/.env.local` vars** (SEO/analytics depend on these):

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base |
| `NEXT_PUBLIC_SITE_URL` | **Production origin** — drives canonical URLs, OG, sitemap, JSON-LD |
| `NEXT_PUBLIC_GA_ID` | Enables GA4 analytics (inert if unset) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CLINIC_PHONE` | Contact CTAs |

### 3. Seed the database (first time only)
```bash
npm run seed
```
Creates default users, 12 services, and clinic settings:
- **Super Admin** — `admin@saiphysio.com` / `Admin@123456`
- **Doctor** — `doctor@saiphysio.com` / `Doctor@123456`
- **Receptionist** — `reception@saiphysio.com` / `Recept@123456`

### 4. Start dev (backend + frontend, concurrently)
```bash
npm run dev
```
- API → http://localhost:5000
- Swagger → http://localhost:5000/api-docs
- Health → http://localhost:5000/health
- Web → http://localhost:3000

## Root Scripts

| Script                    | What it does                                              |
|---------------------------|-----------------------------------------------------------|
| `npm install`             | Install all workspaces                                    |
| `npm run setup`           | Install + copy `.env.example` files                       |
| `npm run dev`             | Run backend and frontend in parallel                      |
| `npm run dev:backend`     | Backend only (ts-node-dev with hot reload)                |
| `npm run dev:frontend`    | Frontend only (Next.js dev server)                        |
| `npm run build`           | Build backend (tsc) and frontend (next build)             |
| `npm run start`           | Start both built apps in production mode                  |
| `npm run lint`            | Lint all workspaces                                       |
| `npm run test`            | Run tests across workspaces                               |
| `npm run seed`            | Seed MongoDB with starter data                            |
| `npm run clean`           | Remove build artifacts and `node_modules`                 |

## Roles & Permissions

| Role            | Access                                                       |
|-----------------|--------------------------------------------------------------|
| `super_admin`   | Full access to everything                                    |
| `admin`         | Patients, appointments, billing, reports                     |
| `doctor`        | Assigned patients, SOAP notes, prescriptions                 |
| `receptionist`  | Book appointments, register patients, collect payments       |
| `patient`       | Own appointments, history, bills                             |

## API Reference

Base URL: `/api/v1`

| Resource       | Endpoints                                                              |
|----------------|------------------------------------------------------------------------|
| Auth           | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh-token`  |
| Patients       | `GET/POST /patients`, `GET/PUT/DELETE /patients/:id`                   |
| Appointments   | `GET/POST /appointments`, `PATCH /appointments/:id/status`             |
| Sessions       | `POST /sessions`, `GET /sessions/patient/:id/recovery`                 |
| Billing        | `GET/POST /billing`, `PATCH /billing/:id/payment`                      |
| Services       | `GET /services` (public), `POST /services` (admin)                     |
| Blog           | `GET /blog` (public), `POST /blog` (admin)                             |
| Testimonials   | `GET /testimonials` (public), admin CRUD                               |
| Settings       | `GET /settings` (public), `PUT /settings` (super_admin)                |
| Analytics      | `GET /analytics/dashboard` (admin)                                     |
| Uploads        | `POST /upload` (Cloudinary signed upload)                              |

Full interactive docs: http://localhost:5000/api-docs

## Docker

```bash
docker-compose up -d    # backend + MongoDB + Redis + Nginx
docker-compose down
```

## Security

- JWT access tokens (15m) + refresh tokens (7d), rotated on use
- bcrypt password hashing (12 rounds)
- Helmet security headers, CORS allow-list per environment
- Rate limiting (200 req/15min general, 10 req/15min on auth routes)
- `express-mongo-sanitize` (NoSQL injection) + `xss-clean`

## Frontend, SEO & Mobile

- **Design system**: all tokens + shared utilities in `frontend/src/app/globals.css`. CSS Modules only (no Tailwind). Canonical hero + global `.section` pattern on every page — see [DESIGN.md](./DESIGN.md).
- **SEO/AEO/GEO**: every page uses `pageMeta()` + `<JsonLd>`; client pages get a sibling server `layout.tsx`. Site-wide `@graph` (MedicalClinic/Organization/WebSite) injected in root layout. `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` generated dynamically. AI crawlers (GPTBot, PerplexityBot, Google-Extended…) allowed.
- **Animation**: per-route transitions (`(public)/template.tsx`), `RouteProgress` bar, CSS/SVG `Preloader`, Lenis smooth scroll — Framer Motion, shared easing, reduced-motion safe.
- **Mobile/WebView**: `viewportFit:'cover'` + `env(safe-area-inset-*)` everywhere (never hardcoded); native-app bottom nav; off-white app shell.

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** — master development rulebook & single source of truth: the 8 non-negotiables, UI/SEO/animation/mobile/architecture standards, future-development enforcement. **Read before any change.**
- **[DESIGN.md](./DESIGN.md)** — design system spec: color/type/space tokens, canonical hero & section patterns, components, motion language, mobile/WebView, accessibility/EEAT.

> Docs must always mirror the real implementation. If you change architecture, tokens, SEO, or animation patterns, update CLAUDE.md / DESIGN.md (and this README) in the same change.

---
*Built for SAI Physiotherapy Spine Care & Paralysis Centre — Ahmedabad, Gujarat, India*
