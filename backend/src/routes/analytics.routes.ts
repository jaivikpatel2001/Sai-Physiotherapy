import { Router } from 'express';
import {
  getDashboardStats,
  getAppointmentTrend,
  getRevenueByMonth,
  getPatientsByService,
  getDoctorWorkload,
  getTopDoctors,
  getUpcomingAppointments,
  getRecentPayments,
  getRecentActivity,
  getContentSummary,
  getPatientGrowth,
  getAppointmentStatusBreakdown,
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR));

router.get('/dashboard', getDashboardStats);
router.get('/appointments/trend', getAppointmentTrend);
router.get('/appointments/status', getAppointmentStatusBreakdown);
router.get('/appointments/upcoming', getUpcomingAppointments);
router.get('/revenue', getRevenueByMonth);
router.get('/payments/recent', getRecentPayments);
router.get('/services/breakdown', getPatientsByService);
router.get('/doctors/workload', getDoctorWorkload);
router.get('/doctors/top', getTopDoctors);
router.get('/patients/growth', getPatientGrowth);
router.get('/activity/recent', getRecentActivity);
router.get('/content/summary', getContentSummary);

export default router;
