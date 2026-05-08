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

router.get('/patient/:patientId', authorize(...MEDICAL), getPatientSessions);
router.get('/patient/:patientId/recovery', authorize(...MEDICAL), getRecoveryProgress);
router.post('/', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), validate(createSessionSchema), createSession);
router.get('/:id', authorize(...MEDICAL), getSession);
router.put('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), updateSession);

export default router;
