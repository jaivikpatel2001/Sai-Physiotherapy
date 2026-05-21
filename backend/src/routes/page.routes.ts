import { Router } from 'express';
import {
  getPublishedPages,
  getPublishedPageBySlug,
  getAllPagesAdmin,
  getPageAdmin,
  createPage,
  updatePage,
  deletePage,
} from '../controllers/page.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

const STAFF = [UserRole.ADMIN] as const;

// Public
router.get('/', getPublishedPages);
router.get('/slug/:slug', getPublishedPageBySlug);

// Admin
router.get('/admin/list', authenticate, authorize(...STAFF), getAllPagesAdmin);
router.get('/:id', authenticate, authorize(...STAFF), getPageAdmin);
router.post('/', authenticate, authorize(...STAFF), createPage);
router.put('/:id', authenticate, authorize(...STAFF), updatePage);
router.delete('/:id', authenticate, authorize(...STAFF), deletePage);

export default router;
