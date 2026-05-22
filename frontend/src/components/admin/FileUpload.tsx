'use client';
import React, { useCallback, useId, useRef, useState } from 'react';
import { useUploadStore, type StorageModule, type UploadedFile } from '@/store';
import styles from './admin-shared.module.css';

interface FileUploadProps {
  module: StorageModule;
  value?: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  label?: string;
  hint?: string;
  accept?: string;
  required?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pickError(e: unknown): string {
  const err = e as { response?: { data?: { error?: string; message?: string } } };
  return err?.response?.data?.error ?? err?.response?.data?.message ?? 'Upload failed';
}

export function FileUpload({
  module,
  value,
  onChange,
  label = 'Image',
  hint = 'PNG, JPG, WebP up to 5MB',
  accept = 'image/png,image/jpeg,image/webp,image/avif',
  required,
}: FileUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const uploadImage = useUploadStore((s) => s.uploadImage);
  const removeUpload = useUploadStore((s) => s.remove);

  const handleFile = useCallback(
    async (file: File) => {
      setError('');
      setBusy(true);
      try {
        const data = await uploadImage(module, file);
        if (data) onChange(data);
        else setError('Upload failed');
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [module, onChange, uploadImage],
  );

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const removeFile = async () => {
    if (!value) return;
    if (value.key && value.storage) {
      await removeUpload(value.key, value.storage);
    }
    onChange(null);
  };

  return (
    <div className={styles.uploader}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
          {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </label>
      )}

      {value ? (
        <div className={styles.uploaderPreview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.url} alt={value.originalName} className={styles.previewImg} />
          <div className={styles.previewMeta}>
            <span className={styles.previewName}>{value.originalName}</span>
            <span className={styles.previewMetaSmall}>
              {formatBytes(value.size)} · {value.storage === 'r2' ? 'Cloudflare R2' : 'Local upload'}
            </span>
          </div>
          <button
            type="button"
            onClick={removeFile}
            disabled={busy}
            style={{
              background: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className={styles.dropzoneIcon}>
            <i className={busy ? 'ri-loader-4-line' : 'ri-upload-cloud-2-line'} />
          </div>
          <div className={styles.dropzoneText}>
            {busy ? 'Uploading…' : 'Drop image here or click to browse'}
          </div>
          <div className={styles.dropzoneHint}>{hint}</div>
          <input
            id={id}
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onSelect}
            disabled={busy}
            style={{ display: 'none' }}
          />
        </label>
      )}

      {error && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
          <i className="ri-error-warning-line" style={{ marginRight: 4 }} />
          {error}
        </div>
      )}
    </div>
  );
}

interface MultiFileUploadProps {
  module: StorageModule;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  label?: string;
  hint?: string;
  max?: number;
}

export function MultiFileUpload({
  module,
  value,
  onChange,
  label = 'Images',
  hint = 'PNG/JPG/WebP up to 5MB each',
  max = 10,
}: MultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const uploadImages = useUploadStore((s) => s.uploadImages);
  const removeUpload = useUploadStore((s) => s.remove);

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError('');
    setBusy(true);
    const next = await uploadImages(module, files);
    if (next) onChange([...value, ...next].slice(0, max));
    else setError('Upload failed');
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAt = async (idx: number) => {
    const file = value[idx];
    if (!file) return;
    if (file.key && file.storage) await removeUpload(file.key, file.storage);
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className={styles.uploader}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{label}</label>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy || value.length >= max}
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-primary)',
              cursor: 'pointer',
            }}
          >
            <i className="ri-add-line" /> Add image
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={onSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {value.length === 0 && !busy ? (
        <label
          htmlFor=""
          className={styles.dropzone}
          onClick={(e) => {
            e.preventDefault();
            inputRef.current?.click();
          }}
        >
          <div className={styles.dropzoneIcon}>
            <i className="ri-image-add-line" />
          </div>
          <div className={styles.dropzoneText}>Click to browse images</div>
          <div className={styles.dropzoneHint}>{hint}</div>
        </label>
      ) : (
        <div className={styles.thumbGrid}>
          {value.map((f, i) => (
            <div key={f.key || i} className={styles.thumb}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.originalName} />
              <button
                type="button"
                className={styles.thumbRemove}
                onClick={() => removeAt(i)}
                aria-label="Remove image"
              >
                <i className="ri-close-line" />
              </button>
            </div>
          ))}
          {busy && (
            <div className={styles.thumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <i className="ri-loader-4-line" style={{ fontSize: 24, animation: 'spin 1s linear infinite' }} />
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
          <i className="ri-error-warning-line" style={{ marginRight: 4 }} />
          {error}
        </div>
      )}
    </div>
  );
}
