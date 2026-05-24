'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { useUploadStore, type StorageModule } from '@/store';
import styles from './SummernoteEditor.module.css';

interface SummernoteEditorProps {
  value: string;
  onChange: (html: string) => void;
  uploadModule?: StorageModule;
  placeholder?: string;
  height?: number;
  label?: string;
  hint?: string;
  required?: boolean;
}

type JQueryStatic = {
  (el: Element | string): {
    summernote: (opts?: unknown, ...args: unknown[]) => unknown;
  };
  fn?: { summernote?: unknown };
};

type WithJQ = { jQuery?: JQueryStatic; $?: JQueryStatic };

const JQUERY_SRC = 'https://code.jquery.com/jquery-3.7.1.min.js';
const SUMMERNOTE_CSS = 'https://cdn.jsdelivr.net/npm/summernote@0.8.20/dist/summernote-lite.min.css';
const SUMMERNOTE_JS = 'https://cdn.jsdelivr.net/npm/summernote@0.8.20/dist/summernote-lite.min.js';

let loaderPromise: Promise<void> | null = null;

function loadCss(href: string): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`link[data-summernote="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-summernote', href);
  document.head.appendChild(link);
}

function loadScript(src: string, marker: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Document not available'));
      return;
    }
    const existing = document.querySelector(`script[data-summernote="${marker}"]`);
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = false;
    s.setAttribute('data-summernote', marker);
    s.onload = () => {
      s.setAttribute('data-loaded', 'true');
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function ensureSummernote(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (loaderPromise) return loaderPromise;
  loaderPromise = (async () => {
    loadCss(SUMMERNOTE_CSS);
    const w = window as unknown as WithJQ;
    if (!w.jQuery) await loadScript(JQUERY_SRC, 'jquery');
    if (!w.jQuery?.fn?.summernote) await loadScript(SUMMERNOTE_JS, 'summernote');
  })();
  return loaderPromise;
}

const TOOLBAR: Array<[string, string[]]> = [
  ['style', ['style']],
  ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
  ['fontname', ['fontname']],
  ['color', ['color']],
  ['para', ['ul', 'ol', 'paragraph']],
  ['table', ['table']],
  ['insert', ['link', 'picture', 'video', 'hr']],
  ['view', ['fullscreen', 'codeview', 'help']],
];

export function SummernoteEditor({
  value,
  onChange,
  uploadModule = 'pages',
  placeholder,
  height = 360,
  label,
  hint,
  required,
}: SummernoteEditorProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initialValueRef = useRef(value);
  const moduleRef = useRef<StorageModule>(uploadModule);
  moduleRef.current = uploadModule;
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errMsg, setErrMsg] = useState('');
  const uploadImage = useUploadStore((s) => s.uploadImage);

  // ── Mount ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    ensureSummernote()
      .then(() => {
        if (cancelled || !editorRef.current) return;
        const w = window as unknown as WithJQ;
        const $ = w.jQuery;
        if (!$) throw new Error('jQuery unavailable');
        const $el = $(editorRef.current);
        $el.summernote({
          placeholder: placeholder ?? '',
          tabsize: 2,
          height,
          dialogsInBody: true,
          toolbar: TOOLBAR,
          callbacks: {
            onChange(html: string) {
              onChangeRef.current(html ?? '');
            },
            onImageUpload(files: FileList) {
              void (async () => {
                for (const file of Array.from(files)) {
                  const uploaded = await uploadImage(moduleRef.current, file);
                  if (!uploaded) continue;
                  const img = document.createElement('img');
                  img.src = uploaded.url;
                  img.alt = uploaded.originalName || '';
                  img.style.maxWidth = '100%';
                  img.setAttribute('data-storage-key', uploaded.key);
                  $el.summernote('insertNode', img);
                }
              })();
            },
            onMediaDelete($target: { attr: (n: string) => string | undefined; remove: () => void }) {
              const key = $target.attr?.('data-storage-key');
              if (key) {
                void useUploadStore.getState().remove(key, 'r2').catch(() => undefined);
                void useUploadStore.getState().remove(key, 'local').catch(() => undefined);
              }
              $target.remove();
            },
          },
        });
        if (initialValueRef.current) {
          $el.summernote('code', initialValueRef.current);
        }
        setStatus('ready');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setErrMsg(err.message || 'Failed to load editor');
        setStatus('error');
      });
    return () => {
      cancelled = true;
      try {
        const w = window as unknown as WithJQ;
        const $ = w.jQuery;
        if ($ && editorRef.current) {
          $(editorRef.current).summernote('destroy');
        }
      } catch {
        /* ignore destroy errors on unmount */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync external value changes (e.g. reset when editing a new record) ─
  useEffect(() => {
    if (status !== 'ready') return;
    const w = window as unknown as WithJQ;
    const $ = w.jQuery;
    if (!$ || !editorRef.current) return;
    const $el = $(editorRef.current);
    const current = $el.summernote('code') as string;
    const next = value ?? '';
    if (current !== next) {
      $el.summernote('code', next);
    }
  }, [value, status]);

  return (
    <div className={styles.wrap} ref={containerRef}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div id={id} ref={editorRef} className={styles.editor} />
      {status === 'loading' && (
        <div className={styles.loadingBar} aria-live="polite">
          <i className="ri-loader-4-line" /> Loading editor…
        </div>
      )}
      {status === 'error' && (
        <div className={styles.errorBar} role="alert">
          <i className="ri-error-warning-line" /> {errMsg || 'Editor failed to load'}. Refresh to try again.
        </div>
      )}
      {hint && status !== 'error' && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

export default SummernoteEditor;
