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

router.get('/reports/daily', authorize(...BILLING_STAFF), getDailyReport);
router.get('/reports/outstanding', authorize(...BILLING_STAFF), getOutstandingDues);
router.get('/reports/monthly', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getMonthlyRevenue);

router.get('/', authorize(...BILLING_STAFF), getAllBills);
router.post('/', authorize(...BILLING_STAFF), validate(createBillingSchema), createBill);
router.get('/:id', authorize(...BILLING_STAFF), getBill);
router.put('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateBill);
router.patch('/:id/payment', authorize(...BILLING_STAFF), validate(recordPaymentSchema), recordPayment);

export default router;
