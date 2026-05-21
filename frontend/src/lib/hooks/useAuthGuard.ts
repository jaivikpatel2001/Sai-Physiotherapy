'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export function useAuthGuard() {
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (user) {
      setLoading(false);
      return;
    }
    (async () => {
      const u = await loadUser();
      if (cancelled) return;
      if (!u) {
        router.replace('/login');
      } else {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loadUser, router]);

  return { user, loading };
}
