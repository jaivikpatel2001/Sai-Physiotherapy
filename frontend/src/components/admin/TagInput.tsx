'use client';
import React, { useState, KeyboardEvent } from 'react';
import styles from './admin-shared.module.css';

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder = 'Type and press Enter…' }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setDraft('');
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      remove(value.length - 1);
    }
  };

  return (
    <div className={styles.chips}>
      {value.map((tag, i) => (
        <span key={`${tag}-${i}`} className={styles.chip}>
          {tag}
          <button
            type="button"
            className={styles.chipRemove}
            onClick={() => remove(i)}
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className={styles.chipInput}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => draft && add(draft)}
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  );
}
