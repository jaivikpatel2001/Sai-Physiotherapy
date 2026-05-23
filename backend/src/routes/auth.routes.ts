import { Router } from 'express';
import {
  login, register, logout, refreshToken, getMe,
  forgotPassword, resetPassword, changePassword,
  getAllUsers, getUserById, toggleUserStatus,
  loginSchema, registerSchema,
} from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: |
 *       Creates a new staff or patient account. Public endpoint — no token required.
 *       Returns the created user along with a freshly issued access/refresh token pair.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name: { type: string, example: 'Dr. Rajesh Patel' }
 *               email: { type: string, format: email, example: 'rajesh@saiphysio.com' }
 *               phone: { type: string, example: '+919876543210' }
 *               password: { type: string, minLength: 8, example: 'Strong@Pass1' }
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin, doctor, receptionist, patient]
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/AuthTokens' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       409: { description: Email already registered }
 */
router.post('/register', validate(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive JWT tokens
 *     description: |
 *       Exchanges email + password for a short-lived access token (15m) and a
 *       longer-lived refresh token (7d). Use the access token in
 *       `Authorization: Bearer <token>` for subsequent requests.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: 'admin@saiphysio.com'
 *             password: 'Admin@123456'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/AuthTokens' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(loginSchema), login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Invalidate the current refresh token
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/logout', authenticate, logout);

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/AuthTokens' }
 *       401: { description: Refresh token expired or revoked }
 */
router.post('/refresh-token', refreshToken);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Return the currently authenticated user
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/AuthUser' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me', authenticate, getMe);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send a password reset email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Reset email dispatched if the address exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 */
router.post('/forgot-password', forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset the password using a token from the reset email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */
router.post('/reset-password', resetPassword);

/**
 * @openapi
 * /auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Change the current user's password
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.put('/change-password', authenticate, changePassword);

/**
 * @openapi
 * /auth/users:
 *   get:
 *     tags: [Auth]
 *     summary: List all users (admin)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [super_admin, admin, doctor, receptionist, patient]
 *     responses:
 *       200:
 *         description: Paginated user list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/AuthUser' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/users', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getAllUsers);

/**
 * @openapi
 * /auth/users/{id}:
 *   get:
 *     tags: [Auth]
 *     summary: Fetch a single user by ID (admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/AuthUser' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/users/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), getUserById);

/**
 * @openapi
 * /auth/users/{id}/toggle-status:
 *   patch:
 *     tags: [Auth]
 *     summary: Activate or deactivate a user account (super admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User status flipped
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/AuthUser' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch('/users/:id/toggle-status', authenticate, authorize(UserRole.SUPER_ADMIN), toggleUserStatus);

export default router;
