import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';
import { Restaurant } from '../models/Restaurant.model';
import mongoose from 'mongoose';

const tenantService = new TenantService();

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurantId = await tenantService.resolveRestaurantId(req);
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    // Double-check restaurantId is a valid ObjectId before querying
    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant || !restaurant.isActive) {
      return res.status(403).json({ error: 'Restaurant not found or suspended' });
    }

    (req as any).restaurantId = restaurantId;
    (req as any).restaurant = restaurant;
    return next();
  } catch (err) {
    return next(err);
  }
};
