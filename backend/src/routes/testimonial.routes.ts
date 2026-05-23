import { Router } from 'express';
import {
  getApprovedTestimonials, submitTestimonial,
  getAllTestimonialsAdmin, getTestimonialByIdAdmin,
  approveTestimonial, deleteTestimonial,
  createTestimonialAdmin, updateTestimonialAdmin,
} from '../controllers/testimonial.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

/**
 * @openapi
 * /testimonials:
 *   get:
 *     tags: [Testimonials]
 *     summary: Public — list approved testimonials
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Approved testimonial list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Testimonial' }
 */
router.get('/', getApprovedTestimonials);

/**
 * @openapi
 * /testimonials/submit:
 *   post:
 *     tags: [Testimonials]
 *     summary: Public — submit a new testimonial (pending moderation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientName, rating, review]
 *             properties:
 *               patientName: { type: string }
 *               patientAge: { type: integer }
 *               condition: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               review: { type: string, minLength: 10 }
 *     responses:
 *       201:
 *         description: Submitted (queued for admin approval)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Testimonial' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */
router.post('/submit', submitTestimonial);

/**
 * @openapi
 * /testimonials/admin:
 *   get:
 *     tags: [Testimonials]
 *     summary: Admin — moderation queue (all testimonials, any status)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: isApproved
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Paginated testimonials
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Testimonial' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/admin', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getAllTestimonialsAdmin);

/**
 * @openapi
 * /testimonials/admin/{id}:
 *   get:
 *     tags: [Testimonials]
 *     summary: Admin — fetch a single testimonial by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Testimonial record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Testimonial' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/admin/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getTestimonialByIdAdmin);

/**
 * @openapi
 * /testimonials/admin:
 *   post:
 *     tags: [Testimonials]
 *     summary: Admin — create a testimonial directly (already approved)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Testimonial' }
 *     responses:
 *       201:
 *         description: Testimonial created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Testimonial' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/admin', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), createTestimonialAdmin);

/**
 * @openapi
 * /testimonials/{id}:
 *   put:
 *     tags: [Testimonials]
 *     summary: Admin — update testimonial content
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
 *           schema: { $ref: '#/components/schemas/Testimonial' }
 *     responses:
 *       200:
 *         description: Testimonial updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Testimonial' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateTestimonialAdmin);

/**
 * @openapi
 * /testimonials/{id}/moderate:
 *   patch:
 *     tags: [Testimonials]
 *     summary: Approve or reject a submitted testimonial
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
 *           schema:
 *             type: object
 *             properties:
 *               isApproved: { type: boolean }
 *               isFeatured: { type: boolean }
 *     responses:
 *       200:
 *         description: Moderation status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Testimonial' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch('/:id/moderate', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), approveTestimonial);

/**
 * @openapi
 * /testimonials/{id}:
 *   delete:
 *     tags: [Testimonials]
 *     summary: Delete a testimonial
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Testimonial deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), deleteTestimonial);

export default router;
