import { Response } from 'express';
import { z } from 'zod';
import { Table } from '../models/Table.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { getSocketService } from '../services/websocket.service';
import crypto from 'crypto';

// Validation schemas
export const createTableSchema = z.object({
  body: z.object({
    tableNumber: z.number().min(1),
    capacity: z.number().min(1).optional(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }).optional(),
    guests: z.number().min(0).max(20).optional(),
  }),
});

export const updateTableStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['empty', 'browsing', 'ordered', 'alert']),
    guests: z.number().min(0).max(20).optional(),
  }),
});

// Get all tables for a restaurant
export const getTables = asyncHandler(async (req: AuthRequest, res: Response) => {
  const restaurantId = (req as any).restaurantId as string;
  const { status } = req.query;

  const query: any = { restaurantId };

  if (status) {
    query.status = status;
  }

  const tables = await Table.find(query)
    .sort({ tableNumber: 1 })
    .populate('currentOrderId', 'items totalAmount status');

  res.json({
    success: true,
    data: tables,
  });
});

// Get single table
export const getTable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = (req as any).restaurantId as string;

  const table = await Table.findOne({ _id: id, restaurantId }).populate('currentOrderId');

  if (!table) {
    throw new AppError(404, 'Table not found');
  }

  res.json({
    success: true,
    data: table,
  });
});

// Create table
export const createTable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tableNumber, capacity, position, guests } = req.body;
  const restaurantId = (req as any).restaurantId as string;

  // Check if table already exists
  const existingTable = await Table.findOne({ restaurantId, tableNumber });

  if (existingTable) {
    throw new AppError(409, `Table ${tableNumber} already exists`);
  }

  // Generate unique QR code
  const qrCode = crypto.randomBytes(16).toString('hex');

  const table = await Table.create({
    restaurantId,
    tableNumber,
    capacity,
    position,
    guests,
    qrCode,
    status: 'empty',
  });

  res.status(201).json({
    success: true,
    data: table,
  });
});

// Update table status
export const updateTableStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, guests } = req.body;
  const restaurantId = (req as any).restaurantId as string;

  const table = await Table.findOneAndUpdate(
    { _id: id, restaurantId },
    { status, guests, lastActivity: new Date() },
    { new: true, runValidators: true }
  );

  if (!table) {
    throw new AppError(404, 'Table not found');
  }

  // Emit socket event
  const socketService = getSocketService();
  socketService.emitToRestaurant(table.restaurantId.toString(), 'table:updated', {
    table: table.toJSON(),
  });

  res.json({
    success: true,
    data: table,
  });
});

// Generate/regenerate QR code for table
export const generateQRCode = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = (req as any).restaurantId as string;

  const table = await Table.findOne({ _id: id, restaurantId });

  if (!table) {
    throw new AppError(404, 'Table not found');
  }

  // Generate new QR code
  table.qrCode = crypto.randomBytes(16).toString('hex');
  await table.save();

  res.json({
    success: true,
    data: {
      tableNumber: table.tableNumber,
      qrCode: table.qrCode,
      url: `${process.env.CLIENT_URL}/customer?table=${table.tableNumber}&qr=${table.qrCode}`,
    },
  });
});

// Update table details (capacity, position, etc.)
export const updateTable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = (req as any).restaurantId as string;
  const { tableNumber, capacity, position } = req.body;

  const table = await Table.findOne({ _id: id, restaurantId });

  if (!table) {
    throw new AppError(404, 'Table not found');
  }

  // Check if tableNumber is being changed and validate uniqueness
  if (tableNumber && tableNumber !== table.tableNumber) {
    const existing = await Table.findOne({
      restaurantId,
      tableNumber,
      _id: { $ne: id }
    });
    if (existing) {
      throw new AppError(400, 'Table number already exists');
    }
    table.tableNumber = tableNumber;
  }

  if (capacity) {
    table.capacity = capacity;
  }

  if (position) {
    table.position = position;
  }

  await table.save();

  res.json({
    success: true,
    message: 'Table updated successfully',
    data: table,
  });
});

// Delete table
export const deleteTable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = (req as any).restaurantId as string;

  const table = await Table.findOne({ _id: id, restaurantId });

  if (!table) {
    throw new AppError(404, 'Table not found');
  }

  if (table.status !== 'empty') {
    throw new AppError(400, 'Cannot delete a table that is in use');
  }

  await table.deleteOne();

  res.json({
    success: true,
    message: 'Table deleted successfully',
  });
});

// Call waiter (digital bell)
export const callWaiter = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { action } = req.body;
  const restaurantId = (req as any).restaurantId as string;

  // Map action to alert type and message
  const alertMessages: Record<string, string> = {
    waiter: 'needs waiter',
    water: 'needs water',
    bill: 'requests bill',
  };

  const table = await Table.findOneAndUpdate(
    { _id: id, restaurantId },
    { 
      status: 'alert', 
      lastActivity: new Date(),
      alertType: action || 'waiter',
    },
    { new: true }
  );

  if (!table) {
    throw new AppError(404, 'Table not found');
  }

  // Emit socket event with detailed information
  const socketService = getSocketService();
  socketService.emitToRestaurant(table.restaurantId.toString(), 'table:alert', {
    tableNumber: table.tableNumber,
    alertType: action || 'waiter',
    message: `Table ${table.tableNumber} ${alertMessages[action] || 'needs assistance'}`,
    table: table.toJSON(),
  });

  res.json({
    success: true,
    message: 'Waiter notified successfully',
  });
});
