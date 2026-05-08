import type { AuthUser } from '@sai-physio/types';
import { UserRole } from '@sai-physio/types';

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getRole(): UserRole | null {
  return getStoredUser()?.role ?? null;
}

export function hasRole(...roles: UserRole[]): boolean {
  const r = getRole();
  return r ? roles.includes(r) : false;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
