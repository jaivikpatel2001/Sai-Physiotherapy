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

/**
 * @openapi
 * /doctors:
 *   get:
 *     tags: [Doctors]
 *     summary: Public — list active doctor profiles for the marketing site
 *     responses:
 *       200:
 *         description: Active doctors
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Doctor' }
 */
router.get('/', getPublicDoctors);

/**
 * @openapi
 * /doctors/slug/{slug}:
 *   get:
 *     tags: [Doctors]
 *     summary: Public — fetch a doctor profile by URL slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: dr-rajesh-patel
 *     responses:
 *       200:
 *         description: Doctor profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Doctor' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/slug/:slug', getDoctorBySlug);

/**
 * @openapi
 * /doctors/admin/list:
 *   get:
 *     tags: [Doctors]
 *     summary: Admin — list every doctor profile (active + inactive, paginated)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated doctor list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Doctor' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/admin/list', authenticate, authorize(...STAFF), getAllDoctorsAdmin);

/**
 * @openapi
 * /doctors/{id}:
 *   get:
 *     tags: [Doctors]
 *     summary: Admin — fetch a single doctor profile by _id
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Doctor profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Doctor' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', authenticate, authorize(...STAFF), getDoctor);

/**
 * @openapi
 * /doctors:
 *   post:
 *     tags: [Doctors]
 *     summary: Create a new doctor profile
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Doctor' }
 *           example:
 *             name: 'Dr. Rajesh Patel'
 *             slug: 'dr-rajesh-patel'
 *             designation: 'Senior Physiotherapist'
 *             specialties: ['Spine Care', 'Sports Injury']
 *             qualifications: ['BPT', 'MPT (Ortho)']
 *             experienceYears: 15
 *             isActive: true
 *     responses:
 *       201:
 *         description: Doctor created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Doctor' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/', authenticate, authorize(...STAFF), createDoctor);

/**
 * @openapi
 * /doctors/{id}:
 *   put:
 *     tags: [Doctors]
 *     summary: Update a doctor profile
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Doctor' }
 *     responses:
 *       200:
 *         description: Doctor updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Doctor' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', authenticate, authorize(...STAFF), updateDoctor);

/**
 * @openapi
 * /doctors/{id}:
 *   delete:
 *     tags: [Doctors]
 *     summary: Delete a doctor profile (admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Doctor deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteDoctor);

export default router;
