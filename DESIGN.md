# DESIGN.md — SAI Physiotherapy Design System

The authoritative visual + interaction spec. All tokens live in
`frontend/src/app/globals.css :root`. **Code is the source of truth — this doc
mirrors it.** Never hardcode branded values; extend the tokens here.

Companion: **[CLAUDE.md](./CLAUDE.md)** (enforcement rulebook). CSS Modules
only — no Tailwind, styled-components, or other styling systems.

---

## 1. Brand Identity

Premium physiotherapy clinic — **calm, trustworthy, medically professional,
modern-SaaS polish**. Visual benchmarks: Practo / Apollo (trust + local
healthcare), YouTube (native mobile feel). Derived from the SAI logo
(orange figure + teal waveform on deep navy).

- Healing **teal** leads the UI.
- A single decisive **warm-orange** CTA.
- **Deep navy** for clinical authority / app-shell.
- **Soft aqua + off-white** keep surfaces calm and readable.
- Low-saturation, high-contrast text. Never flashy or neon.

---

## 2. Color Tokens

### Brand & CTA
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#46a2b7` | **Teal** — buttons, icons, highlights, focus rings, dividers, section accents, link emphasis |
| `--color-primary-pressed` | `#3a8a9c` | Teal pressed |
| `--color-primary-deep` | `#2d6e7e` | Teal deep / on-tint text |
| `--color-primary-50` | `#eaf4f7` | Lightest teal wash |
| `--color-primary-100` | `#bfd6d9` | Soft aqua (same as brand-aqua) |
| `--color-accent-cta` | `#eb783d` | **Warm Orange — CTA buttons only** |
| `--color-accent-cta-pressed` | `#d4642b` | CTA pressed |
| `--color-accent-cta-deep` | `#b85a24` | CTA deep |
| `--color-brand-navy` | `#0c2641` | Deep Navy — dark bands, phone frames, `theme-color` |
| `--color-brand-navy-mid` | `#1b4b66` | Ocean Blue — navy gradient stop |
| `--color-brand-navy-deep` | `#081a2d` | Deepest navy |
| `--color-brand-teal` | `#46a2b7` | Teal accent (= primary) |
| `--color-brand-aqua` | `#bfd6d9` | Soft Aqua |

> `.btn-primary` uses `--color-accent-cta` (orange) — it is the dominant CTA.
> Everyday buttons/links/highlights use `--color-primary` (teal).
> **The legacy purple `#5645d4` is removed — never reintroduce it.**

### Surfaces & ink
| Token | Hex | Usage |
|---|---|---|
| `--color-canvas` | `#ffffff` | Page/card base; `html` background (anti-flash) |
| `--color-surface` | `#eff5f4` | Subtle section surface |
| `--color-surface-soft` | `#f6faf9` | **Off-white body background** + alt sections |
| `--color-hairline` / `-soft` / `-strong` | `#e5e3df` / `#ede9e4` / `#c8c4be` | Borders/dividers |
| `--color-ink` / `--color-charcoal` / `--color-slate` / `--color-steel` | `#1a1a1a` / `#37352f` / `#5d5b54` / `#787671` | Text hierarchy |

### Card tints (calm, healthcare)
`--color-tint-sky` `#bfd6d9` (aqua) · `--color-tint-mint` `#d9f3e1` ·
`--color-tint-peach` `#fde0ce` · `--color-tint-lavender` `#e6e0f5` ·
`--color-tint-rose` `#fde0ec` · `--color-tint-yellow` `#fef7d6` ·
`--color-tint-cream` `#f8f5e8`.

### Semantic
`--color-success #1aae39` · `--color-warning #dd5b00` · `--color-error #e03131`
· `--color-info #0075de` (each with a `-bg` pair).

### Alias discipline (use these in CSS Modules)
`--color-text`, `--color-text-muted`, `--color-text-charcoal`,
`--color-white`, `--color-border`, `--color-border-light`,
`--color-border-strong`. They map to the raw tokens above — using them keeps
every module consistent and theme-safe.

---

## 3. Typography

- Family: `--font-display` / `--font-body` = **Inter** (system fallbacks).
- Scale: `--text-micro` 11px → `--text-hero` `clamp(2.5rem,6vw,5rem)`;
  `--text-h1` `clamp(2rem,4.5vw,3rem)`, `--text-h2`, `--text-h3` 1.75rem,
  `--text-lg` 18px, `--text-base` 16px, `--text-sm` 14px, `--text-xs` 13px.
- Headings: `var(--font-display)`, weight **700–800**, letter-spacing
  **`-0.035em`**, line-height 1.1–1.2.
- Body: weight 400, line-height `--leading-normal` (1.55) / `--leading-relaxed` (1.65).
- Hero title accent word: wrap in `<span className="gradient-text">` → renders
  teal (`--color-primary`).

---

## 4. Spacing, Radius, Elevation

- **Space scale**: `--space-1` (4px) … `--space-32` (128px), `--space-hero`.
  Sections use `var(--space-20) 0` (→ `--space-16` @≤768, `--space-12` @≤480).
- **Radius**: `--radius-md` 8px (buttons/inputs), `--radius-lg` 12px (cards),
  `--radius-xl/2xl` (feature panels/CTA), `--radius-full` (pills/badges).
- **Shadows**: `--shadow-sm/md/lg/xl`; brand glows `--shadow-glow` (teal),
  `--shadow-cta` (orange). Use tokens — no ad-hoc box-shadows.

---

## 5. Layout System

- `.container` (1280) / `.container-wide` (1440) — centered, side padding
  `max(var(--space-8), env(safe-area-inset-left/right))` (→ `--space-4` @≤768).
- **Global `.section`** owns vertical rhythm + responsive padding. Pages add a
  CSS-module **modifier** for background only:
  ``<section className={`section ${styles.sectionAlt}`}>`` where
  `.sectionAlt { background: var(--color-surface-soft) }`.
- Section header utilities: `.section-header`, `.section-label` (teal dot),
  `.section-title` (`<span>` = teal accent), `.section-desc`.

### Canonical hero (every page top)
```tsx
<section className={styles.hero}>
  <div className={`${styles.heroMesh} hero-aura`} aria-hidden />
  <div className="container">
    <p className="section-label" style={{ justifyContent: 'center' }}>LABEL</p>
    <h1 className={styles.heroTitle}>Title <span className="gradient-text">Word</span></h1>
    <p className={styles.heroDesc}>One-sentence value statement.</p>
  </div>
</section>
```
`.hero` = `position:relative; background:var(--color-canvas);
padding:var(--space-20) 0; text-align:center; overflow:hidden`. Every hero's
mesh div carries the global **`hero-aura`** (calming brand mesh + breathing
ring + faint clinical dot-grid; `prefers-reduced-motion` stops the ring).

---

## 6. Components

- **Buttons** (`.btn` base, `--radius-md`, ~44px height):
  `.btn-primary` = orange CTA (`--color-accent-cta`) · `.btn-secondary` =
  outlined teal-ink · `.btn-on-dark` / `.btn-secondary-on-dark` for navy bands.
- **Cards** (`--radius-lg`): `.card`, `.card-feature`, pastel
  `.card-feature-*` / `.surface-*` tint utilities. Hover = `translateY(-1..3px)`
  + shadow token + optional teal border.
- **Badges/pills**: `.badge`, `.badge-primary` (teal), `.badge-tag-*` tint
  chips, `--radius-full`.
- **Inputs**: `.text-input` / `.form-*`, `--radius-md`, focus ring teal.
- **Chrome**: `Header` (sticky, safe-area top-bar), `Footer`,
  `MobileBottomNav` (primary nav ≤768px), `WhatsAppFloat`. NAP text must match
  `lib/seo/clinic.ts`.

---

## 7. Motion Language

Gentle, breathing, ease-out — communicates care & recovery. Never bouncy.

- **Library**: Framer Motion (standard). **Easing**: `[0.22, 1, 0.36, 1]`.
  **Durations**: 0.2–0.5s (micro 150–200ms). Animate **only**
  `opacity` / `transform` / `filter`; set & clear `will-change`.
- **Page transitions**: `(public)/template.tsx` — context-aware enter
  (home = fade+scale, section = slide-up+blur, detail = zoom). No
  `AnimatePresence` (avoids RSC white-flash). Scroll resets via `window.__lenis`.
- **Route progress**: `RouteProgress` slim brand-gradient bar (safe-area aware).
- **Preloader**: `components/ui/Preloader` — CSS/SVG, SSR-safe (no white
  screen), breathing ECG monogram, ≥1 full cycle, 650ms fade, 7s cap,
  once/session.
- **Smooth scroll**: Lenis (`SmoothScroll` provider).
- Every animation degrades cleanly under `prefers-reduced-motion`.

---

## 8. Mobile / WebView (native-app feel)

- Root `viewport`: `viewportFit:'cover'`, themeColor `#0C2641`,
  `appleWebApp` translucent status bar.
- **Safe areas via `env(safe-area-inset-*)` only**, wrapped in
  `max()`/`calc()` with a `0px` fallback — **never hardcoded**. Applied to
  header top-bar, scrolled header, containers, body bottom
  (`calc(64px + env(safe-area-inset-bottom))`), bottom nav, WhatsApp float,
  mobile drawer.
- `html` painted `--color-canvas`; `body { overscroll-behavior-y:none;
  -webkit-tap-highlight-color:transparent }`. Touch targets ≥44px.
- Responsive breakpoints: **1100 / 900 / 768 / 600 / 480**. Grids 4→2→1;
  split sections stack with the visual above the text on mobile. Never let
  desktop layouts stretch edge-to-edge in WebView.

---

## 9. Accessibility & Trust (EEAT)

- One `<h1>`/page, ordered headings, semantic `<section>/<article>/<nav>`.
- Descriptive `alt` on every image; visible focus (`:focus-visible` teal ring);
  AA contrast (the muted/charcoal ink tokens are tuned for this).
- Trust surfaces to preserve: doctor credentials, certifications, real clinic
  imagery, rated testimonials, `<MedicalDisclaimer/>` on YMYL/blog content,
  transparent NAP/contact, privacy & terms.

---

## 10. Do / Don't

**Do**
- Use tokens + the canonical hero + global `.section` pattern on every page.
- Put orange only on the dominant CTA; teal everywhere else.
- Reuse `.card`/`.btn`/`.badge`/`.surface-*` and the animation system.
- Ship SEO + safe-area + reduced-motion with every new page.

**Don't**
- Reintroduce purple, add Tailwind, or hardcode hex/px for branded values.
- Invent new section/hero/card structures or one-off layouts.
- Hardcode safe-area insets or block crawlability with heavy client JS.
- Use bouncy/flashy motion or animate layout-affecting properties.
