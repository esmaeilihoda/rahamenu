import { Router } from 'express';
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getTableOrders,
  cancelOrder,
  createOrderSchema,
  updateOrderStatusSchema,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validator.middleware';

const router = Router();

// Create new order (public - from customer view)
router.post(
  '/',
  validateRequest(createOrderSchema),
  createOrder
);

// Get all orders for a restaurant (manager only)
router.get(
  '/',
  authenticate,
  authorize('manager', 'admin'),
  getOrders
);

// Update order status (manager/staff)
router.patch(
  '/:id/status',
  authenticate,
  authorize('manager', 'admin', 'staff'),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus
);

// Get orders for specific table
router.get(
  '/table/:tableId',
  getTableOrders
);

// Cancel order
router.delete(
  '/:id',
  authenticate,
  authorize('manager', 'admin'),
  cancelOrder
);

export default router;
