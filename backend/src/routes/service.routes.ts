import { Router } from 'express';
import {
  getAllServices, getServiceBySlug, getService,
  createService, updateService, deleteService,
} from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

// Public routes
router.get('/', getAllServices);
router.get('/slug/:slug', getServiceBySlug);

// Admin-protected
router.post('/', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), createService);
router.get('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getService);
router.put('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateService);
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), deleteService);

export default router;
