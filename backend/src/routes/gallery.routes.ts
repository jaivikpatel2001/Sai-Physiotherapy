import { Router } from 'express';
import {
  getPublishedGallery,
  getAllGalleryAdmin,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/gallery.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

const STAFF = [UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR] as const;

// Public
router.get('/', getPublishedGallery);

// Admin
router.get('/admin/list', authenticate, authorize(...STAFF), getAllGalleryAdmin);
router.get('/:id', authenticate, authorize(...STAFF), getGalleryItem);
router.post('/', authenticate, authorize(...STAFF), createGalleryItem);
router.put('/:id', authenticate, authorize(...STAFF), updateGalleryItem);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteGalleryItem);

export default router;
