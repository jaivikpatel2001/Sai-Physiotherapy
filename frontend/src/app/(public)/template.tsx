'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

/**
 * Public route transition.
 *
 * Next.js App Router re-mounts `template.tsx` on every navigation inside the
 * segment, so an enter-only animation here gives native-app-like motion
 * WITHOUT the AnimatePresence + RSC white-flash / exit-race problems.
 *
 * The effect is context-aware:
 *  - home (`/`)                → soft fade + scale-in
 *  - detail pages (`/x/slug`)  → zoom/scale reveal (feels like "pushing in")
 *  - section pages (`/x`)      → slide-up + blur reveal
 * Respects `prefers-reduced-motion` (plain fade, no transform/blur).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

function variantsFor(pathname: string, reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.2 } },
    };
  }

  const depth = pathname.split('/').filter(Boolean).length;

  // Home — calm fade + gentle scale
  if (pathname === '/') {
    return {
      hidden: { opacity: 0, scale: 0.985 },
      show: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: EASE },
      },
    };
  }

  // Detail pages (e.g. /services/back-pain, /blog/slug) — zoom reveal
  if (depth >= 2) {
    return {
      hidden: { opacity: 0, scale: 0.97, filter: 'blur(6px)' },
      show: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.45, ease: EASE },
      },
    };
  }

  // Section pages — slide-up + blur reveal
  return {
    hidden: { opacity: 0, y: 24, filter: 'blur(5px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.45, ease: EASE },
    },
  };
}

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Reset scroll to top on every route change — instantly, before paint, so
  // there is no jump/flicker. Works with the global Lenis instance too.
  useEffect(() => {
    const lenis = (window as Window & { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <motion.div
      ref={ref}
      key={pathname}
      variants={variantsFor(pathname, !!reduced)}
      initial="hidden"
      animate="show"
      style={{
        // Keep paint cheap on low-end devices; clear hint after animation.
        willChange: 'opacity, transform, filter',
        // Prevent a flash of empty background while the first paint settles.
        backgroundColor: 'var(--color-bg)',
        minHeight: '100dvh',
      }}
      onAnimationComplete={() => {
        if (ref.current) ref.current.style.willChange = 'auto';
      }}
    >
      {children}
    </motion.div>
  );
}
