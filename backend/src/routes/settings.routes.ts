import { Router } from 'express';
import { getSettings, updateSettings, updateHomepage } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

/**
 * @openapi
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: Public — return the single clinic-settings document
 *     description: |
 *       Drives clinic NAP, hours, contact, branding, and homepage sections used
 *       across the marketing site.
 *     responses:
 *       200:
 *         description: Clinic settings
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       description: Free-form clinic settings document (single row)
 */
router.get('/', getSettings);

/**
 * @openapi
 * /settings:
 *   put:
 *     tags: [Settings]
 *     summary: Replace the clinic-settings document (super admin only)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Full clinic-settings payload
 *     responses:
 *       200:
 *         description: Settings updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.put('/', authenticate, authorize(UserRole.SUPER_ADMIN), updateSettings);

/**
 * @openapi
 * /settings/homepage:
 *   post:
 *     tags: [Settings]
 *     summary: Update the curated homepage sections (hero, features, CTA, etc.)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Homepage-block payload (sections array + ordering)
 *     responses:
 *       200:
 *         description: Homepage configuration saved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/homepage', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateHomepage);

export default router;
