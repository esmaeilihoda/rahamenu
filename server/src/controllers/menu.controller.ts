import { Response } from 'express';
import { z } from 'zod';
import { MenuItem } from '../models/MenuItem.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { getSocketService } from '../services/websocket.service';
import { Types } from 'mongoose';
import { Restaurant } from '../models/Restaurant.model';

// Validation schemas
export const createMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    price: z.number().min(0),
    category: z.enum(['coffee', 'tea', 'pastry', 'cold', 'dessert', 'food']),
    vibes: z.array(z.enum(['energy', 'relaxing', 'cold', 'hungry'])).optional(),
    image: z.string().url(),
    pairing: z.string().max(100).optional(),
    pairings: z.array(z.string()).optional(),
    addOns: z.array(z.object({
      name: z.string().min(1),
      price: z.number().min(0),
      emoji: z.string(),
      category: z.enum(['milk', 'flavor', 'topping', 'syrup']),
    })).optional(),
  }),
});

export const updateMenuItemSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(500).optional(),
    price: z.number().min(0).optional(),
    category: z.enum(['coffee', 'tea', 'pastry', 'cold', 'dessert', 'food']).optional(),
    vibes: z.array(z.enum(['energy', 'relaxing', 'cold', 'hungry'])).optional(),
    image: z.string().url().optional(),
    available: z.boolean().optional(),
    pairing: z.string().max(100).optional(),
    pairings: z.array(z.string()).optional(),
    addOns: z.array(z.object({
      name: z.string().min(1),
      price: z.number().min(0),
      emoji: z.string(),
      category: z.enum(['milk', 'flavor', 'topping', 'syrup']),
    })).optional(),
  }),
});

// Get all menu items for a restaurant
export const getMenuItems = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  let restaurantId = (req as any).restaurantId as string;
  const { category, available, vibe } = req.query;

  // If restaurantId is not a valid ObjectId (e.g., it's a slug), look it up
  if (!Types.ObjectId.isValid(restaurantId)) {
    const restaurant = await Restaurant.findOne({ slug: restaurantId, isActive: true });
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    restaurantId = restaurant._id.toString();
  }

  const query: any = { restaurantId };

  if (category) {
    query.category = category;
  }

  if (available !== undefined) {
    query.available = available === 'true';
  }

  if (vibe) {
    query.vibes = vibe;
  }

  const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

  res.json({
    success: true,
    data: menuItems,
  });
});

// Get single menu item
export const getMenuItem = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  let restaurantId = (req as any).restaurantId as string;

  // If restaurantId is not a valid ObjectId, look it up
  if (!Types.ObjectId.isValid(restaurantId)) {
    const restaurant = await Restaurant.findOne({ slug: restaurantId, isActive: true });
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    restaurantId = restaurant._id.toString();
  }

  const menuItem = await MenuItem.findOne({ _id: id, restaurantId });

  if (!menuItem) {
    throw new AppError(404, 'Menu item not found');
  }

  res.json({
    success: true,
    data: menuItem,
  });
});

// Create menu item (manager/admin only)
export const createMenuItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const restaurantId = (req as any).restaurantId as string;
  const menuItem = await MenuItem.create({ ...req.body, restaurantId });

  res.status(201).json({
    success: true,
    data: menuItem,
  });
});

// Update menu item (manager/admin only)
export const updateMenuItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = (req as any).restaurantId as string;

  const menuItem = await MenuItem.findOneAndUpdate(
    { _id: id, restaurantId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!menuItem) {
    throw new AppError(404, 'Menu item not found');
  }

  // Emit socket event if availability changed
  if ('available' in req.body) {
    const socketService = getSocketService();
    socketService.emitToRestaurant(menuItem.restaurantId.toString(), 'menu:updated', {
      itemId: menuItem._id,
      available: menuItem.available,
    });
  }

  res.json({
    success: true,
    data: menuItem,
  });
});

// Toggle menu item availability (86'd items)
export const toggleAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = (req as any).restaurantId as string;

  const menuItem = await MenuItem.findOne({ _id: id, restaurantId });

  if (!menuItem) {
    throw new AppError(404, 'Menu item not found');
  }

  menuItem.available = !menuItem.available;
  await menuItem.save();

  // Emit socket event
  const socketService = getSocketService();
  socketService.emitToRestaurant(menuItem.restaurantId.toString(), 'menu:availability', {
    itemId: menuItem._id,
    name: menuItem.name,
    available: menuItem.available,
  });

  res.json({
    success: true,
    data: menuItem,
    message: `${menuItem.name} is now ${menuItem.available ? 'available' : 'unavailable'}`,
  });
});

// Delete menu item (admin only)
export const deleteMenuItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = (req as any).restaurantId as string;

  const menuItem = await MenuItem.findOneAndDelete({ _id: id, restaurantId });

  if (!menuItem) {
    throw new AppError(404, 'Menu item not found');
  }

  res.json({
    success: true,
    message: 'Menu item deleted successfully',
  });
});
