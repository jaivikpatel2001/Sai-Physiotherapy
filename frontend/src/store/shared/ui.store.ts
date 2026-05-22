/**
 * Shared UI store — lightweight, application-wide UI state.
 *
 * Holds:
 *   • toasts queue (success / error / info messages)
 *   • global confirm-dialog state (for cases that need imperative confirm())
 *   • sidebarOpen on mobile (delegated by admin layout)
 *
 * Reset on logout via auth.store.logout().
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Toast {
  id: string;
  kind: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  /** Auto-dismiss after N ms. 0 = sticky. */
  ttl?: number;
}

interface State {
  toasts: Toast[];
  sidebarOpen: boolean;
}

interface Actions {
  toast: (t: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export type UiStore = State & Actions;

let counter = 0;

export const useUiStore = create<UiStore>()(
  devtools(
    (set) => ({
      toasts: [],
      sidebarOpen: false,

      toast: ({ kind, title, description, ttl = 4500 }) => {
        const id = `t-${Date.now()}-${++counter}`;
        const next: Toast = { id, kind, title, description, ttl };
        set((s) => ({ toasts: [...s.toasts, next] }));
        if (ttl > 0 && typeof window !== 'undefined') {
          window.setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
          }, ttl);
        }
        return id;
      },

      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      clearToasts: () => set({ toasts: [] }),
      openSidebar: () => set({ sidebarOpen: true }),
      closeSidebar: () => set({ sidebarOpen: false }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'store/ui', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
