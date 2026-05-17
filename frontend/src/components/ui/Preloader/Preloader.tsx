'use client';

import { useEffect, useState } from 'react';
import styles from './Preloader.module.css';

/**
 * Premium healthcare intro preloader.
 *
 * - Server-rendered markup → paints instantly, no white screen on cold load.
 * - Pure CSS/SVG animation → runs even before React hydration, cheap on
 *   low-end devices and slow networks.
 * - Seamless: stays for a calm minimum, fades out (never snaps) once the page
 *   is ready, with a hard cap so it can never get stuck.
 * - Shown once per browser session (cold loads / WebView launches), not on
 *   in-app route changes.
 */

// Hold long enough for ONE full ECG-pulse cycle (drawPulse = 2.4s) to play to
// completion, even if the page finished loading sooner — so the user always
// sees the intro resolve cleanly at least once instead of it snapping away.
const MIN_VISIBLE_MS = 2600;
const HARD_CAP_MS = 7000;      // fail-safe — never trap the user
const FADE_MS = 650;           // must match CSS transition

export default function Preloader() {
  const [closing, setClosing] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Skip on subsequent SPA visits within the same session.
    if (sessionStorage.getItem('sai_intro_done') === '1') {
      setRemoved(true);
      return;
    }

    const start = performance.now();
    let fadeTimer: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;

    const beginClose = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      fadeTimer = setTimeout(() => {
        setClosing(true);
        removeTimer = setTimeout(() => {
          setRemoved(true);
          sessionStorage.setItem('sai_intro_done', '1');
          document.documentElement.style.removeProperty('overflow');
        }, FADE_MS);
      }, wait);
    };

    // Lock scroll while the intro is on screen (avoids content jump behind it).
    document.documentElement.style.overflow = 'hidden';

    if (document.readyState === 'complete') {
      beginClose();
    } else {
      window.addEventListener('load', beginClose, { once: true });
    }
    const cap = setTimeout(beginClose, HARD_CAP_MS);

    return () => {
      window.removeEventListener('load', beginClose);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      clearTimeout(cap);
      document.documentElement.style.removeProperty('overflow');
    };
  }, []);

  if (removed) return null;

  return (
    <div
      className={`${styles.root} ${closing ? styles.closing : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading SAI Physiotherapy"
    >
      <div className={styles.stage}>
        {/* Breathing healing rings */}
        <span className={styles.ring} />
        <span className={styles.ring} />
        <span className={styles.ring} />

        {/* Clinic monogram + animated pulse line */}
        <div className={styles.badge}>
          <svg className={styles.pulse} viewBox="0 0 120 48" fill="none" aria-hidden>
            <path
              className={styles.pulsePath}
              d="M2 24 H30 L38 24 L44 10 L52 38 L60 16 L66 24 L74 24 L80 30 L86 24 H118"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className={styles.brand}>
          <span className={styles.name}>SAI Physiotherapy</span>
          <span className={styles.tag}>Spine Care &amp; Paralysis Centre</span>
        </div>

        <div className={styles.bar} aria-hidden>
          <span className={styles.barFill} />
        </div>
      </div>
    </div>
  );
}
