# SAI Physiotherapy — Enterprise Clinic Management Platform

**SAI Physiotherapy Spine Care & Paralysis Centre** — Gujarat's leading physiotherapy and rehabilitation center. Full-stack TypeScript monorepo: public marketing site, patient/admin portal, and clinic management API.

## Project Structure

```
sai-physiotherapy/
├── backend/                 # Express.js REST API (TypeScript, MongoDB)
├── frontend/                # Next.js 14 App Router (public site + admin panel)
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
| Frontend    | Next.js 14 (App Router), React 18, TypeScript, Zustand, Framer Motion, React Hook Form + Zod |
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

## Documentation

- [CLAUDE.md](./CLAUDE.md) — AI-assisted dev context: architecture, modules, conventions
- [DESIGN.md](./DESIGN.md) — Brand & design system (colors, type, components)

---
*Built for SAI Physiotherapy Spine Care & Paralysis Centre — Ahmedabad, Gujarat, India*
