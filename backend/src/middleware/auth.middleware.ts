import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { AppError } from './error.middleware';
import { env } from '../config/env';
import { UserRole } from '@sai-physio/types';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    phone: string;
  };
}

interface JwtPayload {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Authenticate — validates JWT and attaches user to req.user
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired access token', 401);
    }

    const user = await User.findById(decoded.id).select('_id name email role phone isActive');

    if (!user) throw new AppError('User not found', 401);
    if (!user.isActive) throw new AppError('Account is deactivated', 403);

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize — RBAC role check. Usage: authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Super admin has access to everything
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Optional auth — attaches user if token present, but doesn't fail if missing
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.id).select('_id name email role phone isActive');

    if (user && user.isActive) {
      req.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      };
    }
    next();
  } catch {
    // Silently ignore token errors for optional auth
    next();
  }
};
