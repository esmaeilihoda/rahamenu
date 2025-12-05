import { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { env } from '../config/env';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

// Validation schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1).max(100),
    role: z.enum(['admin', 'manager', 'staff']).optional(),
    restaurantId: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

// Helper function to generate JWT
const generateToken = (user: any) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId?.toString(),
  } as const;
  const secret: jwt.Secret = env.JWT_SECRET as jwt.Secret;
  const options: jwt.SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
  return jwt.sign(payload, secret, options);
};

// Register new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role, restaurantId } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(409, 'Email already registered');
  }

  // Create user
  const user = await User.create({
    email,
    password,
    name,
    role: role || 'staff',
    restaurantId,
  });

  // Generate token
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      },
      token,
    },
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError(403, 'Account is deactivated');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      },
      token,
    },
  });
});

// Get current user
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user,
  });
});

// Update profile
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw new AppError(400, 'Name is required');
  }

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    { name: name.trim() },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user,
  });
});

// Change password
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?.id).select('+password');

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new AppError(401, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// Refresh token (simplified - in production use separate refresh token model)
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError(401, 'Refresh token required');
  }

  try {
    // Verify refresh token (using same secret for simplicity)
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      restaurantId?: string;
    };

    // Get user
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError(401, 'User not found or inactive');
    }

    // Generate new access token
    const newToken = generateToken(user);

    res.json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    throw new AppError(401, 'Invalid or expired refresh token');
  }
});

// Logout (optional - for token blacklisting in production)
export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  // In production, add token to blacklist/revoke refresh token
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});
