/**
 * Barrel — one import path for all stores.
 *
 *   import { useAuthStore, useBlogsStore, useUiStore, ... } from '@/store'
 *
 * Stores already register their own devtools instance; nothing extra needed
 * at the app shell.
 */
export { apiClient, tokenStorage, pickError } from './api/client';
export type { ApiEnvelope, ApiErrorShape, PaginationMeta } from './api/client';

export * from './api/services.api';
export { REQUEST_STATUS, isLoading, isSuccess, isFailure } from './constants/status';
export type { RequestStatus } from './constants/status';
export { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT, LIST_CACHE_TTL_MS, emptyPagination } from './constants/pagination';

// Module stores
export { useAuthStore, selectAuthUser, selectIsAuthenticated, selectAuthLoading, selectAuthError } from './auth/auth.store';
export { useServicesStore, usePublicServicesStore } from './services/services.store';
export { useDoctorsStore } from './doctors/doctors.store';
export { useBlogsStore } from './blogs/blogs.store';
export { useGalleryStore } from './gallery/gallery.store';
export { useTestimonialsStore } from './testimonials/testimonials.store';
export { usePagesStore } from './pages/pages.store';
export { useUsersStore } from './users/users.store';
export { usePatientsStore } from './patients/patients.store';
export { useAppointmentsStore } from './appointments/appointments.store';
export { useBillingsStore } from './billings/billings.store';
export { useSessionsStore } from './sessions/sessions.store';
export { useAnalyticsStore } from './analytics/analytics.store';
export { useUploadStore } from './upload/upload.store';
export { useUiStore } from './shared/ui.store';
export { useSettingsStore } from './shared/settings.store';

// Helpers
export { createCrudStore } from './helpers/createCrudStore';
export type { CrudService, CrudStore, ListParams } from './helpers/createCrudStore';
