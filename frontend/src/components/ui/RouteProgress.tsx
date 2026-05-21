'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Slim top progress bar that pulses on every route commit — the small touch
 * that makes navigation feel like a native app rather than a website.
 * Fixed under the status bar via the safe-area inset.
 */
export default function RouteProgress() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 620);
    return () => clearTimeout(t);
  }, [pathname]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          style={{
            position: 'fixed',
            top: 'env(safe-area-inset-top, 0px)',
            left: 0,
            right: 0,
            height: 3,
            zIndex: 'var(--z-toast)' as unknown as number,
            pointerEvents: 'none',
            background: 'transparent',
          }}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '65%', '100%'] }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], times: [0, 0.4, 1] }}
            style={{
              height: '100%',
              background:
                'linear-gradient(90deg, var(--color-primary) 0%, var(--color-brand-teal) 60%, var(--color-accent-cta) 100%)',
              boxShadow: '0 0 8px rgba(70, 162, 183, 0.5)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
