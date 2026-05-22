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

/**
 * @openapi
 * /analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Top-level KPI tiles for the admin dashboard
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Aggregate KPIs (patient counts, appointments, revenue, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalPatients: { type: integer }
 *                         appointmentsToday: { type: integer }
 *                         revenueThisMonth: { type: number }
 *                         outstandingDues: { type: number }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/dashboard', getDashboardStats);

/**
 * @openapi
 * /analytics/appointments/trend:
 *   get:
 *     tags: [Analytics]
 *     summary: Appointment volume time-series
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Daily appointment counts
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date: { type: string, format: date }
 *                           count: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/appointments/trend', getAppointmentTrend);

/**
 * @openapi
 * /analytics/appointments/status:
 *   get:
 *     tags: [Analytics]
 *     summary: Breakdown of appointments by status
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Status histogram
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status: { type: string }
 *                           count: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/appointments/status', getAppointmentStatusBreakdown);

/**
 * @openapi
 * /analytics/appointments/upcoming:
 *   get:
 *     tags: [Analytics]
 *     summary: Next N upcoming appointments
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Upcoming appointments
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Appointment' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/appointments/upcoming', getUpcomingAppointments);

/**
 * @openapi
 * /analytics/revenue:
 *   get:
 *     tags: [Analytics]
 *     summary: Revenue by month time-series
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: months
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200:
 *         description: Monthly revenue
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month: { type: string, example: '2026-05' }
 *                           total: { type: number }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/revenue', getRevenueByMonth);

/**
 * @openapi
 * /analytics/payments/recent:
 *   get:
 *     tags: [Analytics]
 *     summary: Recently recorded payments
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Recent payments
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Billing' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/payments/recent', getRecentPayments);

/**
 * @openapi
 * /analytics/services/breakdown:
 *   get:
 *     tags: [Analytics]
 *     summary: Patient distribution across services
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Service-share breakdown
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           service: { type: string }
 *                           count: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/services/breakdown', getPatientsByService);

/**
 * @openapi
 * /analytics/doctors/workload:
 *   get:
 *     tags: [Analytics]
 *     summary: Per-doctor appointment workload
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Doctor workload
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           doctor: { type: string }
 *                           appointments: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/doctors/workload', getDoctorWorkload);

/**
 * @openapi
 * /analytics/doctors/top:
 *   get:
 *     tags: [Analytics]
 *     summary: Top-performing doctors by appointment volume
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200:
 *         description: Top doctors
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           doctor: { type: string }
 *                           appointments: { type: integer }
 *                           revenue: { type: number }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/doctors/top', getTopDoctors);

/**
 * @openapi
 * /analytics/patients/growth:
 *   get:
 *     tags: [Analytics]
 *     summary: New-patient registrations over time
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: months
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200:
 *         description: Patient growth time-series
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month: { type: string, example: '2026-05' }
 *                           count: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/patients/growth', getPatientGrowth);

/**
 * @openapi
 * /analytics/activity/recent:
 *   get:
 *     tags: [Analytics]
 *     summary: Recent activity feed (new patients, payments, blogs, etc.)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Activity feed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type: { type: string }
 *                           message: { type: string }
 *                           at: { type: string, format: date-time }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/activity/recent', getRecentActivity);

/**
 * @openapi
 * /analytics/content/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: CMS content counts (blogs, services, doctors, gallery, pages)
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Content summary
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         blogs: { type: integer }
 *                         services: { type: integer }
 *                         doctors: { type: integer }
 *                         gallery: { type: integer }
 *                         pages: { type: integer }
 *                         testimonials: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/content/summary', getContentSummary);

export default router;
