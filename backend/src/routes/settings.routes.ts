import { Router } from 'express';
import { getSettings, updateSettings, updateHomepage } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, authorize(UserRole.SUPER_ADMIN), updateSettings);
router.post('/homepage', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateHomepage);

export default router;
