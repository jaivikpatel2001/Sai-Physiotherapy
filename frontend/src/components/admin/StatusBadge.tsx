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
  disabled: 'error',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  paid: 'success',
  partial: 'warning',
  unpaid: 'error',
  waived: 'neutral',
  completed: 'success',
  cancelled: 'error',
  confirmed: 'primary',
  scheduled: 'info',
  'in-progress': 'info',
  in_progress: 'info',
  'no-show': 'neutral',
  no_show: 'neutral',
  followup: 'info',
  'follow-up': 'info',
  emergency: 'error',
  discharged: 'success',
  super_admin: 'primary',
  admin: 'info',
  doctor: 'success',
  receptionist: 'warning',
  patient: 'neutral',
};

export function toneFor(status: string | undefined | null): StatusTone {
  if (!status) return 'neutral';
  return PUBLISH_TONE[status.toLowerCase()] ?? 'neutral';
}
