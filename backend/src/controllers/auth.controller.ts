import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { generateOTP } from '@sai-physio/utils';
import { sendSuccess } from '../utils/response';
import { UserRole } from '@sai-physio/types';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.PATIENT),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route  POST /api/v1/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password, role } = req.body as z.infer<typeof registerSchema>;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('Email already registered', 409);

  const user = await User.create({ name, email, phone, password, role });
  const tokens = generateTokenPair({ id: user._id.toString(), role: user.role });

  // Store refresh token
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

  sendSuccess({
    res,
    statusCode: 201,
    message: 'Registration successful',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      ...tokens,
    },
  });
});

/**
 * @route  POST /api/v1/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('Account is deactivated. Contact admin.', 403);

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw new AppError('Invalid email or password', 401);

  const tokens = generateTokenPair({ id: user._id.toString(), role: user.role });

  await User.findByIdAndUpdate(user._id, {
    refreshToken: tokens.refreshToken,
    lastLogin: new Date(),
  });

  sendSuccess({
    res,
    message: 'Login successful',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    },
  });
});

/**
 * @route  POST /api/v1/auth/refresh-token
 * @access Public
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body as { refreshToken: string };
  if (!token) throw new AppError('Refresh token is required', 400);

  let decoded: { id: string; role: UserRole };
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token is invalid or reused', 401);
  }

  const tokens = generateTokenPair({ id: user._id.toString(), role: user.role });
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

  sendSuccess({ res, message: 'Token refreshed', data: tokens });
});

/**
 * @route  POST /api/v1/auth/logout
 * @access Private
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }
  sendSuccess({ res, message: 'Logged out successfully' });
});

/**
 * @route  GET /api/v1/auth/me
 * @access Private
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new AppError('User not found', 404);
  sendSuccess({ res, data: user });
});

/**
 * @route  POST /api/v1/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) {
    sendSuccess({ res, message: 'If that email exists, a reset OTP has been sent.' });
    return;
  }

  const otp = generateOTP(6);
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await User.findByIdAndUpdate(user._id, { otpCode: otp, otpExpires });

  // TODO: Send OTP via email (notification service)
  // await notificationService.sendPasswordResetEmail(user.email, otp);

  sendSuccess({ res, message: 'OTP sent to your email address. Valid for 10 minutes.' });
});

/**
 * @route  POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };

  const user = await User.findOne({
    otpCode: token,
    otpExpires: { $gt: new Date() },
  }).select('+otpCode +otpExpires');

  if (!user) throw new AppError('Invalid or expired OTP', 400);

  user.password = password;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();

  sendSuccess({ res, message: 'Password reset successful. Please login.' });
});

/**
 * @route  PUT /api/v1/auth/change-password
 * @access Private
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const user = await User.findById(req.user?._id).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) throw new AppError('Current password is incorrect', 400);

  user.password = newPassword;
  await user.save();

  sendSuccess({ res, message: 'Password changed successfully' });
});

/**
 * @route  GET /api/v1/auth/users (admin)
 * @access Admin+
 */
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role } = req.query as { role?: UserRole };
  const filter = role ? { role } : {};
  const users = await User.find(filter).sort({ createdAt: -1 });
  sendSuccess({ res, data: users });
});

/**
 * @route  GET /api/v1/auth/users/:id (admin)
 * @access Admin+
 */
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  sendSuccess({ res, data: user });
});

/**
 * @route  PATCH /api/v1/auth/users/:id/toggle-status
 * @access Super Admin only
 */
export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?._id?.toString() === req.params.id) {
    throw new AppError('You cannot change the status of your own account', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  user.isActive = !user.isActive;
  // Invalidate refresh token when deactivating so the user is forced out
  if (!user.isActive) user.refreshToken = undefined;
  await user.save();

  // Re-fetch via toJSON-transformed find so password & sensitive fields are stripped
  const fresh = await User.findById(user._id);

  sendSuccess({
    res,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: fresh,
  });
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
  role: z.nativeEnum(UserRole).optional(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

export { updateUserSchema };

/**
 * @route  PUT /api/v1/auth/users/:id
 * @access Super Admin / Admin
 */
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const payload = req.body as z.infer<typeof updateUserSchema>;

  if (payload.email) {
    const conflict = await User.findOne({ email: payload.email, _id: { $ne: req.params.id } });
    if (conflict) throw new AppError('Email already in use by another account', 409);
  }

  if (payload.role && req.user?.role !== UserRole.SUPER_ADMIN) {
    throw new AppError('Only super admins can change user roles', 403);
  }

  const user = await User.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);

  sendSuccess({ res, message: 'User updated successfully', data: user });
});

/**
 * @route  DELETE /api/v1/auth/users/:id
 * @access Super Admin only
 */
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?._id?.toString() === req.params.id) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  if (user.role === UserRole.SUPER_ADMIN) {
    const superAdmins = await User.countDocuments({ role: UserRole.SUPER_ADMIN });
    if (superAdmins <= 1) {
      throw new AppError('Cannot delete the last remaining super admin', 400);
    }
  }

  await user.deleteOne();

  sendSuccess({ res, message: 'User deleted successfully', data: { _id: req.params.id } });
});
