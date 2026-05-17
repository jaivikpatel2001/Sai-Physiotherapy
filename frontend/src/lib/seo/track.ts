'use client';

/**
 * Lightweight, type-safe analytics event helper. No-ops if GA isn't loaded,
 * so call sites never need to guard. Use for conversion & engagement events
 * (appointment CTA clicks, WhatsApp, call, scroll depth, etc.).
 *
 * Example:
 *   import { track } from '@/lib/seo/track';
 *   <Link onClick={() => track('book_appointment_click', { source: 'header' })} ... />
 */
type GtagWindow = Window & {
  gtag?: (command: string, event: string, params?: Record<string, unknown>) => void;
};

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as GtagWindow;
  if (typeof w.gtag === 'function') {
    w.gtag('event', event, params);
  }
}

/** Common conversion events — keep names stable for GA goals. */
export const CONVERSION = {
  bookAppointment: (source: string) => track('book_appointment_click', { source }),
  callClinic: (source: string) => track('call_click', { source }),
  whatsapp: (source: string) => track('whatsapp_click', { source }),
  appDownload: (platform: string) => track('app_download_click', { platform }),
} as const;
