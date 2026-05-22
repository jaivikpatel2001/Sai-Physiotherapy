# STORE — Zustand state management

The **admin panel** is fully Zustand-powered. Every API call goes through a per-module store; components never call axios directly. The **public site** stays Server-Component-based and fetches via `frontend/src/lib/cms.ts` (Zustand can't run inside React Server Components).

---

## Folder layout

```
frontend/src/store/
├── api/
│   ├── client.ts             # central axios instance + JWT interceptors
│   └── services.api.ts       # per-resource service functions called by stores
│
├── constants/
│   ├── status.ts             # RequestStatus enum: 'idle' | 'loading' | 'succeeded' | 'failed'
│   └── pagination.ts         # DEFAULT_LIMIT, MAX_LIMIT, LIST_CACHE_TTL_MS, emptyPagination()
│
├── helpers/
│   └── createCrudStore.ts    # factory powering the simple CRUD modules
│
├── shared/
│   ├── ui.store.ts           # toasts, mobile sidebar — global UI state
│   └── settings.store.ts     # clinic settings (persisted)
│
├── auth/auth.store.ts        # persisted: user, tokens, login, logout, refresh
│
├── services/services.store.ts        # treatment services
├── doctors/doctors.store.ts          # doctor profiles
├── blogs/blogs.store.ts              # blog posts
├── gallery/gallery.store.ts          # gallery items
├── testimonials/testimonials.store.ts# testimonials (custom — includes moderate())
├── pages/pages.store.ts              # CMS pages
├── users/users.store.ts              # staff accounts
├── patients/patients.store.ts        # patient records
├── appointments/appointments.store.ts# appointments
├── billings/billings.store.ts        # invoices + reports
├── sessions/sessions.store.ts        # treatment sessions
├── analytics/analytics.store.ts      # dashboard datasets
├── upload/upload.store.ts            # file uploads
│
└── index.ts                          # barrel — one import path
```

---

## State shape (CRUD stores)

Every CRUD store built via `createCrudStore` exposes the same surface:

```ts
interface CrudState<T> {
  items: T[];                     // list result
  current: T | null;              // single-resource focus
  status: RequestStatus;          // read-side request status
  writeStatus: RequestStatus;     // create/update/remove status
  error: ApiErrorShape | null;
  pagination: PaginationMeta;
  filters: ListParams;            // currently-applied filters
  lastFetchedAt: number | null;   // for cache TTL
}

interface CrudActions<T> {
  fetchList(params?, opts?: { force? }): Promise<T[] | null>;
  fetchOne(id): Promise<T | null>;
  create(payload): Promise<T | null>;
  update(id, payload): Promise<T | null>;
  remove(id): Promise<boolean>;
  setFilters(partial, opts?: { autoFetch? }): void;
  setCurrent(item): void;
  reset(): void;
}
```

Hand-rolled stores (auth, analytics, upload, patients with sessions/bills aggregates, appointments with `availableSlots` etc.) extend this base shape with module-specific actions.

---

## Usage pattern

```tsx
'use client';
import { useEffect } from 'react';
import { useBlogsStore } from '@/store';

export default function BlogAdminPage() {
  // Narrow selectors → component re-renders only when its slice changes
  const posts    = useBlogsStore((s) => s.items);
  const loading  = useBlogsStore((s) => s.status === 'loading');
  const error    = useBlogsStore((s) => s.error?.message ?? '');
  const fetchList= useBlogsStore((s) => s.fetchList);
  const remove   = useBlogsStore((s) => s.remove);

  useEffect(() => { void fetchList(); }, [fetchList]);

  return /* render posts */;
}
```

**Rules:**

1. **Always select narrowly.** `useStore((s) => s.items)` re-renders only when `items` changes. Don't grab the whole store object.
2. **Never call axios in components.** Every API operation lives in a store action.
3. **`fetchList()` is cached** for 60s (`LIST_CACHE_TTL_MS`). Pass `{ force: true }` after a write or when filters change to bypass.
4. **Read `status` for loading, `writeStatus` for save buttons.** They're separate so a list refresh doesn't disable the New button.
5. **Errors live on the store**, not in component state. Subscribe with `s.error?.message`.

---

## Auth flow

```tsx
import { useAuthStore, selectIsAuthenticated } from '@/store';

const login   = useAuthStore((s) => s.login);
const logout  = useAuthStore((s) => s.logout);
const isAuth  = useAuthStore(selectIsAuthenticated);

await login({ email, password });   // stores tokens in localStorage + state
await logout();                     // clears tokens + resets state
```

The `auth.store` uses `persist` middleware so `user` + `accessToken` survive page reloads. The `tokenStorage` helper in `store/api/client.ts` is the single source of truth for token IO — interceptors read from it on every request and refresh-on-401 writes to it.

**Route guard** — admin pages use `useAuthGuard()` (`lib/hooks/useAuthGuard.ts`) which subscribes to the store and redirects to `/login` if there's no user.

---

## CRUD store factory

For modules whose service exposes the standard `list / getOne / create / update / remove` shape, use `createCrudStore`:

```ts
// store/blogs/blogs.store.ts
import { createCrudStore } from '../helpers/createCrudStore';
import { blogsApi } from '../api/services.api';
import type { IBlog } from '@sai-physio/types';

export const useBlogsStore = createCrudStore<IBlog>({
  resource: 'blogs',
  list: blogsApi.list,
  getOne: blogsApi.getOne,
  create: blogsApi.create,
  update: blogsApi.update,
  remove: blogsApi.remove,
});
```

That's it — devtools registration, cache TTL, optimistic write status, and pagination are all handled automatically.

When a module needs **extra actions** (moderate, recordPayment, fetchToday, etc.), hand-roll the store with `zustand/create` directly — see `testimonials.store.ts`, `billings.store.ts`, or `appointments.store.ts` as references.

---

## Middleware

| Middleware | Stores using it             | Why                                                       |
| ---------- | --------------------------- | --------------------------------------------------------- |
| `devtools` | **all** stores              | Redux DevTools extension shows time-travel during dev    |
| `persist`  | `auth`, `settings`          | Survive page reload                                       |
| —          | everything else             | Volatile by design — re-fetch on next visit               |

Devtools is disabled in production (`enabled: process.env.NODE_ENV !== 'production'`) so prod bundles don't ship the debug shim.

---

## API service layer

`store/api/services.api.ts` is the only place that talks to the backend. Each export is a thin axios wrapper that returns the full `{ success, data, pagination, message }` envelope. Stores call these functions and lift the data into their own state.

**Why split?** Stores can be unit-tested with a mocked service object. Services can be reused by Server Components if needed (currently they're not — RSCs use `lib/cms.ts`).

**Adding a new endpoint**:

1. Add the method to the relevant `*Api` export in `services.api.ts`
2. Wire a new action in the relevant store
3. Use it from the component via the store hook

---

## Migration cheatsheet

If you find a component still calling axios directly, here's the swap:

```diff
- import { adminBlogApi } from '@/lib/api';      // ← gone
+ import { useBlogsStore } from '@/store';

  function BlogPage() {
-   const [items, setItems] = useState<BlogPost[]>([]);
-   const [loading, setLoading] = useState(true);
-   const [error, setError] = useState('');
-
-   const fetchData = async () => {
-     setLoading(true);
-     try {
-       const r = await adminBlogApi.getAll();
-       setItems(r.data?.data ?? []);
-     } catch (e) { setError('...'); }
-     finally { setLoading(false); }
-   };
-   useEffect(() => { fetchData(); }, []);
+   const items   = useBlogsStore((s) => s.items);
+   const loading = useBlogsStore((s) => s.status === 'loading');
+   const error   = useBlogsStore((s) => s.error?.message ?? '');
+   const fetchList = useBlogsStore((s) => s.fetchList);
+
+   useEffect(() => { void fetchList(); }, [fetchList]);
```

---

## Why not Redux?

Considered and rejected. Zustand gives us:

- 90% less boilerplate (no slice/reducer/action types)
- Tiny bundle (~3KB vs 15KB+ for RTK)
- Smaller learning curve for new contributors
- Built-in `persist` + `devtools` without extra config
- First-class TypeScript inference with no generic gymnastics

The trade-off — no time-travel debugger out of the box — is mitigated by every store registering its own `devtools` instance, which the Redux DevTools extension picks up transparently.

---

## Public site

`frontend/src/lib/cms.ts` is **not** a Zustand store. It's a set of server-side `fetch` helpers that the public RSC pages call directly:

```tsx
// app/(public)/page.tsx
import { getServices, getDoctors } from '@/lib/cms';

export default async function HomePage() {
  const [services, doctors] = await Promise.all([getServices(), getDoctors()]);
  return <ServicesSection services={services} />;
}
```

This is intentional — RSC fetching is the correct primitive for SEO-heavy pages and Zustand cannot run on the server. The two architectures coexist cleanly because they target different rendering modes.
