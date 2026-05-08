# 🏥 SAI Physiotherapy — Enterprise Clinic Management Platform

**SAI Physiotherapy Spine Care & Paralysis Centre** — Gujarat's leading physiotherapy and rehabilitation center.

## 📁 Project Structure

```
sai-physiotherapy/
├── backend/                    # Express.js REST API (TypeScript)
├── frontend/                   # Next.js 14 App Router (Phase 2)
├── packages/
│   ├── types/                  # Shared TypeScript interfaces
│   ├── utils/                  # Shared utility functions
│   └── configs/                # Shared tsconfig + ESLint
├── docker-compose.yml
├── nginx.conf
├── turbo.json
└── pnpm-workspace.yaml
```

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, CSS Modules, Framer Motion |
| Backend | Express.js, TypeScript, MongoDB, Mongoose |
| Auth | JWT (access + refresh), RBAC |
| SMS | MSG91 (India) |
| Email | Nodemailer (SMTP) |
| Files | Cloudinary |
| PDF | PDFKit |
| Docs | Swagger UI (`/api-docs`) |
| DevOps | Docker, Nginx, PM2, GitHub Actions |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm (`npm i -g pnpm`)
- MongoDB Atlas account (or local MongoDB)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your MONGODB_URI
```

### 3. Start backend
```bash
pnpm backend:dev
```

Server runs at: `http://localhost:5000`
Swagger docs: `http://localhost:5000/api-docs`
Health check: `http://localhost:5000/health`

### 4. Seed database
```bash
pnpm seed
```

This creates:
- **Super Admin**: `admin@saiphysio.com` / `Admin@123456`
- **Doctor**: `doctor@saiphysio.com` / `Doctor@123456`
- **Receptionist**: `reception@saiphysio.com` / `Recept@123456`
- **12 physiotherapy services**
- **Default clinic settings**

## 👥 Roles & Permissions

| Role | Access |
|------|--------|
| `super_admin` | Full access to everything |
| `admin` | Patients, appointments, billing, reports |
| `doctor` | Own patients, SOAP notes, prescriptions |
| `receptionist` | Book appointments, register patients, collect payments |
| `patient` | Own appointments, history, bills |

## 📡 API Reference

Base URL: `/api/v1`

| Resource | Endpoint |
|----------|---------|
| Auth | `POST /auth/login`, `POST /auth/register` |
| Patients | `GET/POST /patients`, `GET/PUT/DELETE /patients/:id` |
| Appointments | `GET/POST /appointments`, `PATCH /appointments/:id/status` |
| Sessions | `POST /sessions`, `GET /sessions/patient/:id/recovery` |
| Billing | `GET/POST /billing`, `PATCH /billing/:id/payment` |
| Services | `GET /services` (public), `POST /services` (admin) |
| Blog | `GET /blog` (public), `POST /blog` (admin) |
| Settings | `GET /settings` (public), `PUT /settings` (super_admin) |
| Analytics | `GET /analytics/dashboard` (admin) |

Full docs: `http://localhost:5000/api-docs`

## 🐳 Docker

```bash
# Start all services (backend + MongoDB + Redis + Nginx)
docker-compose up -d

# Stop
docker-compose down
```

## 🔐 Security

- JWT access tokens (15min) + refresh tokens (7 days)
- bcrypt password hashing (12 rounds)
- Helmet security headers
- Rate limiting (200 req/15min general, 10 req/15min auth)
- MongoDB sanitization (NoSQL injection prevention)
- XSS protection
- CORS configured per environment

## 📋 Phase Roadmap

- ✅ **Phase 1** — Backend foundation (complete)
- 🚧 **Phase 2** — Next.js frontend + homepage + services pages
- ⬜ **Phase 3** — Admin panel + billing UI + appointment calendar
- ⬜ **Phase 4** — EMR features + notifications + patient portal
- ⬜ **Phase 5** — Performance + testing + deployment

---
*Built for SAI Physiotherapy Spine Care & Paralysis Centre, Ahmedabad, Gujarat, India*
