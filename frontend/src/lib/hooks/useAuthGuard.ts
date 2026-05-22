'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, tokenStorage } from '@/store';

/**
 * Admin route guard. Reads the auth Zustand store; on first mount it kicks off
 * `loadCurrentUser` if there's a token but no user object yet. Redirects to
 * /login whenever the user can't be resolved.
 */
export function useAuthGuard(): { user: ReturnType<typeof useAuthStore.getState>['user']; loading: boolean } {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loadCurrentUser = useAuthStore((s) => s.loadCurrentUser);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    let cancelled = false;
    const token = tokenStorage.getAccessToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    if (user) {
      setLoading(false);
      return;
    }
    (async () => {
      const u = await loadCurrentUser();
      if (cancelled) return;
      if (!u) router.replace('/login');
      else setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loadCurrentUser, router]);

  return { user, loading };
}
