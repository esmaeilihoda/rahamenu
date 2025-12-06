import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Vibe } from '../models/Vibe.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { Types } from 'mongoose';
import { Restaurant } from '../models/Restaurant.model';

export const listVibes = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  let restaurantId = (req as any).restaurantId as string;
  
  // If restaurantId is not a valid ObjectId (e.g., it's a slug like "demo-cafe"),
  // look up the actual restaurant ID
  if (!Types.ObjectId.isValid(restaurantId)) {
    const restaurant = await Restaurant.findOne({ slug: restaurantId, isActive: true });
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    restaurantId = restaurant._id.toString();
  }
  
  const vibes = await Vibe.find({ restaurantId: new Types.ObjectId(restaurantId), active: true }).sort({ label: 1 });
  res.json({ data: vibes });
});

export const createVibe = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
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
  
  const { key, label, emoji } = req.body;
  const vibe = await Vibe.create({ restaurantId: new Types.ObjectId(restaurantId), key, label, emoji, active: true });
  res.status(201).json({ data: vibe });
});

export const updateVibe = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
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
  
  const { id } = req.params;
  const { key, label, emoji, active } = req.body;
  const vibe = await Vibe.findOneAndUpdate({ _id: id, restaurantId: new Types.ObjectId(restaurantId) }, { key, label, emoji, active }, { new: true });
  res.json({ data: vibe });
});

export const deleteVibe = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
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
  
  const { id } = req.params;
  await Vibe.deleteOne({ _id: id, restaurantId: new Types.ObjectId(restaurantId) });
  res.status(204).send();
});
