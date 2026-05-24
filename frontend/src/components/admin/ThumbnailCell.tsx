'use client';
/**
 * Shared image cell for every admin DataTable column that surfaces an
 * uploaded image (gallery photo, blog cover, service banner, doctor avatar,
 * user avatar, …).
 *
 * Why one component:
 *   • Same sizing/rounding/border/shadow across every module → consistent UI
 *   • Same fallback (icon for square thumbs, initials for round avatars)
 *   • Same lazy-loading + next/image optimisation (AVIF/WebP, sized request)
 *
 * Usage:
 *   <ThumbnailCell src={post.featuredImage} alt={post.title} />               // square 48×36
 *   <ThumbnailCell src={doc.photo.url} alt={doc.name} variant="circle" />     // round 40
 *   <ThumbnailCell src={user.avatar} alt={user.name} variant="circle"
 *                  fallbackText={user.name} />                                // initials fallback
 */
import Image from 'next/image';
import React from 'react';
import styles from './ThumbnailCell.module.css';

interface ThumbnailCellProps {
  src?: string | null;
  alt: string;
  /** "square" — landscape thumbnail for content images. "circle" — avatar. */
  variant?: 'square' | 'circle';
  /** sm 32 · md 40 · lg 56 px (height for circle; height for square; width follows ratio). */
  size?: 'sm' | 'md' | 'lg';
  /** Optional plain-text fallback used by circle variant to render initials. */
  fallbackText?: string;
  /** Optional Remixicon class used by square variant when no image. */
  fallbackIcon?: string;
}

function initialsOf(text: string): string {
  return (
    text
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase() || '?'
  );
}

export function ThumbnailCell({
  src,
  alt,
  variant = 'square',
  size = 'md',
  fallbackText,
  fallbackIcon = 'ri-image-line',
}: ThumbnailCellProps) {
  const classNames = [
    styles.thumb,
    variant === 'circle' ? styles.circle : styles.square,
    size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md,
  ].join(' ');

  if (!src) {
    return (
      <div className={classNames} aria-label={alt} role="img">
        {variant === 'circle' && fallbackText ? (
          <span className={styles.initials}>{initialsOf(fallbackText)}</span>
        ) : (
          <i className={`${fallbackIcon} ${styles.icon}`} aria-hidden />
        )}
      </div>
    );
  }

  // next/image with `fill` + explicit `sizes` so the optimiser requests the
  // right resolution for each thumbnail bucket (no oversized fetch).
  const sizes = size === 'sm' ? '32px' : size === 'lg' ? '56px' : '40px';
  return (
    <div className={classNames}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={styles.img}
        // Thumbnails are below-the-fold table cells — never priority.
        loading="lazy"
      />
    </div>
  );
}
