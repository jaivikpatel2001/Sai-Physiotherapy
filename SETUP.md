# SETUP — local development

Step-by-step walkthrough to get the project running on a fresh machine.

---

## 1. Prerequisites

| Tool       | Version  | Why                                                                 |
| ---------- | -------- | ------------------------------------------------------------------- |
| Node.js    | **20+**  | Storage layer uses `node:crypto.randomUUID` & `node:fs/promises`   |
| npm        | **9+**   | Workspaces (`workspaces: ["packages/*", "backend", "frontend"]`)   |
| MongoDB    | 6+ or Atlas | Backend won't boot without a valid `MONGODB_URI`               |
| Git        | any      | The seeder is idempotent, so re-clone safe                          |

Optional:

- **Redis 7** if you flip `REDIS_URL` on (currently used only for rate-limit store; otherwise the in-memory store is fine)
- **Cloudflare R2** bucket + custom domain for production image hosting (dev runs on local-disk fallback)

---

## 2. Install

From the repo root:

```bash
npm install
```

This installs every workspace (backend, frontend, packages/*) in one pass. The post-install hook builds `@sai-physio/types` and `@sai-physio/utils` so cross-workspace imports resolve immediately.

**Common install gotcha**: workspace package refs use `"*"` (not `"workspace:*"`). npm 10 can't resolve `workspace:*` without a lockfile.

---

## 3. Configure environment

```bash
npm run setup     # installs + copies .env.example files
```

Or manually:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Then fill in real values.

### Required `backend/.env` keys

```dotenv
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/sai_physiotherapy

JWT_SECRET=<≥32 random chars>
JWT_REFRESH_SECRET=<≥32 random chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Storage — leave R2_* blank to run on local-disk fallback
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=

# SMTP (optional in dev — emails just fail silently if blank)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=SAI Physiotherapy <clinic@saiphysiotherapy.com>

# SMS / WhatsApp (optional)
SMS_PROVIDER=none
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
```

> `env.ts` validates these with Zod at boot. Missing or short secrets exit the process with a clear error.

### Required `frontend/.env.local` keys

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_GA_ID=               # leave blank in dev — analytics inert
NEXT_PUBLIC_WHATSAPP_NUMBER=+919999999999
NEXT_PUBLIC_CLINIC_PHONE=+919999999999
```

**Important**: `NEXT_PUBLIC_SITE_URL` is what drives canonical URLs, OG tags, the sitemap, and JSON-LD `@id`s. Set it to the **production** origin once deploying.

---

## 4. Seed the database

```bash
npm run seed
```

Connects to `MONGODB_URI`, populates every collection with realistic data, and prints login credentials. Re-running is safe — existing records are detected and skipped. Counts after a fresh run:

```
users                7
services             12
doctors              4
clinic settings      1
patients             70
appointments         ~297
treatment sessions   ~240
billings             ~240
blogs                6
testimonials         25
gallery items        12
cms pages            4
```

Default credentials:

| Role             | Email                          | Password         |
| ---------------- | ------------------------------ | ---------------- |
| Super Admin      | `admin@saiphysio.com`          | `Admin@123456`   |
| Doctor           | `doctor@saiphysio.com`         | `Doctor@123456`  |
| Doctor (ortho)   | `anjali@saiphysio.com`         | `Doctor@123456`  |
| Doctor (neuro)   | `rakesh@saiphysio.com`         | `Doctor@123456`  |
| Doctor (sports)  | `karan@saiphysio.com`          | `Doctor@123456`  |
| Receptionist     | `reception@saiphysio.com`      | `Recept@123456`  |
| Billing Staff    | `billing@saiphysio.com`        | `Billing@123456` |

Full reference: **[SEEDER.md](./SEEDER.md)**.

---

## 5. Run dev servers

```bash
npm run dev          # backend + frontend in parallel
# or
npm run dev:backend  # ts-node-dev, hot reload
npm run dev:frontend # next dev, fast refresh
```

Endpoints:

- API → http://localhost:5000
- Swagger UI → http://localhost:5000/api-docs
- Health → http://localhost:5000/health
- Public site → http://localhost:3000
- Admin → http://localhost:3000/admin
- Login → http://localhost:3000/login

---

## 6. Verify the install

```bash
# Backend type-check
cd backend && npx tsc --noEmit

# Frontend type-check
cd ../frontend && npx tsc --noEmit

# Full build (slow, but catches every issue)
cd .. && npm run build
```

Both must exit cleanly. If you change the public-site SSR pages or the `lib/seo` system, also run `npx next build` in `frontend/` — App Router catches metadata/layout issues only at build time.

---

## 7. Common issues

| Symptom                                                                        | Fix                                                                                                                                       |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Cannot find module '@sai-physio/types'`                                       | `npm install` from root again. The packages must symlink. Check `packages/types/package.json` references use `"*"` not `"workspace:*"`.   |
| Backend exits immediately on `npm run dev`                                     | Zod is rejecting `.env`. Read the printed error — usually `JWT_SECRET` < 32 chars or `MONGODB_URI` missing.                              |
| CORS error in the browser                                                      | `FRONTEND_URL` in `backend/.env` doesn't match where the frontend is running.                                                            |
| `401` loop after login                                                         | Refresh token rotated server-side but client cache stale. Open DevTools → Application → clear `localStorage` keys `accessToken`/`refreshToken`. |
| Port 5000 or 3000 already in use                                                | Windows: `Get-NetTCPConnection -LocalPort 5000 \| %{ Stop-Process -Id $_.OwningProcess -Force }`. macOS/Linux: `lsof -ti:5000 \| xargs kill`. |
| `env(safe-area-inset-*)` is 0 in Chrome desktop                                | Expected. These only resolve to non-zero inside a WebView with `viewportFit:'cover'` (Android/iOS). Browser ignores them.                 |
| Uploads return 500 on `/upload/image/:module`                                  | Either Multer field name mismatch (must be `file` for single or `files` for multi) or wrong module name. Check the route definition.    |
| R2 uploads silently fall back to local                                          | One of `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` is blank. Storage service logs which.    |

---

## 8. Production checklist

- [ ] `NEXT_PUBLIC_SITE_URL` = production origin (drives all SEO)
- [ ] `BACKEND_URL` = production API origin
- [ ] All five R2 vars set (otherwise local uploads will not survive a container restart)
- [ ] `FRONTEND_URL` matches the production frontend origin (CORS becomes strict)
- [ ] `NODE_ENV=production` (changes logger format, error verbosity, helmet CSP defaults)
- [ ] JWT secrets rotated; ≥32 random chars each
- [ ] MongoDB Atlas allow-list configured for the API server's egress IP
- [ ] `docker-compose.yml` reviewed if deploying via Docker

---

See also:

- **[STORE.md](./STORE.md)** — how the admin panel talks to the API
- **[STORAGE.md](./STORAGE.md)** — file upload pipeline
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — request flow + layer responsibilities
