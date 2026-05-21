import { Router } from 'express';
import {
  login, register, logout, refreshToken, getMe,
  forgotPassword, resetPassword, changePassword,
  getAllUsers, toggleUserStatus,
  loginSchema, registerSchema,
} from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [super_admin, admin, doctor, receptionist, patient] }
 *     responses:
 *       201: { description: Registration successful }
 *       409: { description: Email already registered }
 */
router.post('/register', validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT tokens
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful with tokens }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(loginSchema), login);

router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', authenticate, changePassword);

// Admin-only user management
router.get('/users', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getAllUsers);
router.patch('/users/:id/toggle-status', authenticate, authorize(UserRole.SUPER_ADMIN), toggleUserStatus);

export default router;
