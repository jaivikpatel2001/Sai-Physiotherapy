# STORAGE — file upload pipeline

The storage layer at `backend/src/services/storage.service.ts` writes uploaded files to **Cloudflare R2** (S3-compatible) when configured, with automatic fallback to local disk at `backend/uploads/{module}/yyyy/mm/<file>` on any failure.

---

## Why R2 + local fallback?

- **R2 is the primary store** — durable object storage, served via a CDN custom domain or `pub-*.r2.dev`. Zero egress fees.
- **Local fallback keeps dev simple** — no creds, no setup. Drop the project on any machine and uploads work immediately.
- **Auto-fallback** — if R2 returns an error (network, auth, quota), the service silently writes to local disk and logs a warning. The admin user sees no failure.

---

## Module-folder layout

Every upload lives under a module folder. The storage service rejects unknown modules at the API boundary:

```
backend/uploads/
├── gallery/      yyyy/mm/<file>
├── services/     yyyy/mm/<file>
├── doctors/      yyyy/mm/<file>
├── testimonials/ yyyy/mm/<file>
├── blogs/        yyyy/mm/<file>
├── users/        yyyy/mm/<file>
├── patients/     yyyy/mm/<file>      ← PDFs/X-rays for patient documents
├── pages/        yyyy/mm/<file>
└── settings/     yyyy/mm/<file>      ← logo/favicon
```

The same path scheme is used as the R2 key (so a file at R2 key `doctors/2026/05/abc.png` is mirrored locally at `backend/uploads/doctors/2026/05/abc.png` if it ever falls back).

Filenames are generated as `${timestamp}-${uuidWithoutHyphens}${ext}` so collisions are impossible and the original filename never leaks into URLs.

---

## Environment

```dotenv
# Backend's own public origin — used to build URLs for files served from /uploads
BACKEND_URL=http://localhost:5000

# Cloudflare R2 — leave any blank to force local-only mode
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=                    # e.g. https://cdn.saiphysio.com or https://pub-xxx.r2.dev
```

On boot the storage service evaluates whether all five R2 vars are set. If any are blank it operates in local-only mode without warning. You can confirm via `GET /api/v1/upload/status`:

```json
{ "r2Enabled": true, "driver": "r2 (primary) + local fallback", "localRoot": "/app/uploads" }
```

---

## API endpoints

All under `/api/v1/upload`. Authentication required; allowed roles are `super_admin`, `admin`, `doctor`, `receptionist`.

### `GET /upload/status`

Returns the current driver + R2 enabled flag. Useful for the admin shell to surface a "local storage active" banner.

### `POST /upload/image/:module`

Single-file upload. Form field name **`file`**. Max 5 MB. Accepts `image/png`, `image/jpeg`, `image/webp`, `image/avif`, `image/gif`, `image/svg+xml`.

```bash
curl -X POST http://localhost:5000/api/v1/upload/image/doctors \
  -H "Authorization: Bearer $TOKEN" \
  -F file=@photo.png
```

Response:

```json
{
  "success": true,
  "message": "Upload successful",
  "data": {
    "url": "https://cdn.saiphysio.com/doctors/2026/05/1716123456789-a1b2c3.png",
    "key": "doctors/2026/05/1716123456789-a1b2c3.png",
    "storage": "r2",
    "mimetype": "image/png",
    "size": 142_512,
    "originalName": "photo.png"
  }
}
```

### `POST /upload/images/:module`

Multi-file upload (max 10). Form field name **`files`**.

### `POST /upload/document`

Patient document upload (PDF / Word / image). Lands in `/uploads/patients/`. Max 10 MB.

### `DELETE /upload`

```json
{ "key": "doctors/2026/05/abc.png", "storage": "r2" }
```

Deletes from the named provider. The deletion is best-effort — missing files don't 500 the request (idempotent).

---

## How files are referenced

The URL stored in the model is the **public URL** (R2 custom domain or `http://localhost:5000/uploads/...`). For deletion we additionally persist:

```ts
{
  url: 'https://cdn.saiphysio.com/doctors/2026/05/abc.png',
  storageKey: 'doctors/2026/05/abc.png',
  storageProvider: 'r2',                // or 'local'
  mimetype: 'image/png',
}
```

This is the `StoredImage` schema in `swagger.ts` — used by `Doctor.photo`, `GalleryItem.image`. `Blog`, `Service`, and `Patient.documents` carry the same fields flat on the model (`featuredStorageKey`/`bannerStorageKey` etc.).

Without `storageKey` we can still render the file (the URL works) but we can't delete it cleanly when the parent record is removed. The seeder leaves these fields blank for the assets that point to `/images/...` in the frontend's `public/` directory — those aren't ours to delete.

---

## Express static serving

The local-uploads root is served by:

```ts
app.use(
  '/uploads',
  express.static(LOCAL_UPLOAD_ROOT, {
    dotfiles: 'deny',
    maxAge: '365d',
    immutable: true,
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
  }),
);
```

The `cross-origin-resource-policy: cross-origin` header is critical — without it Helmet's default `same-origin` policy blocks `<img>`/`next/image` from loading uploads on the Next.js origin.

---

## Multer middleware

Defined in `backend/src/middleware/upload.middleware.ts`:

| Middleware       | Field name | MIME filter             | Limit | Files max |
| ---------------- | ---------- | ----------------------- | ----- | --------- |
| `uploadImage`    | `file` / `files` | image/* (incl. svg)| 5 MB  | 10        |
| `uploadDocument` | `file`     | image/* + pdf + doc/docx + txt | 10 MB | 5 |

Both use `multer.memoryStorage()` so files never hit disk before the storage service routes them.

---

## Frontend integration

The `FileUpload` component (`frontend/src/components/admin/FileUpload.tsx`) is the standard primitive. It drives drag-drop + click-to-browse and calls the upload store directly:

```tsx
import { FileUpload } from '@/components/admin';

<FileUpload
  module="doctors"
  value={photo}
  onChange={setPhoto}
  label="Profile photo"
  hint="Square 800×800 recommended. PNG/JPG/WebP up to 5MB."
/>
```

The `onChange` callback receives the full `UploadedFile` shape (`{ url, key, storage, mimetype, size, originalName }`) so the parent form can persist all four storage fields when saving the parent record.

For multi-image gallery use `MultiFileUpload` from the same file.

---

## Migration from Cloudinary (historical)

This project briefly used Cloudinary. The migration to R2 + local fallback removed:

- `cloudinary` npm dep
- `CLOUDINARY_*` env vars
- The `cloudinaryId` field on `Patient.documents` (renamed to `storageKey` + `storageProvider`)
- The Cloudinary `res.cloudinary.com` `remotePatterns` entry in `next.config.js`

Existing `Patient.documents[].cloudinaryId` fields in older databases will still load (the field is just ignored). If you re-seed, the new shape is written. The new storage layer is fully isolated behind `services/storage.service.ts` — switching providers in the future means changing only that file.

---

## Logs

Storage logs are emitted by Winston at `warn` level:

```
[storage] R2 upload failed for key=doctors/2026/05/foo.png, falling back to local: <error>
[storage] R2 delete failed for <key>: <error>
[storage] Local delete failed for <key>: <error>     (only when non-ENOENT)
```

The `info` log on success isn't emitted — successful uploads are noise. If you need them, add one inside `storeFile` after a successful R2 put.
