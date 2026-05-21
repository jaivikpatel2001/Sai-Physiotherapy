import { Router } from 'express';
import {
  getApprovedTestimonials, submitTestimonial,
  getAllTestimonialsAdmin, approveTestimonial, deleteTestimonial,
  createTestimonialAdmin, updateTestimonialAdmin,
} from '../controllers/testimonial.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

router.get('/', getApprovedTestimonials);
router.post('/submit', submitTestimonial);

router.get('/admin', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getAllTestimonialsAdmin);
router.post('/admin', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), createTestimonialAdmin);
router.put('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateTestimonialAdmin);
router.patch('/:id/moderate', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), approveTestimonial);
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), deleteTestimonial);

export default router;
