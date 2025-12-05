import { Response, Request } from 'express';
import { zarrinpalService } from '../services/zarrinpal.service';
import { Order } from '../models/Order.model';
import { getSocketService } from '../services/websocket.service';

export const requestPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body as { orderId: string };
    const restaurantId = (req as any).restaurantId as string;

    const order = await Order.findOne({ _id: orderId, restaurantId });
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_PAID', message: 'Order already paid' } });
    }

    if (!zarrinpalService.isValidAmount(order.totalAmount)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_AMOUNT', message: 'Minimum payment is 1000 Rials' } });
    }

    const callbackUrl = `${process.env.CLIENT_URL}/payment/verify?orderId=${orderId}`;
    const { authority, gatewayUrl } = await zarrinpalService.requestPayment(
      order.totalAmount,
      `سفارش #${order._id.toString().slice(-6)} - ${order.items.length} مورد`,
      callbackUrl,
      orderId
    );

    order.payment = { method: 'zarrinpal', authority, status: 'pending' };
    await order.save();

    return res.json({ success: true, data: { gatewayUrl, authority } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'PAYMENT_REQUEST_FAILED', message: error.message } });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { Authority, Status } = req.method === 'GET' ? req.query : (req.body as any);
    const { orderId } = req.query as any;

    if (!Authority || !orderId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'Authority or orderId missing' } });
    }

    const order = await Order.findById(orderId as string);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    if (Status !== 'OK') {
      order.payment = { ...(order.payment || {}), status: 'cancelled' };
      await order.save();
      return res.status(400).json({ success: false, error: { code: 'PAYMENT_CANCELLED', message: 'Payment was cancelled by user' } });
    }

    const verification = await zarrinpalService.verifyPayment(String(Authority), order.totalAmount);
    if (verification.verified) {
      order.paymentStatus = 'paid';
      order.payment = {
        ...(order.payment || {}),
        status: 'verified',
        refId: verification.refId!,
        cardPan: verification.cardPan!,
        verifiedAt: new Date(),
      };
      await order.save();

      const socketService = getSocketService();
      socketService.emitToRestaurant(order.restaurantId.toString(), 'order:payment-confirmed', {
        orderId: order._id,
        refId: verification.refId,
      });

      return res.json({ success: true, data: { verified: true, refId: verification.refId, message: 'Payment successful', order } });
    } else {
      order.payment = { ...(order.payment || {}), status: 'failed' };
      await order.save();
      return res.status(400).json({ success: false, error: { code: 'VERIFICATION_FAILED', message: verification.message } });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'VERIFICATION_ERROR', message: error.message } });
  }
};

export const markPayAtCounter = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body as { orderId: string };
    const restaurantId = (req as any).restaurantId as string;
    const order = await Order.findOne({ _id: orderId, restaurantId });
    if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });

    order.paymentStatus = 'pending_payment';
    order.payment = { method: 'counter', status: 'pending' };
    await order.save();

    const socketService = getSocketService();
    socketService.emitToRestaurant(restaurantId, 'order:created', order);

    return res.json({ success: true, data: { order } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const confirmCounterPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params as any;
    const restaurantId = (req as any).restaurantId as string;
    const order = await Order.findOne({ _id: orderId, restaurantId });
    if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    if (order.payment?.method !== 'counter') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_METHOD', message: 'Not a counter payment' } });
    }

    order.paymentStatus = 'paid';
    order.payment = { ...(order.payment || {}), status: 'confirmed', verifiedAt: new Date(), verifiedBy: (req as any).userId };
    await order.save();

    const socketService = getSocketService();
    socketService.emitToRestaurant(restaurantId, 'order:payment-confirmed', { orderId: order._id });

    return res.json({ success: true, data: { order } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};