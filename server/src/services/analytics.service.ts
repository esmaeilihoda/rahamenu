import { Model, PipelineStage, Types } from 'mongoose';
import NodeCache from 'node-cache';
import { Order } from '../models/Order.model';
import { Vibe } from '../models/Vibe.model';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

export interface DateRange {
  start: Date;
  end: Date;
}

export class AnalyticsService {
  constructor(private orderModel: Model<any> = (Order as unknown as Model<any>)) {}

  private cacheKey(prefix: string, restaurantId: string, range: DateRange, extra?: string) {
    return `${prefix}:${restaurantId}:${range.start.toISOString()}:${range.end.toISOString()}:${extra || ''}`;
  }

  async getSalesMetrics(restaurantId: string, range: DateRange) {
    const key = this.cacheKey('sales', restaurantId, range);
    const cached = cache.get(key);
    if (cached) return cached;

    const restaurantObjectId = new Types.ObjectId(restaurantId);

    const pipeline = [
      { $match: { restaurantId: restaurantObjectId, createdAt: { $gte: range.start, $lte: range.end }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
    ];

    const [result] = await this.orderModel.aggregate(pipeline as PipelineStage[]);

    // Previous period comparison
    const diffMs = range.end.getTime() - range.start.getTime();
    const prevRange = { start: new Date(range.start.getTime() - diffMs), end: new Date(range.start.getTime()) };
    const [prev] = await this.orderModel.aggregate([
      { $match: { restaurantId: restaurantObjectId, createdAt: { $gte: prevRange.start, $lte: prevRange.end }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, orderCount: { $sum: 1 }, avgOrderValue: { $avg: '$totalAmount' } } },
    ] as PipelineStage[]);

    const withComparison = {
      totalRevenue: result?.totalRevenue || 0,
      orderCount: result?.orderCount || 0,
      avgOrderValue: result?.avgOrderValue || 0,
      comparison: {
        revenueChangePct: this.pctChange(prev?.totalRevenue || 0, result?.totalRevenue || 0),
        orderCountChangePct: this.pctChange(prev?.orderCount || 0, result?.orderCount || 0),
        aovChangePct: this.pctChange(prev?.avgOrderValue || 0, result?.avgOrderValue || 0),
      },
    };

    cache.set(key, withComparison);
    return withComparison;
  }

  async getPopularItems(restaurantId: string, range: DateRange, limit = 10) {
    const key = this.cacheKey('popular', restaurantId, range, String(limit));
    const cached = cache.get(key);
    if (cached) return cached;

    const restaurantObjectId = new Types.ObjectId(restaurantId);

    const pipeline = [
      { $match: { restaurantId: restaurantObjectId, createdAt: { $gte: range.start, $lte: range.end }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          name: { $first: '$items.name' },
          category: { $first: '$items.category' },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: limit },
    ];

    const results = await this.orderModel.aggregate(pipeline as PipelineStage[]);
    cache.set(key, results);
    return results;
  }

  async getPeakHours(restaurantId: string, range: DateRange) {
    const key = this.cacheKey('peak', restaurantId, range);
    const cached = cache.get(key);
    if (cached) return cached;

    const restaurantObjectId = new Types.ObjectId(restaurantId);

    const pipeline = [
      { $match: { restaurantId: restaurantObjectId, createdAt: { $gte: range.start, $lte: range.end }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $hour: { date: '$createdAt' } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const hours = await this.orderModel.aggregate(pipeline as PipelineStage[]);
    cache.set(key, hours);
    return hours;
  }

  async getTableMetrics(restaurantId: string, range: DateRange) {
    const key = this.cacheKey('tableMetrics', restaurantId, range);
    const cached = cache.get(key);
    if (cached) return cached;

    const restaurantObjectId = new Types.ObjectId(restaurantId);

    const pipeline = [
      { $match: { restaurantId: restaurantObjectId, createdAt: { $gte: range.start, $lte: range.end } } },
      {
        $group: {
          _id: '$tableNumber',
          orders: { $sum: 1 },
        },
      },
      { $sort: { orders: -1 } },
    ];

    const usage = await this.orderModel.aggregate(pipeline as PipelineStage[]);
    const totalOrders = usage.reduce((sum: number, t: any) => sum + t.orders, 0);
    const mostUsed = usage[0]?._id || null;
    const leastUsed = usage[usage.length - 1]?._id || null;

    const result = {
      utilizationRate: totalOrders > 0 ? (totalOrders / usage.length) : 0,
      mostUsedTable: mostUsed,
      leastUsedTable: leastUsed,
      tableUsage: usage,
    };
    cache.set(key, result);
    return result;
  }

  async getVibeAnalytics(restaurantId: string, range: DateRange) {
    const key = this.cacheKey('vibes', restaurantId, range);
    const cached = cache.get(key);
    if (cached) return cached;

    const restaurantObjectId = new Types.ObjectId(restaurantId);

    const pipeline = [
      { $match: { restaurantId: restaurantObjectId, createdAt: { $gte: range.start, $lte: range.end }, selectedVibe: { $ne: null } } },
      { $group: { _id: '$selectedVibe', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const vibesAgg = await this.orderModel.aggregate(pipeline as PipelineStage[]);
    
    // Fetch all vibes for this restaurant to map keys to labels
    const vibeRecords = await Vibe.find({ restaurantId: restaurantObjectId }).lean();
    const vibeMap = new Map(vibeRecords.map(v => [v.key, { label: v.label, emoji: v.emoji }]));
    
    const mostPopularVibeKey = vibesAgg[0]?._id || null;
    const mostPopularVibe = mostPopularVibeKey 
      ? `${vibeMap.get(mostPopularVibeKey)?.emoji || ''} ${vibeMap.get(mostPopularVibeKey)?.label || mostPopularVibeKey}`.trim()
      : null;
    
    const vibeBreakdown = vibesAgg.map((v: any) => {
      const vibeKey = v._id || 'unknown';
      const vibeData = vibeMap.get(vibeKey);
      const displayName = vibeData 
        ? `${vibeData.emoji || ''} ${vibeData.label}`.trim()
        : vibeKey;
      return { vibe: displayName, count: v.count };
    });
    
    const result = { mostPopularVibe, vibeBreakdown };
    cache.set(key, result);
    return result;
  }

  async getDailySalesData(restaurantId: string, range: DateRange) {
    const key = this.cacheKey('salesDaily', restaurantId, range);
    const cached = cache.get(key);
    if (cached) return cached;

    const restaurantObjectId = new Types.ObjectId(restaurantId);

    const pipeline = [
      { $match: { restaurantId: restaurantObjectId, createdAt: { $gte: range.start, $lte: range.end }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          aov: { $avg: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const results = await this.orderModel.aggregate(pipeline as PipelineStage[]);
    const data = results.map((r: any) => ({ date: r._id, revenue: r.revenue, orders: r.orders, aov: r.aov }));
    cache.set(key, data);
    return data;
  }

  async getWeeklySalesData(restaurantId: string, range: DateRange) {
    const key = this.cacheKey('salesWeekly', restaurantId, range);
    const cached = cache.get(key);
    if (cached) return cached;

    const restaurantObjectId = new Types.ObjectId(restaurantId);
    const pipeline = [
      { $match: { restaurantId: restaurantObjectId, createdAt: { $gte: range.start, $lte: range.end }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, week: { $isoWeek: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          aov: { $avg: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ];

    const results = await this.orderModel.aggregate(pipeline as PipelineStage[]);
    const data = results.map((r: any) => ({ label: `${r._id.year}-W${r._id.week}`, revenue: r.revenue, orders: r.orders, aov: r.aov }));
    cache.set(key, data);
    return data;
  }

  async getMonthlySalesData(restaurantId: string, range: DateRange) {
    const key = this.cacheKey('salesMonthly', restaurantId, range);
    const cached = cache.get(key);
    if (cached) return cached;

    const restaurantObjectId = new Types.ObjectId(restaurantId);
    const pipeline = [
      { $match: { restaurantId: restaurantObjectId, createdAt: { $gte: range.start, $lte: range.end }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          aov: { $avg: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    const results = await this.orderModel.aggregate(pipeline as PipelineStage[]);
    const data = results.map((r: any) => ({ label: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`, revenue: r.revenue, orders: r.orders, aov: r.aov }));
    cache.set(key, data);
    return data;
  }

  clearCache(prefix?: string, restaurantId?: string) {
    if (!prefix && !restaurantId) {
      cache.flushAll();
      return { cleared: 'all' };
    }
    const keys = cache.keys().filter(k => (!prefix || k.startsWith(prefix)) && (!restaurantId || k.includes(`:${restaurantId}:`)));
    keys.forEach(k => cache.del(k));
    return { cleared: keys.length };
  }

  private pctChange(prev: number, current: number) {
    if (prev === 0) return current === 0 ? 0 : 100;
    return Number((((current - prev) / prev) * 100).toFixed(2));
  }
}
