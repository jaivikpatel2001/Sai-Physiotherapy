import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const STORAGE_MODULES = [
  'gallery',
  'services',
  'doctors',
  'testimonials',
  'blogs',
  'users',
  'patients',
  'pages',
  'settings',
] as const;

export type StorageModule = (typeof STORAGE_MODULES)[number];

export interface StoredFile {
  url: string;
  key: string;
  storage: 'r2' | 'local';
  mimetype: string;
  size: number;
  originalName: string;
}

const r2Configured = Boolean(
  env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET &&
    env.R2_PUBLIC_URL,
);

const r2Client = r2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
      },
    })
  : null;

export const LOCAL_UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

export const storageStatus = {
  r2Enabled: r2Configured,
  driver: r2Configured ? 'r2 (primary) + local fallback' : 'local-only',
  localRoot: LOCAL_UPLOAD_ROOT,
};

function isStorageModule(value: string): value is StorageModule {
  return (STORAGE_MODULES as readonly string[]).includes(value);
}

function safeOriginalName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 80);
}

function buildKey(module: StorageModule, originalName: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const ext = extname(originalName).toLowerCase();
  const id = randomUUID().replace(/-/g, '');
  return `${module}/${yyyy}/${mm}/${Date.now()}-${id}${ext}`;
}

async function uploadToR2(key: string, buffer: Buffer, mimetype: string): Promise<string> {
  if (!r2Client) throw new Error('R2 not configured');
  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET as string,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  const base = (env.R2_PUBLIC_URL as string).replace(/\/$/, '');
  return `${base}/${key}`;
}

async function uploadToLocal(key: string, buffer: Buffer): Promise<string> {
  const filePath = path.join(LOCAL_UPLOAD_ROOT, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  const base = env.BACKEND_URL.replace(/\/$/, '');
  return `${base}/uploads/${key}`;
}

export async function storeFile({
  module,
  buffer,
  mimetype,
  originalName,
}: {
  module: string;
  buffer: Buffer;
  mimetype: string;
  originalName: string;
}): Promise<StoredFile> {
  if (!isStorageModule(module)) {
    throw new Error(`Invalid storage module "${module}"`);
  }
  const safeName = safeOriginalName(originalName);
  const key = buildKey(module, safeName);
  const size = buffer.length;

  if (r2Client) {
    try {
      const url = await uploadToR2(key, buffer, mimetype);
      return { url, key, storage: 'r2', mimetype, size, originalName: safeName };
    } catch (err) {
      logger.warn(
        `[storage] R2 upload failed for key=${key}, falling back to local: ${(err as Error).message}`,
      );
    }
  }

  const url = await uploadToLocal(key, buffer);
  return { url, key, storage: 'local', mimetype, size, originalName: safeName };
}

export async function deleteStoredFile(key: string, storage: 'r2' | 'local'): Promise<void> {
  if (!key) return;
  if (storage === 'r2' && r2Client) {
    try {
      await r2Client.send(
        new DeleteObjectCommand({ Bucket: env.R2_BUCKET as string, Key: key }),
      );
    } catch (err) {
      logger.warn(`[storage] R2 delete failed for ${key}: ${(err as Error).message}`);
    }
    return;
  }
  if (storage === 'local') {
    try {
      await unlink(path.join(LOCAL_UPLOAD_ROOT, key));
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== 'ENOENT') {
        logger.warn(`[storage] Local delete failed for ${key}: ${e.message}`);
      }
    }
  }
}
