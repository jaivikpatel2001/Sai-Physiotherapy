import { Router } from 'express';
import {
  getDashboardStats, getAppointmentTrend,
  getRevenueByMonth, getPatientsByService, getDoctorWorkload,
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR));

router.get('/dashboard', getDashboardStats);
router.get('/appointments/trend', getAppointmentTrend);
router.get('/revenue', getRevenueByMonth);
router.get('/services/breakdown', getPatientsByService);
router.get('/doctors/workload', getDoctorWorkload);

export default router;
