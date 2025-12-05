import { Router } from 'express';
import { getSalesMetrics, getPopularItems, getPeakHours, getTableMetrics, getVibeAnalytics, getSalesDaily, getSalesWeekly, getSalesMonthly, invalidateAnalyticsCache } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/sales/:restaurantId', getSalesMetrics);
router.get('/sales/daily/:restaurantId', getSalesDaily);
router.get('/sales/weekly/:restaurantId', getSalesWeekly);
router.get('/sales/monthly/:restaurantId', getSalesMonthly);
router.get('/popular-items/:restaurantId', getPopularItems);
router.get('/peak-hours/:restaurantId', getPeakHours);
router.get('/table-metrics/:restaurantId', getTableMetrics);
router.get('/vibes/:restaurantId', getVibeAnalytics);
router.post('/cache/invalidate', invalidateAnalyticsCache);

export default router;
