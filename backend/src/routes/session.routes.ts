import { Router } from 'express';
import {
  getPatientSessions, createSession, getSession,
  updateSession, getRecoveryProgress,
  createSessionSchema,
} from '../controllers/session.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();
router.use(authenticate);

const MEDICAL = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR];

/**
 * @openapi
 * /sessions/patient/{patientId}:
 *   get:
 *     tags: [Sessions]
 *     summary: List all treatment sessions for a patient (chronological)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Patient session history
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/TreatmentSession' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/patient/:patientId', authorize(...MEDICAL), getPatientSessions);

/**
 * @openapi
 * /sessions/patient/{patientId}/recovery:
 *   get:
 *     tags: [Sessions]
 *     summary: Aggregate recovery percentage trend for a patient
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Recovery time-series
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
 *                           date: { type: string, format: date-time }
 *                           recoveryPercentage: { type: number }
 *                           painScale: { type: number }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/patient/:patientId/recovery', authorize(...MEDICAL), getRecoveryProgress);

/**
 * @openapi
 * /sessions:
 *   post:
 *     tags: [Sessions]
 *     summary: Record a new treatment session with SOAP notes
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TreatmentSession' }
 *     responses:
 *       201:
 *         description: Session created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/TreatmentSession' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), validate(createSessionSchema), createSession);

/**
 * @openapi
 * /sessions/{id}:
 *   get:
 *     tags: [Sessions]
 *     summary: Get a single treatment session by _id
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Session record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/TreatmentSession' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', authorize(...MEDICAL), getSession);

/**
 * @openapi
 * /sessions/{id}:
 *   put:
 *     tags: [Sessions]
 *     summary: Update an existing session (e.g. amend SOAP notes)
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
 *           schema: { $ref: '#/components/schemas/TreatmentSession' }
 *     responses:
 *       200:
 *         description: Session updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/TreatmentSession' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), updateSession);

export default router;
