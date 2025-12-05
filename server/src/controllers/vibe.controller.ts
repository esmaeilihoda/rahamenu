import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Vibe } from '../models/Vibe.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { Types } from 'mongoose';

export const listVibes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const restaurantId = (req as any).restaurantId as string;
  const vibes = await Vibe.find({ restaurantId: new Types.ObjectId(restaurantId), active: true }).sort({ label: 1 });
  res.json({ data: vibes });
});

export const createVibe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const restaurantId = (req as any).restaurantId as string;
  const { key, label, emoji } = req.body;
  const vibe = await Vibe.create({ restaurantId: new Types.ObjectId(restaurantId), key, label, emoji, active: true });
  res.status(201).json({ data: vibe });
});

export const updateVibe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const restaurantId = (req as any).restaurantId as string;
  const { id } = req.params;
  const { key, label, emoji, active } = req.body;
  const vibe = await Vibe.findOneAndUpdate({ _id: id, restaurantId: new Types.ObjectId(restaurantId) }, { key, label, emoji, active }, { new: true });
  res.json({ data: vibe });
});

export const deleteVibe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const restaurantId = (req as any).restaurantId as string;
  const { id } = req.params;
  await Vibe.deleteOne({ _id: id, restaurantId: new Types.ObjectId(restaurantId) });
  res.status(204).send();
});
