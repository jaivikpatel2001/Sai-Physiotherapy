import { Router } from 'express';
import {
  getAllBills, createBill, getBill, updateBill,
  recordPayment, getDailyReport, getOutstandingDues, getMonthlyRevenue,
  createBillingSchema, recordPaymentSchema,
} from '../controllers/billing.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();
router.use(authenticate);

const BILLING_STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST];

/**
 * @openapi
 * /billing/reports/daily:
 *   get:
 *     tags: [Billing]
 *     summary: Cash collection report for a given day
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *         description: Defaults to today
 *     responses:
 *       200:
 *         description: Daily totals and per-method breakdown
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total: { type: number }
 *                         byMethod:
 *                           type: object
 *                           additionalProperties: { type: number }
 *                         bills:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Billing' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/reports/daily', authorize(...BILLING_STAFF), getDailyReport);

/**
 * @openapi
 * /billing/reports/outstanding:
 *   get:
 *     tags: [Billing]
 *     summary: List all bills with non-zero balance due
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Outstanding dues
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
router.get('/reports/outstanding', authorize(...BILLING_STAFF), getOutstandingDues);

/**
 * @openapi
 * /billing/reports/monthly:
 *   get:
 *     tags: [Billing]
 *     summary: Monthly revenue summary (admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2026 }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *     responses:
 *       200:
 *         description: Revenue aggregates
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total: { type: number }
 *                         paid: { type: number }
 *                         outstanding: { type: number }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/reports/monthly', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getMonthlyRevenue);

/**
 * @openapi
 * /billing:
 *   get:
 *     tags: [Billing]
 *     summary: List invoices (paginated)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: paymentStatus
 *         schema: { type: string, enum: [paid, partial, pending, waived] }
 *       - in: query
 *         name: patient
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invoice list
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
router.get('/', authorize(...BILLING_STAFF), getAllBills);

/**
 * @openapi
 * /billing:
 *   post:
 *     tags: [Billing]
 *     summary: Create a new invoice
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Billing' }
 *     responses:
 *       201:
 *         description: Invoice created (server-generates invoiceNumber)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Billing' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/', authorize(...BILLING_STAFF), validate(createBillingSchema), createBill);

/**
 * @openapi
 * /billing/{id}:
 *   get:
 *     tags: [Billing]
 *     summary: Get a single invoice by _id
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invoice record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Billing' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', authorize(...BILLING_STAFF), getBill);

/**
 * @openapi
 * /billing/{id}:
 *   put:
 *     tags: [Billing]
 *     summary: Update an invoice (admin only)
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
 *           schema: { $ref: '#/components/schemas/Billing' }
 *     responses:
 *       200:
 *         description: Invoice updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Billing' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateBill);

/**
 * @openapi
 * /billing/{id}/payment:
 *   patch:
 *     tags: [Billing]
 *     summary: Record a (full or partial) payment against an invoice
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
 *             required: [amount, paymentMethod]
 *             properties:
 *               amount: { type: number, minimum: 0 }
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, upi_manual, bank_transfer, cheque, pending]
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Payment recorded; balance recalculated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Billing' }
 *       400:
 *         description: Amount exceeds balance or invoice already settled
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch('/:id/payment', authorize(...BILLING_STAFF), validate(recordPaymentSchema), recordPayment);

export default router;
