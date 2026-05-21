import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { AppError } from './error.middleware';

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
]);

const DOCUMENT_TYPES = new Set<string>([
  ...IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const IMAGE_LIMIT_BYTES = 5 * 1024 * 1024; // 5 MB
const DOCUMENT_LIMIT_BYTES = 10 * 1024 * 1024; // 10 MB

function makeFilter(allowed: Set<string>) {
  return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (allowed.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400));
    }
  };
}

const memoryStorage = multer.memoryStorage();

export const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: makeFilter(IMAGE_TYPES),
  limits: { fileSize: IMAGE_LIMIT_BYTES, files: 10 },
});

export const uploadDocument = multer({
  storage: memoryStorage,
  fileFilter: makeFilter(DOCUMENT_TYPES),
  limits: { fileSize: DOCUMENT_LIMIT_BYTES, files: 5 },
});
