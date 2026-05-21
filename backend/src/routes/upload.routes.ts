import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { sendSuccess } from '../utils/response';
import { uploadImage, uploadDocument } from '../middleware/upload.middleware';
import { STORAGE_MODULES, storeFile, deleteStoredFile, storageStatus } from '../services/storage.service';
import { UserRole } from '@sai-physio/types';

const router = Router();

const ALLOWED_MODULES = new Set<string>(STORAGE_MODULES);

router.use(authenticate);

const STAFF_ROLES = [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] as const;

/**
 * @openapi
 * /upload/status:
 *   get:
 *     tags: [Upload]
 *     summary: Returns whether R2 is configured and what driver is active
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/status',
  authorize(...STAFF_ROLES),
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    sendSuccess({ res, data: storageStatus });
  }),
);

/**
 * @openapi
 * /upload/image/{module}:
 *   post:
 *     tags: [Upload]
 *     summary: Upload a single image to the given module folder
 *     description: |
 *       Tries Cloudflare R2 first when configured. On any R2 failure (or when
 *       R2 is not configured) the file is written to backend/uploads/{module}.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *           enum: [gallery, services, doctors, testimonials, blogs, users, patients, pages, settings]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Upload successful
 */
router.post(
  '/image/:module',
  authorize(...STAFF_ROLES),
  uploadImage.single('file'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { module } = req.params;
    if (!ALLOWED_MODULES.has(module)) {
      throw new AppError(`Invalid module "${module}"`, 400);
    }
    if (!req.file) {
      throw new AppError('No file uploaded (expected multipart field name "file")', 400);
    }

    const stored = await storeFile({
      module,
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalName: req.file.originalname,
    });

    sendSuccess({ res, statusCode: 201, message: 'Upload successful', data: stored });
  }),
);

/**
 * @openapi
 * /upload/images/{module}:
 *   post:
 *     tags: [Upload]
 *     summary: Upload up to 10 images to a module folder
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *           enum: [gallery, services, doctors, testimonials, blogs, users, patients, pages, settings]
 */
router.post(
  '/images/:module',
  authorize(...STAFF_ROLES),
  uploadImage.array('files', 10),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { module } = req.params;
    if (!ALLOWED_MODULES.has(module)) {
      throw new AppError(`Invalid module "${module}"`, 400);
    }
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      throw new AppError('No files uploaded (expected multipart field name "files")', 400);
    }

    const stored = await Promise.all(
      files.map((f) =>
        storeFile({
          module,
          buffer: f.buffer,
          mimetype: f.mimetype,
          originalName: f.originalname,
        }),
      ),
    );

    sendSuccess({
      res,
      statusCode: 201,
      message: `${stored.length} file${stored.length === 1 ? '' : 's'} uploaded`,
      data: stored,
    });
  }),
);

/**
 * @openapi
 * /upload/document:
 *   post:
 *     tags: [Upload]
 *     summary: Upload a patient document (PDF/image) to /uploads/patients
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  '/document',
  authorize(...STAFF_ROLES),
  uploadDocument.single('file'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new AppError('No file uploaded (expected multipart field name "file")', 400);
    }
    const stored = await storeFile({
      module: 'patients',
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalName: req.file.originalname,
    });
    sendSuccess({ res, statusCode: 201, message: 'Document uploaded', data: stored });
  }),
);

/**
 * @openapi
 * /upload:
 *   delete:
 *     tags: [Upload]
 *     summary: Delete a previously-stored file by key + storage provider
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key: { type: string }
 *               storage: { type: string, enum: [r2, local] }
 */
router.delete(
  '/',
  authorize(...STAFF_ROLES),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { key, storage } = req.body as { key?: string; storage?: 'r2' | 'local' };
    if (!key || !storage) {
      throw new AppError('Both "key" and "storage" are required', 400);
    }
    if (storage !== 'r2' && storage !== 'local') {
      throw new AppError('storage must be "r2" or "local"', 400);
    }
    await deleteStoredFile(key, storage);
    sendSuccess({ res, message: 'File deleted (if it existed)' });
  }),
);

export default router;
