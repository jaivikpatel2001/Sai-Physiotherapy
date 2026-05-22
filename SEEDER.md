# SEEDER — `npm run seed`

Idempotent database seeder at `backend/scripts/seed.ts`. Connects to `MONGODB_URI`, populates every collection with realistic data, prints credentials, and exits.

---

## Quick start

```bash
npm run seed
```

Re-running is safe — every seeder function checks for existing records by a stable natural key (email / slug / phone / patientId / title+category) before inserting.

---

## What gets seeded

After a fresh run:

| Collection           | Records | Source                                                                            |
| -------------------- | ------- | --------------------------------------------------------------------------------- |
| `users`              | 7       | `seedUsers` — fixed list (Super Admin + 4 Doctors + Receptionist + Billing Staff) |
| `services`           | 12      | `seedServices` — fixed catalog                                                    |
| `doctors`            | 4       | `seedDoctors` — rich profiles linked via `userId` to User records                 |
| `clinicSettings`     | 1       | `seedClinicSettings` — upserted (matches latest)                                  |
| `patients`           | 70      | `seedPatients` (10) + `seedBulkHistoricalData` (60 procedural)                    |
| `appointments`       | ~297    | `seedAppointments` (20) + `seedBulkHistoricalData` (~277 across 12 months)        |
| `treatmentSessions`  | ~240    | One per completed/in-progress appointment                                         |
| `billings`           | ~240    | One per completed/in-progress appointment                                         |
| `blogs`              | 6       | `seedBlogs`                                                                       |
| `testimonials`       | 25      | `seedTestimonials` (10) + `seedBulkHistoricalData` (15 extra)                     |
| `gallery`            | 12      | `seedGallery` — across all 5 categories                                           |
| `pages` (CMS)        | 4       | `seedCmsPages` — Privacy / Terms / Refund / About (all `showInFooter:true`)       |

---

## Login credentials

| Role             | Email                          | Password         |
| ---------------- | ------------------------------ | ---------------- |
| Super Admin      | `admin@saiphysio.com`          | `Admin@123456`   |
| Doctor           | `doctor@saiphysio.com`         | `Doctor@123456`  |
| Doctor (ortho)   | `anjali@saiphysio.com`         | `Doctor@123456`  |
| Doctor (neuro)   | `rakesh@saiphysio.com`         | `Doctor@123456`  |
| Doctor (sports)  | `karan@saiphysio.com`          | `Doctor@123456`  |
| Receptionist     | `reception@saiphysio.com`      | `Recept@123456`  |
| Billing Staff    | `billing@saiphysio.com`        | `Billing@123456` |

(Passwords are bcrypt-hashed at write-time via the User model `pre('save')` hook.)

---

## Seeding pipeline

The seeder runs functions in dependency order so FK references resolve cleanly:

```
seedUsers              →  returns 7 user docs
seedServices           →  returns 12 service docs
seedDoctors            →  links to User records via userId
seedClinicSettings     →  references services as featuredServices[]
seedPatients           →  references doctors as assignedDoctor
seedAppointments       →  references patient + doctor + service
seedTreatmentSessions  →  references appointment + patient + doctor
seedBillings           →  references appointment + patient
seedBlogs              →  references author (doctor)
seedTestimonials       →  no FKs (denormalised)
seedGallery            →  references createdBy (admin)
seedCmsPages           →  references createdBy + lastEditedBy
seedBulkHistoricalData →  generates +60 patients, +277 appointments,
                          +sessions, +bills, +testimonials over 12 months
```

The final step prints collection counts so you can verify nothing is empty.

---

## Bulk historical data (the heavy lift)

`seedBulkHistoricalData` is what makes the admin dashboard look realistic. It uses a **stable seeded RNG** (xmur3 + sfc32, seeded with `'sai-physio-v1'`) so re-runs produce the same data — patient phones `9000000001`–`9000000060` are idempotent keys.

### Patient distribution

- 60 patients with `createdAt` spread across the last 365 days
- Age 18–82, mix of male/female
- 70% `active`, 15% `followup`, 15% `discharged`
- 35% have at least one comorbidity (with appropriate medications)
- Distributed across 4 doctors round-robin

### Appointment distribution

277 appointments across 12 months, weighted toward more recent months:

```
12 months back → 12 appts          ← oldest
11 months back → 14 appts
... ramping up
current month  → 35 appts          ← newest
```

Status by date:

| Days from today  | Distribution                                                      |
| ---------------- | ----------------------------------------------------------------- |
| > 0 (future)     | 60% scheduled, 35% confirmed, 5% in_progress (rare)               |
| Last 7 days      | 55% completed, 20% confirmed, 10% in_progress, 10% cancelled, 5% no_show |
| 7–60 days ago    | 78% completed, 12% cancelled, 7% no_show, 3% in_progress          |
| > 60 days ago    | 88% completed, 7% cancelled, 5% no_show                           |

Each completed/in-progress appointment gets a **treatment session** (full SOAP notes + vitals + exercises + recovery%) and an **invoice**.

### Payment distribution

Payment status by invoice age:

| Days old    | Distribution                                                |
| ----------- | ----------------------------------------------------------- |
| > 60 days   | 100% paid                                                   |
| 30–60 days  | 90% paid, 10% partial                                       |
| 7–30 days   | 70% paid, 20% partial, 10% pending                          |
| Last 7 days | 50% paid, 30% partial, 20% pending                          |

This is why the dashboard's "Pending Dues" / "Monthly Revenue" / "Outstanding" widgets have realistic values.

---

## Idempotency

Every seeder function checks for an existing record before inserting:

| Function               | Idempotency key                            |
| ---------------------- | ------------------------------------------ |
| `seedUsers`            | `email`                                    |
| `seedServices`         | `slug`                                     |
| `seedDoctors`          | `slug`                                     |
| `seedClinicSettings`   | only-one-document check + upsert           |
| `seedPatients`         | `personalInfo.phone`                       |
| `seedAppointments`     | `{ patient, scheduledAt }` compound       |
| `seedTreatmentSessions`| `appointment` ref                          |
| `seedBillings`         | `appointment` ref                          |
| `seedBlogs`            | `slug`                                     |
| `seedTestimonials`     | `{ patientName, condition }`               |
| `seedGallery`          | `{ title, category }`                      |
| `seedCmsPages`         | `slug`                                     |
| `seedBulkHistoricalData` | phone `9000000001`–`9000000060` (deterministic) |

Re-running adds nothing — counts stay stable.

---

## Customizing

To add a new seed entry:

1. Find the relevant `seed*` function in `backend/scripts/seed.ts`
2. Add the record to the array literal
3. Ensure the idempotency key is unique (different email/slug/phone)
4. Re-run `npm run seed` — only your new record gets inserted

To regenerate the bulk historical data with different parameters (e.g. 100 patients instead of 60):

1. Edit `TOTAL_PATIENTS` and `APPOINTMENTS_PER_MONTH_RAMP` in `seedBulkHistoricalData`
2. Drop the existing bulk patients first (`db.patients.deleteMany({ 'personalInfo.phone': /^9000/ })`) or the idempotency check will skip the new ones
3. Re-run the seeder

---

## Wiping a collection cleanly

The seeder doesn't delete. If you need to start fresh:

```bash
# Drop everything (DESTRUCTIVE)
mongosh "$MONGODB_URI" --eval 'db.dropDatabase()'

# Or surgical — wipe just the bulk patients
mongosh "$MONGODB_URI" --eval 'db.patients.deleteMany({ "personalInfo.phone": /^9000/ })'
```

Then re-run `npm run seed`.

---

## Assets

The seeder references image paths in `frontend/public/images/...`. These resolve correctly when the frontend serves the URL (e.g. `/images/doctors/doctor_rajesh_patel.png`). On the backend they're stored as-is in the model — the URL is server-relative and works because the frontend serves them.

For production where you want real cloud-hosted images, upload your assets through the admin UI (`/admin/doctors`, `/admin/gallery`, etc.) — those go through the R2 upload pipeline and the URL persists with full storage metadata.

---

## Troubleshooting

| Symptom                                                            | Fix                                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `MONGODB_URI not found in .env file`                               | `backend/.env` missing. `cp backend/.env.example backend/.env` and fill in.                     |
| Validation errors mentioning `photo.storageKey` or `image.storageKey` | You're on an old `Doctor.model.ts` or `Gallery.model.ts` — the latest makes these fields optional. `git pull`. |
| Duplicate key error on re-run                                      | An existing record has the same `slug`/`email`/`phone` but different other fields. Check the idempotency key. |
| `Cannot find module '@sai-physio/utils'`                           | `npm install` from the repo root. Workspaces must symlink before the seeder can run.            |
| Seeder hangs                                                       | MongoDB Atlas IP allow-list. Add your egress IP to the cluster.                                  |
