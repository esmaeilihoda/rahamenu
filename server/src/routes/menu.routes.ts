import { Router } from 'express';
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  createMenuItemSchema,
  updateMenuItemSchema,
} from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validator.middleware';

const router = Router();

// Get all menu items for a restaurant (public)
router.get('/', getMenuItems);

// Get single menu item (public)
router.get('/item/:id', getMenuItem);

// Create menu item (manager/admin only)
router.post(
  '/',
  authenticate,
  authorize('manager', 'admin'),
  validateRequest(createMenuItemSchema),
  createMenuItem
);

// Update menu item (manager/admin only)
router.patch(
  '/:id',
  authenticate,
  authorize('manager', 'admin'),
  validateRequest(updateMenuItemSchema),
  updateMenuItem
);

// Toggle availability (86'd) (manager/admin/staff)
router.patch(
  '/:id/availability',
  authenticate,
  authorize('manager', 'admin', 'staff'),
  toggleAvailability
);

// Delete menu item (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteMenuItem
);

export default router;
