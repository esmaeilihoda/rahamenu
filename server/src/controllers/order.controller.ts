import { Response } from 'express';
import { z } from 'zod';
import { Order } from '../models/Order.model';
import { MenuItem } from '../models/MenuItem.model';
import { Table } from '../models/Table.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { getSocketService } from '../services/websocket.service';

// Validation schemas
export const createOrderSchema = z.object({
  body: z.object({
    tableNumber: z.number().min(1),
    items: z.array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().min(1),
        customizations: z.object({
          milk: z.string().optional(),
          sweetness: z.number().min(0).max(100).optional(),
          addOns: z.array(z.string()).optional(),
        }).optional(),
      })
    ).min(1),
    customerNotes: z.string().max(500).optional(),
    selectedVibe: z.enum(['energy', 'relaxing', 'cold', 'hungry']).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']),
  }),
});

// Create new order
export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tableNumber, items, customerNotes, selectedVibe } = req.body;
  const restaurantId = (req as any).restaurantId as string;

  // Validate menu items and calculate prices
  const orderItems = await Promise.all(
    items.map(async (item: any) => {
      const menuItem = await MenuItem.findOne({ _id: item.menuItemId, restaurantId });
      
      if (!menuItem) {
        throw new AppError(404, `Menu item ${item.menuItemId} not found`);
      }
      
      if (!menuItem.available) {
        throw new AppError(400, `${menuItem.name} is currently unavailable`);
      }

      return {
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        customizations: item.customizations || {},
        price: menuItem.price * item.quantity,
      };
    })
  );

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);

  // Create order
  const order = await Order.create({
    restaurantId,
    tableNumber,
    items: orderItems,
    totalAmount,
    customerNotes,
    selectedVibe,
    status: 'pending',
  });

  // Update table status
  await Table.findOneAndUpdate(
    { restaurantId, tableNumber },
    { 
      status: 'ordered',
      currentOrderId: order._id,
    },
    { upsert: true }
  );

  // Emit socket event for real-time update
  const socketService = getSocketService();
  socketService.emitToRestaurant(restaurantId, 'order:created', {
    order: order.toJSON(),
    tableNumber,
  });

  res.status(201).json({
    success: true,
    data: order,
  });
});

// Get all orders for a restaurant (manager only)
export const getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const restaurantId = (req as any).restaurantId as string;
  const { status, tableNumber, limit = '50', skip = '0' } = req.query;

  const query: any = { restaurantId };
  
  if (status) {
    query.status = status;
  }
  
  if (tableNumber) {
    query.tableNumber = Number(tableNumber);
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip(Number(skip))
    .populate('items.menuItemId', 'name image');

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    data: orders,
    pagination: {
      total,
      limit: Number(limit),
      skip: Number(skip),
      hasMore: Number(skip) + orders.length < total,
    },
  });
});

// Update order status
export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = (req as any).restaurantId as string;
  const { status } = req.body;

  const order = await Order.findOne({ _id: id, restaurantId });

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  order.status = status;
  await order.save();

  // Update table status if order is served or cancelled
  if (status === 'served' || status === 'cancelled') {
    await Table.findOneAndUpdate(
      { restaurantId: order.restaurantId, tableNumber: order.tableNumber },
      { 
        status: 'empty',
        currentOrderId: undefined,
      }
    );
  }

  // Emit socket event
  const socketService = getSocketService();
  socketService.emitToRestaurant(order.restaurantId.toString(), 'order:updated', {
    order: order.toJSON(),
    tableNumber: order.tableNumber,
  });

  res.json({
    success: true,
    data: order,
  });
});

// Get orders for specific table
export const getTableOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tableId } = req.params;
  const restaurantId = (req as any).restaurantId as string;
  
  const table = await Table.findOne({ _id: tableId, restaurantId });
  
  if (!table) {
    throw new AppError(404, 'Table not found');
  }

  const orders = await Order.find({
    restaurantId: table.restaurantId,
    tableNumber: table.tableNumber,
  })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: orders,
  });
});

// Cancel order
export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = (req as any).restaurantId as string;

  const order = await Order.findOne({ _id: id, restaurantId });

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  if (order.status === 'served') {
    throw new AppError(400, 'Cannot cancel a served order');
  }

  order.status = 'cancelled';
  await order.save();

  // Update table status
  await Table.findOneAndUpdate(
    { restaurantId: order.restaurantId, tableNumber: order.tableNumber },
    { 
      status: 'empty',
      currentOrderId: undefined,
    }
  );

  // Emit socket event
  const socketService = getSocketService();
  socketService.emitToRestaurant(order.restaurantId.toString(), 'order:cancelled', {
    orderId: order._id,
    tableNumber: order.tableNumber,
  });

  res.json({
    success: true,
    message: 'Order cancelled successfully',
  });
});
