import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AnalyticsService } from '../services/analytics.service';

const analytics = new AnalyticsService();

const parseRange = (req: Request) => {
  const range = req.query.range as string | undefined;
  const now = new Date();
  const days = range === '90d' ? 90 : range === '30d' ? 30 : 7;
  const end = now;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
};

export const getSalesMetrics = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const range = parseRange(req);
  const data = await analytics.getSalesMetrics(restaurantId, range);
  res.json({ data });
});

export const getPopularItems = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const range = parseRange(req);
  const limit = Number(req.query.limit || 10);
  const data = await analytics.getPopularItems(restaurantId, range, limit);
  res.json({ data });
});

export const getPeakHours = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const range = parseRange(req);
  const data = await analytics.getPeakHours(restaurantId, range);
  res.json({ data });
});

export const getTableMetrics = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const range = parseRange(req);
  const data = await analytics.getTableMetrics(restaurantId, range);
  res.json({ data });
});

export const getVibeAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const range = parseRange(req);
  const data = await analytics.getVibeAnalytics(restaurantId, range);
  res.json({ data });
});

export const getSalesDaily = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  // Allow optional explicit startDate/endDate, else derive from range
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
  let range: { start: Date; end: Date };
  if (startDate && endDate) {
    range = { start: new Date(startDate), end: new Date(endDate) };
  } else {
    range = parseRange(req);
  }
  const data = await analytics.getDailySalesData(restaurantId, range);
  res.json({ data });
});

export const getSalesWeekly = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const range = parseRange(req);
  const data = await analytics.getWeeklySalesData(restaurantId, range);
  res.json({ data });
});

export const getSalesMonthly = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const range = parseRange(req);
  const data = await analytics.getMonthlySalesData(restaurantId, range);
  res.json({ data });
});

export const invalidateAnalyticsCache = asyncHandler(async (req: Request, res: Response) => {
  const { prefix, restaurantId } = req.query as { prefix?: string; restaurantId?: string };
  const result = analytics.clearCache(prefix, restaurantId);
  res.json({ data: result });
});
