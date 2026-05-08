import { Router } from 'express';
import {
  getAllPatients, createPatient, getPatient, updatePatient,
  deletePatient, getPatientSessions, getPatientBills, searchPatients,
  createPatientSchema,
} from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

const STAFF = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST];
const ADMIN_ONLY = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST];

router.use(authenticate);

router.get('/search', authorize(...STAFF), searchPatients);
router.get('/', authorize(...STAFF), getAllPatients);
router.post('/', authorize(...ADMIN_ONLY), validate(createPatientSchema), createPatient);
router.get('/:id', authorize(...STAFF), getPatient);
router.put('/:id', authorize(...ADMIN_ONLY), updatePatient);
router.delete('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), deletePatient);
router.get('/:id/sessions', authorize(...STAFF), getPatientSessions);
router.get('/:id/bills', authorize(...ADMIN_ONLY), getPatientBills);

export default router;
