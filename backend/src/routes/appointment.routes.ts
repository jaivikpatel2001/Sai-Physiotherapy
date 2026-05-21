import { Router } from 'express';
import {
  getAllAppointments, createAppointment, getAppointment,
  updateAppointment, updateAppointmentStatus,
  getAvailableSlots, getTodayAppointments,
  createAppointmentSchema, updateStatusSchema,
} from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();
const STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST];

// Public route: available slots for booking widget
router.get('/available-slots', getAvailableSlots);

router.use(authenticate);

router.get('/today', authorize(...STAFF), getTodayAppointments);
router.get('/', authorize(...STAFF), getAllAppointments);
router.post('/', authorize(...STAFF), validate(createAppointmentSchema), createAppointment);
router.get('/:id', authorize(...STAFF), getAppointment);
router.put('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST), updateAppointment);
router.patch('/:id/status', authorize(...STAFF), validate(updateStatusSchema, 'body'), updateAppointmentStatus);

export default router;
