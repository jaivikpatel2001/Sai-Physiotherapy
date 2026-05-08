import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess } from '../utils/response';

const router = Router();
router.use(authenticate);

/**
 * Placeholder upload route.
 * In production, Multer + Cloudinary is configured here.
 * Files go to: POST /api/v1/upload/document
 */
router.post('/document', asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess({ res, message: 'Upload endpoint ready. Configure Cloudinary credentials in .env to enable.' });
}));

export default router;
