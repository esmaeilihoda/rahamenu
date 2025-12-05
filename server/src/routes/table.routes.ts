import { Router } from 'express';
import {
  getTables,
  getTable,
  createTable,
  updateTable,
  updateTableStatus,
  generateQRCode,
  deleteTable,
  callWaiter,
  createTableSchema,
  updateTableStatusSchema,
} from '../controllers/table.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validator.middleware';

const router = Router();

// Get all tables for a restaurant (manager only)
router.get(
  '/',
  authenticate,
  authorize('manager', 'admin'),
  getTables
);

// Get single table
router.get(
  '/single/:id',
  getTable
);

// Create table (manager/admin only)
router.post(
  '/',
  authenticate,
  authorize('manager', 'admin'),
  validateRequest(createTableSchema),
  createTable
);

// Update table status (manager/admin/staff)
router.patch(
  '/:id/status',
  authenticate,
  authorize('manager', 'admin', 'staff'),
  validateRequest(updateTableStatusSchema),
  updateTableStatus
);

// Update table (manager/admin only)
router.put(
  '/:id',
  authenticate,
  authorize('manager', 'admin'),
  validateRequest(createTableSchema),
  updateTable
);

// Generate/regenerate QR code (manager/admin)
router.post(
  '/:id/qr',
  authenticate,
  authorize('manager', 'admin'),
  generateQRCode
);

// Delete table (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteTable
);

// Call waiter (digital bell) - public endpoint
router.post(
  '/:id/call-waiter',
  callWaiter
);

export default router;
