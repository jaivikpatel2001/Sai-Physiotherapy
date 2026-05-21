# CLAUDE.md — Master Development Rulebook

**Single source of truth** for all AI-assisted and human development on this project. Read this fully before changing anything. These rules **override** default behavior and must be followed exactly.

> The project must evolve as **one cohesive premium healthcare design system** — never as disconnected pages or features.

---

## 0. The 8 Non-Negotiables

Every change must preserve all of these. If a request conflicts with one, flag it before proceeding.

1. **UI consistency** — reuse the shared section/hero/card/button system. Never invent ad-hoc layouts or styles.
2. **SEO-first** — every page ships metadata + canonical + JSON-LD before it is "done".
3. **Design tokens only** — colors/space/type/radius come from `globals.css` variables. No hardcoded hex/px for branded values.
4. **Mobile-first + WebView-safe** — safe areas via `env()`, never hardcoded insets.
5. **Animation consistency** — Framer Motion, shared easing/timings, GPU-only props, `prefers-reduced-motion` honored.
6. **Performance budget** — no regression to LCP/INP/CLS/TTFB. SSR/SSG preserved; no client component unless required.
7. **Accessibility** — semantic HTML, alt text, focus states, contrast, ARIA where needed.
8. **Reuse before create** — search for an existing component/util/token first; extend it rather than duplicate.

---

## 1. Project Overview

**SAI Physiotherapy Spine Care & Paralysis Centre** — a clinic management platform for a real physiotherapy practice in Ahmedabad, Gujarat:

- **Public marketing site + mobile-app-style experience** (services, doctors, blog, testimonials, online booking).
- **Admin/clinic-staff portal** (patient records, calendar, SOAP notes, billing, analytics).
- **REST API** backing both — RBAC, JWT, file uploads, email/SMS/WhatsApp.

TypeScript monorepo, **npm workspaces**. Shared types/utils via internal packages.

---

## 2. Architecture

```
Browser ──HTTPS──▶ Next.js 14 (App Router, SSR/SSG)
                       │ axios + JWT (Bearer)
                       ▼
                 Express API  /api/v1/*
                       │ Mongoose
                       ▼
                 MongoDB Atlas
   External: Cloudinary · SMTP · MSG91 · WATI · Redis(opt) · GA4
```

- **Stateless API**: JWT in `Authorization: Bearer`; refresh token on `User.refreshToken`.
- **Shared types**: `@sai-physio/types` / `@sai-physio/utils` consumed by both apps. Imported via `*` (npm workspaces) — **not** `workspace:*`.
- Reverse proxy `nginx.conf` in Docker deploy.

---

## 3. Repository Layout (current)

```
sai-physiotherapy/
├── backend/                         Express + TS API (conventions §9/§13)
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx           Root: <html>, viewport, metadata, siteGraph JSON-LD, Preloader, Analytics
│       │   ├── robots.ts            Dynamic robots (AI crawlers allowed)
│       │   ├── sitemap.ts           Dynamic XML sitemap (static + programmatic)
│       │   ├── manifest.ts          PWA manifest
│       │   ├── globals.css          DESIGN SYSTEM — all tokens + shared utilities
│       │   ├── (public)/
│       │   │   ├── layout.tsx       Public shell: RouteProgress, Header, Footer, WhatsApp, BottomNav
│       │   │   ├── template.tsx     Per-route premium page transition (Framer Motion)
│       │   │   ├── page.tsx         Home
│       │   │   ├── <route>/
│       │   │   │   ├── layout.tsx   SERVER layout: pageMeta() + JsonLd (required for client pages)
│       │   │   │   └── page.tsx     Page (often 'use client')
│       │   │   └── <route>/[slug]/layout.tsx  generateMetadata + JsonLd per slug
│       │   ├── (auth)/              login, forgot/reset password
│       │   └── admin/               Staff portal (noindex)
│       ├── components/
│       │   ├── layout/              Header, Footer, MobileBottomNav
│       │   ├── sections/            Home/page section blocks
│       │   ├── seo/                 JsonLd, Breadcrumbs, MedicalDisclaimer, Analytics
│       │   ├── ui/                  WhatsAppFloat, RouteProgress, Preloader/
│       │   └── providers/           SmoothScroll (Lenis, exposes window.__lenis)
│       └── lib/
│           ├── api.ts               Axios instance + per-resource API objects
│           ├── auth.ts, store/, hooks/
│           └── seo/                 clinic.ts · content.ts · metadata.ts · schema.ts · track.ts
├── packages/{types,utils,configs}
├── CLAUDE.md  DESIGN.md  README.md
```

---

## 4. Tech Stack

**Frontend** — Next.js 14 (App Router, RSC), React 18, TS 5, **CSS Modules only** (no Tailwind / styled-components), Zustand (auth), Framer Motion (transitions/animation), Lenis (smooth scroll), React Hook Form + Zod, Axios, Recharts, Lucide + Remixicon.

**Backend** — Express 4, Mongoose 8, Zod, Winston, Helmet/CORS/rate-limit/mongo-sanitize/xss-clean, Swagger, JWT, bcryptjs, Multer+Cloudinary, Nodemailer, PDFKit.

**Runtime** — Node 20+, npm 9+ workspaces, MongoDB 7, optional Redis 7.

---

## 5. UI / UX Consistency Rules

> Full visual spec in **[DESIGN.md](./DESIGN.md)**. This section is the enforcement contract.

### 5.1 Brand palette (tokens in `globals.css :root`)
| Role | Token | Value | Usage |
|---|---|---|---|
| Primary | `--color-primary` | `#46a2b7` Teal | Buttons*, icons, highlights, focus rings, dividers, section accents, link emphasis |
| CTA accent | `--color-accent-cta` | `#eb783d` Warm Orange | **CTA buttons only** (`.btn-primary`, primary "Book"/"Download" actions) |
| Dark | `--color-brand-navy` / `-mid` | `#0c2641` / `#1b4b66` | Hero phone frames, dark CTA bands, app-shell, theme-color |
| Soft aqua | `--color-brand-aqua` / `--color-tint-sky` | `#bfd6d9` | Light/tinted cards & surfaces |
| Off-white | `--color-surface-soft` | `#f6faf9` | Body background, alt sections |

\* `.btn-primary` resolves to `--color-accent-cta` (orange) because it is the dominant CTA. General teal buttons/links use `--color-primary`. **Never** reintroduce the legacy purple (`#5645d4`).

**Token discipline:** In CSS Modules use the legacy aliases for consistency with the rest of the codebase: `--color-text`, `--color-text-muted`, `--color-text-charcoal`, `--color-white`, `--color-border`, `--color-border-light`, `--color-border-strong`. Never hardcode branded hex/px — extend tokens in `globals.css`.

### 5.2 Canonical hero (every page top section uses this)
```tsx
<section className={styles.hero}>
  <div className={`${styles.heroMesh} hero-aura`} aria-hidden />
  <div className="container">
    <p className="section-label" style={{ justifyContent: 'center' }}>LABEL</p>
    <h1 className={styles.heroTitle}>Title <span className="gradient-text">Word</span></h1>
    <p className={styles.heroDesc}>One-sentence value statement.</p>
    {/* optional centered content below */}
  </div>
</section>
```
- `.hero`: `position:relative; background:var(--color-canvas); padding:var(--space-20) 0; text-align:center; overflow:hidden`
- `.heroMesh`: `position:absolute; inset:0; background:transparent; pointer-events:none`
- `.hero-aura` (global, in `globals.css`) provides the shared calming backdrop (brand mesh + breathing ring + dot grid). **Every** hero's mesh div must carry `hero-aura`.
- `.heroTitle`: `var(--font-display)`, weight 800, `-0.035em`, `var(--text-h1)`, gradient-text span. `.heroDesc`: `var(--text-lg)`, `--color-text-muted`, `max-width` + `margin:0 auto`.

### 5.3 Section pattern
- Spacing/rhythm: **global `.section` class** (`globals.css`, responsive at 768/480). Never redefine section padding in a module.
- Backgrounds: module modifier class only (e.g. `.sectionAlt { background: var(--color-surface-soft) }`). Pattern: ``<section className={`section ${styles.sectionAlt}`}>``.
- Headers: global utilities `section-header`, `section-label`, `section-title`, `section-desc`. Title accent word wrapped in `<span>` (renders teal).
- Self-contained special bands (stats, CTA) may own padding like `.body`/`.cta` — keep the `var(--space-20) 0` rhythm.

### 5.4 Spacing / type / radius / breakpoints
- Space scale `--space-1..--space-32` (+`--space-hero`). Sections `var(--space-20) 0` (→16 @768 →12 @480).
- Type scale `--text-micro..--text-hero`; headings `var(--font-display)` (Inter) weight 700–800, `-0.035em`.
- Radius: buttons `--radius-md` (8px), cards `--radius-lg` (12px), pills/badges `--radius-full`.
- Breakpoints: **1100 / 900 / 768 / 600 / 480**. Grids collapse 4→2→1. Split sections stack with the visual element re-ordered above text on mobile.

### 5.5 Cards, buttons, badges
- Use `.card`, `.card-feature`, `.btn`, `.btn-primary` (orange CTA), `.btn-secondary`, `.badge*`, `.surface-*`, tint classes from `globals.css`. Hover = `translateY(-1..3px)` + shadow token. Extend these, don't fork.

---

## 6. SEO + AEO + GEO Standards (SEO-first development)

> System lives in `src/lib/seo/` + `src/components/seo/`. A new page is **not done** until it satisfies this section.

### 6.1 Mandatory per-page checklist
1. **Metadata** via `pageMeta({ title, description, path, keywords?, image?, type?, ... })` from `@/lib/seo/metadata`. Never hand-write `metadata` objects. It provides canonical, OG, Twitter, robots automatically.
2. **JSON-LD** via `<JsonLd data={...} />` (`@/components/seo/JsonLd`): always a `breadcrumbSchema([...])` + the page-type schema (`serviceSchema`, `articleSchema`, `physicianSchema`, `faqSchema`, … from `@/lib/seo/schema`).
3. **Client pages** (`'use client'`) cannot export metadata → add a sibling **server `layout.tsx`** that exports `metadata`/`generateMetadata` and renders `<JsonLd/>` + `{children}`. Required pattern — see `doctors/`, `blog/`, `services/[slug]/`.
4. **Programmatic content** (services/blog/doctors) is registered in `src/lib/seo/content.ts` so `sitemap.ts`, schema and `generateMetadata` pick it up automatically. Add new slugs there.
5. **NAP / entity data** comes only from `src/lib/seo/clinic.ts` (single source of truth). Never duplicate address/phone/hours/geo inline.

### 6.2 Global structured data
Root layout injects `siteGraph()` — an `@id`-linked `@graph`: `Organization`+`MedicalOrganization`, `MedicalClinic`+`Physiotherapy`+`LocalBusiness`, `WebSite`+`SearchAction`. Page schemas reference these via `@id` (`/#organization`, `/#clinic`, `/#website`). Keep entity references consistent — this is the core **GEO** signal that lets ChatGPT/Gemini/Perplexity/Google AI resolve one knowledge graph.

### 6.3 AEO (answer-engine) content rules
- Real semantic HTML: one `<h1>` per page, ordered `h2`/`h3`, `<section>`, `<article>`, `<nav aria-label>`.
- FAQ content is Q/A structured and emits `faqSchema`. Treatment/condition explanations: clear, self-contained, snippet-sized paragraphs.
- Healthcare/YMYL pages include author + `reviewedBy` (in `articleSchema`) and a `<MedicalDisclaimer/>` (EEAT).
- `robots.ts` explicitly allows `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`.

### 6.4 Technical SEO invariants
- SEO-friendly lowercase hyphenated URLs; canonical always absolute via `SITE_URL` (prod origin, never localhost).
- `metadataBase` + `alternates.canonical` always set. `admin`/auth routes `noindex` (robots disallow).
- Internal linking: cross-link services ↔ conditions ↔ blog ↔ booking. Breadcrumbs on every sub-page.
- Images: `next/image`, descriptive `alt`, AVIF/WebP (next.config), lazy by default, `priority` only for the LCP hero.
- Analytics: `Analytics` component (GA4) is env-gated by `NEXT_PUBLIC_GA_ID`; conversions via `track()` / `CONVERSION.*` from `@/lib/seo/track`.

---

## 7. Performance + Animation Guidelines

### 7.1 Performance budget
- Default to **Server Components**. Add `'use client'` only for interactivity/hooks; push it to the smallest leaf.
- Preserve SSR/SSG — never make a static page dynamic without cause.
- Images via `next/image` only; long-cache static assets (configured in `next.config.js`).
- No heavy libs for what CSS/SVG can do (e.g. the preloader is pure CSS/SVG). Code-split client-only widgets.
- Targets: **LCP < 2.5s, INP < 200ms, CLS < 0.1, low TTFB**. Don't regress.

### 7.2 Animation system (already implemented — reuse, don't reinvent)
- **Page transitions**: `(public)/template.tsx` — context-aware enter animation (home = fade+scale, section = slide-up+blur, detail = zoom). App Router `template.tsx` (not `AnimatePresence`) to avoid RSC white-flash. Keyed by pathname; resets scroll via `window.__lenis`.
- **Route progress**: `RouteProgress` slim brand-gradient top bar, safe-area aware.
- **Preloader**: `components/ui/Preloader` — CSS/SVG, SSR-safe (no white screen), `MIN_VISIBLE_MS` plays ≥1 ECG-pulse cycle, 650ms fade, 7s hard cap, shown once per session.
- **Smooth scroll**: Lenis via `SmoothScroll` provider; instance on `window.__lenis`.
- **Rules**: Framer Motion is the standard. Easing `[0.22, 1, 0.36, 1]`. Durations 0.2–0.5s (micro 150–200ms). Animate **only** `opacity`/`transform`/`filter`; set & clear `will-change`. Every animation must degrade under `prefers-reduced-motion`. Premium and calm — never flashy or janky on low-end devices.

---

## 8. Mobile-First + WebView Rules

The app runs inside an Android/iOS WebView/APK. Treat it as a premium native app (YouTube-grade).

- **Viewport**: root `viewport` export = `width:device-width, initialScale:1, viewportFit:'cover'`, themeColor `#0C2641`. `appleWebApp` translucent status bar; `formatDetection.telephone:false`.
- **Safe areas — NEVER hardcode.** Always `env(safe-area-inset-*)` with `max()`/`calc()` and a `0px` fallback so normal browsers are unaffected. Implementations to follow:
  - Header top-bar fills the status-bar strip; `.header.scrolled` covers the notch (reuses the JS scroll state).
  - `.container`/`.container-wide` side padding `max(var(--space-*), env(safe-area-inset-left/right))`.
  - Body bottom clearance `calc(64px + env(safe-area-inset-bottom))` (clears bottom nav + gesture bar).
  - Bottom nav, WhatsApp float, mobile drawer all inset on the relevant sides.
  - `html { background: var(--color-canvas) }`, `body { overscroll-behavior-y:none; -webkit-tap-highlight-color:transparent }`.
- Touch targets ≥ 44px. Bottom nav is the primary mobile nav (≤768px). Layouts must never stretch desktop-style in WebView — use the breakpoints in §5.4.

---

## 9. Component & Code Architecture

- **Frontend files/folders**: PascalCase component folder + `Component.tsx` + co-located `Component.module.css`. Section blocks in `components/sections/`, shared UI in `components/ui/`, SEO in `components/seo/`, layout chrome in `components/layout/`.
- **Backend files**: kebab-case with suffixes `*.model.ts`, `*.controller.ts`, `*.routes.ts`, `*.middleware.ts`. Pipeline: model → controller → route → register in `app.ts` → Swagger `@openapi` block → add to frontend `lib/api.ts`.
- **Shared code** via `@sai-physio/types` / `@sai-physio/utils` — no cross-workspace relative imports.
- **API calls**: only through the per-resource objects in `frontend/src/lib/api.ts` (auth + 401-refresh handled centrally). Never raw `fetch` in components.
- **State**: Zustand `authStore` for auth; React Hook Form + Zod for forms; server state via RSC/route loaders.
- **Response shape** (backend): `{ success, data?, message?, error? }` via `utils/response.ts`. Validate with Zod in `validate.middleware.ts`. Throw typed errors → global error middleware. **No `console.log`** in committed code (Winston backend; remove in frontend).
- **Routes**: `app/(public)/` marketing + app, `app/(auth)/`, `app/admin/`. Admin pages call `useAuthGuard` + role check and stay `noindex`. Every new public client page gets a sibling server `layout.tsx` (SEO, §6.1).

---

## 10. Branding & Visual Direction

- **Identity**: premium physiotherapy clinic — calm, trustworthy, medically professional, modern-SaaS polish. Benchmarks: Practo/Apollo (trust + local), YouTube (mobile/native feel).
- **Color tone**: healing teal leads; warm orange is the single decisive CTA; deep navy conveys clinical authority; soft aqua + off-white keep surfaces calm and readable. Low-saturation, high-contrast text, never flashy.
- **Motion language**: gentle, breathing, easing-out — conveys care and recovery. No bouncy/aggressive motion.
- **Trust/EEAT surfaces**: doctor credentials, certifications, real clinic imagery, testimonials with ratings, medical disclaimer, transparent NAP/contact, privacy & terms. Maintain these signals on every relevant page.

---

## 11. Authentication Flow

1. `POST /auth/login` → `{ accessToken, refreshToken, user }`; refresh stored on `User.refreshToken`.
2. Frontend stores tokens in `localStorage` via `authStore.setTokens()`; axios attaches `Authorization: Bearer`.
3. `auth.middleware.ts` verifies JWT, loads `req.user`. `authorize(...roles)` for RBAC (`UserRole` from `@sai-physio/types`).
4. 401 → axios interceptor calls `POST /auth/refresh-token`, replays request; on failure logout + redirect `/login`.
5. Access TTL `JWT_EXPIRES_IN` (15m), refresh `JWT_REFRESH_EXPIRES_IN` (7d).

---

## 12. Business Modules (DB collections)

`users · patients · appointments · treatmentsessions · billings · services · blogs · testimonials · clinicsettings`. Patient (intake + Cloudinary docs, status `active|discharged|followup`), Appointment (token + status machine), TreatmentSession (SOAP + vitals + recovery%), Billing (line items, UPI/cash — **no payment gateway**, PDFKit receipts), public content surfaces, analytics aggregates. IDs via `@sai-physio/utils` + `backend/src/utils/id-generator.ts`.

---

## 13. Commands

```bash
npm install            # all workspaces (npm workspaces; package refs use "*" not workspace:*)
npm run setup          # install + copy .env files
npm run seed           # seed MongoDB
npm run dev            # backend + frontend
npm run dev:frontend   # Next.js only
npm run build          # tsc (backend) + next build (frontend)
npm run lint  / npm run test
npm install <pkg> -w frontend   # add dep to a workspace
```
Always run `npx tsc --noEmit` and `npx next build` in `frontend/` after frontend changes — the build is sensitive to layout/template/metadata/schema changes.

---

## 14. Environment

- **backend/.env**: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET` (≥32 chars), `FRONTEND_URL`, Cloudinary, SMTP, MSG91/WATI, `REDIS_URL?`. Zod-validated at boot.
- **frontend/.env.local**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` (set the **production** origin — drives canonical/OG/sitemap), `NEXT_PUBLIC_GA_ID` (enables Analytics), `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CLINIC_PHONE`.

---

## 15. Troubleshooting (project-specific)

- `Cannot find module '@sai-physio/types'` → reinstall from root; check workspace symlink. Package refs must be `"*"`, **not** `"workspace:*"` (npm 10 can't resolve the latter without a lockfile).
- Missing `tsconfig.json` in `packages/*` makes `tsc` print help and fails `postinstall` — keep the per-package tsconfig extending `packages/configs/tsconfig.base.json`.
- Backend exits on boot → Zod rejecting `.env` (missing/short secrets).
- CORS error → `FRONTEND_URL` mismatch. 401 loop → cleared/rotated refresh token; clear `localStorage`.
- Port in use (5000/3000) → free it (`Get-NetTCPConnection -LocalPort 5000 | %{ Stop-Process -Id $_.OwningProcess -Force }`).
- `env(safe-area-*)` shows 0 in a browser — expected; only non-zero in WebView with `viewportFit:'cover'`.

---

## 16. Future Development Enforcement

When implementing **anything** new, you MUST:

1. **Reuse first** — find an existing token/component/util/section/hero/card pattern and extend it. Do not create parallel systems.
2. **Match the design system** — canonical hero (§5.2), global `.section` + modifier (§5.3), tokens only (§5.1), documented breakpoints (§5.4).
3. **Ship SEO with the page** — `pageMeta()` + breadcrumb + page schema + (client pages) a server `layout.tsx`; register slugs in `content.ts`; NAP only from `clinic.ts` (§6).
4. **Keep animations consistent** — reuse `template.tsx`/`RouteProgress`/`Preloader`; Framer Motion, shared easing/timings, GPU props, reduced-motion (§7).
5. **Stay mobile-first & WebView-safe** — `env()` safe areas with fallbacks, never hardcoded; honor breakpoints; ≥44px targets (§8).
6. **Protect performance & a11y** — RSC by default, no needless client/dynamic, semantic HTML, alt text, focus/contrast (§7, §0).
7. **Verify** — `npx tsc --noEmit` + `npx next build` clean before declaring done.
8. **Update docs** — if you change architecture/tokens/SEO/animation patterns, update CLAUDE.md + DESIGN.md (+ README.md) in the same change. Docs must always mirror the real implementation.

Anything that would break UI consistency, SEO coverage, performance, accessibility, or the mobile/WebView experience is **out of spec** — surface it instead of shipping it.
