'use client';
import React from 'react';
import adminStyles from '../../app/admin/admin.module.css';

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  icon?: string;
}

const TONE_CLASS: Record<StatusTone, string> = {
  success: adminStyles.badgeSuccess,
  warning: adminStyles.badgeWarning,
  error: adminStyles.badgeError,
  info: adminStyles.badgeInfo,
  neutral: adminStyles.badgeNeutral,
  primary: adminStyles.badgePrimary,
};

export function StatusBadge({ label, tone = 'neutral', icon }: StatusBadgeProps) {
  return (
    <span className={`${adminStyles.badge} ${TONE_CLASS[tone]}`}>
      {icon && <i className={icon} style={{ fontSize: 12 }} />}
      {label}
    </span>
  );
}

const PUBLISH_TONE: Record<string, StatusTone> = {
  draft: 'neutral',
  published: 'success',
  archived: 'warning',
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  paid: 'success',
  partial: 'warning',
  unpaid: 'error',
  completed: 'success',
  cancelled: 'error',
  confirmed: 'info',
  scheduled: 'info',
  'in-progress': 'info',
};

export function toneFor(status: string | undefined | null): StatusTone {
  if (!status) return 'neutral';
  return PUBLISH_TONE[status.toLowerCase()] ?? 'neutral';
}
