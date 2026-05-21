import { Router } from 'express';
import {
  getPublicDoctors,
  getDoctorBySlug,
  getAllDoctorsAdmin,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

const STAFF = [UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR] as const;

// Public
router.get('/', getPublicDoctors);
router.get('/slug/:slug', getDoctorBySlug);

// Admin
router.get('/admin/list', authenticate, authorize(...STAFF), getAllDoctorsAdmin);
router.get('/:id', authenticate, authorize(...STAFF), getDoctor);
router.post('/', authenticate, authorize(...STAFF), createDoctor);
router.put('/:id', authenticate, authorize(...STAFF), updateDoctor);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteDoctor);

export default router;
