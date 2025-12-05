import { Request } from 'express';
import { Restaurant } from '../models/Restaurant.model';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export class TenantService {
  async resolveRestaurantId(req: Request): Promise<string | null> {
    // 1. Header: accept either ObjectId or slug
    const headerVal = req.header('X-Restaurant-Id');
    if (headerVal) {
      console.log('[TenantService] Header X-Restaurant-Id:', headerVal);
      // Try ObjectId only if valid to avoid CastError
      if (mongoose.isValidObjectId(headerVal)) {
        console.log('[TenantService] Valid ObjectId, querying by ID');
        const byId = await Restaurant.findById(headerVal).select('_id');
        if (byId) {
          console.log('[TenantService] Found by ID:', byId._id.toString());
          return byId._id.toString();
        }
      } else {
        console.log('[TenantService] Not a valid ObjectId, querying by slug');
      }
      // Fallback to slug when not a valid ObjectId
      const bySlug = await Restaurant.findOne({ slug: headerVal, isActive: true }).select('_id');
      if (bySlug) {
        console.log('[TenantService] Found by slug:', bySlug._id.toString());
        return bySlug._id.toString();
      }
      console.log('[TenantService] Restaurant not found for:', headerVal);
    }

    // 2. Subdomain (basic parse)
    const host = req.headers.host || '';
    const [subdomain] = host.split('.');
    if (subdomain && subdomain !== 'localhost') {
      const bySlug = await Restaurant.findOne({ slug: subdomain, isActive: true }).select('_id');
      if (bySlug) return bySlug._id.toString();
    }

    // 3. JWT token
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.substring('Bearer '.length);
      try {
        const decoded: any = jwt.decode(token);
        if (decoded?.restaurantId) return decoded.restaurantId;
      } catch {}
    }

    // 4. Path slug /:restaurantSlug/*
    const slug = (req.params as any).restaurantSlug;
    if (slug) {
      const bySlug = await Restaurant.findOne({ slug, isActive: true }).select('_id');
      if (bySlug) return bySlug._id.toString();
    }

    return null;
  }
}
