// ─── User Roles & Permissions ─────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  RECEPTIONIST = 'receptionist',
  PATIENT = 'patient',
}

export const PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.ADMIN]: [
    'appointments:manage',
    'patients:manage',
    'billing:manage',
    'staff:schedule',
    'reviews:moderate',
    'reports:view',
  ],
  [UserRole.DOCTOR]: [
    'patients:view',
    'patients:treat',
    'notes:manage',
    'prescriptions:manage',
    'exercises:manage',
    'appointments:own',
  ],
  [UserRole.RECEPTIONIST]: [
    'appointments:book',
    'patients:register',
    'billing:collect',
    'crm:basic',
  ],
  [UserRole.PATIENT]: [
    'appointments:self',
    'history:self',
    'prescriptions:download',
    'exercises:self',
    'reviews:submit',
  ],
};
