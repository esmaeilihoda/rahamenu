import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  registerSchema,
  loginSchema,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validator.middleware';

const router = Router();

// Register new user
router.post(
  '/register',
  validateRequest(registerSchema),
  register
);

// Login
router.post(
  '/login',
  validateRequest(loginSchema),
  login
);

// Refresh access token
router.post(
  '/refresh',
  refreshToken
);

// Logout
router.post(
  '/logout',
  authenticate,
  logout
);

// Get current user (requires authentication)
router.get(
  '/me',
  authenticate,
  getMe
);

// Update profile (requires authentication)
router.patch(
  '/profile',
  authenticate,
  updateProfile
);

// Change password (requires authentication)
router.patch(
  '/change-password',
  authenticate,
  changePassword
);

export default router;
