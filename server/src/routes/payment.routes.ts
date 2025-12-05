import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { requestPayment, verifyPayment, markPayAtCounter, confirmCounterPayment } from '../controllers/payment.controller';

const router = Router();

router.use(tenantMiddleware);

// Customer routes
router.post('/request', requestPayment);
router.all('/verify', verifyPayment);
router.post('/counter', markPayAtCounter);

// Manager routes
router.patch('/:orderId/confirm-counter', authenticate, authorize('manager', 'admin'), confirmCounterPayment);

export default router;