import { useState } from 'react';
import { ordersAPI, Order, OrderStatus } from '@/lib/api/orders.api';
import { useToast } from '@/hooks/use-toast';

export const useOrderMutations = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  /**
   * Get Persian status label
   */
  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      pending: 'در انتظار',
      confirmed: 'تایید شده',
      preparing: 'در حال آماده‌سازی',
      ready: 'آماده',
      served: 'سرو شده',
      cancelled: 'لغو شده',
    };
    return labels[status] || status;
  };

  /**
   * Update order status with optimistic UI
   */
  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    onSuccess?: (order: Order) => void
  ): Promise<Order | null> => {
    setIsUpdating(true);
    
    try {
      const updatedOrder = await ordersAPI.updateOrderStatus(orderId, newStatus);
      
      toast({
        title: 'وضعیت به‌روزرسانی شد',
        description: `وضعیت سفارش تغییر یافت به ${getStatusLabel(newStatus)}`,
      });

      if (onSuccess) {
        onSuccess(updatedOrder);
      }

      return updatedOrder;
    } catch (error: any) {
      toast({
        title: 'به‌روزرسانی ناموفق',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Cancel order with reason
   */
  const cancelOrder = async (
    orderId: string,
    reason: string,
    onSuccess?: () => void
  ): Promise<boolean> => {
    setIsUpdating(true);

    try {
      await ordersAPI.cancelOrder(orderId, reason);
      
      toast({
        title: 'سفارش لغو شد',
        description: 'سفارش با موفقیت لغو شد',
      });

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error: any) {
      toast({
        title: 'لغو ناموفق',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Batch update multiple orders (e.g., confirm all pending)
   */
  const batchUpdateStatus = async (
    orderIds: string[],
    newStatus: OrderStatus,
    onSuccess?: () => void
  ): Promise<void> => {
    setIsUpdating(true);

    try {
      // Execute all updates in parallel
      const promises = orderIds.map((id) => ordersAPI.updateOrderStatus(id, newStatus));
      await Promise.all(promises);

      toast({
        title: 'به‌روزرسانی دسته‌ای تکمیل شد',
        description: `${orderIds.length} سفارش به‌روزرسانی شد به ${getStatusLabel(newStatus)}`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'به‌روزرسانی دسته‌ای ناموفق',
        description: 'برخی سفارشات به‌روزرسانی نشدند',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Get next status in the workflow
   */
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const workflow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: null,
      cancelled: null,
    };

    return workflow[currentStatus];
  };

  /**
   * Advance order to next status
   */
  const advanceOrderStatus = async (
    orderId: string,
    currentStatus: OrderStatus,
    onSuccess?: (order: Order) => void
  ): Promise<Order | null> => {
    const nextStatus = getNextStatus(currentStatus);
    
    if (!nextStatus) {
      toast({
        title: 'عملیات نامعتبر',
        description: 'نمی‌توان سفارش را از این وضعیت جلو برد',
        variant: 'destructive',
      });
      return null;
    }

    return updateOrderStatus(orderId, nextStatus, onSuccess);
  };

  return {
    updateOrderStatus,
    cancelOrder,
    batchUpdateStatus,
    advanceOrderStatus,
    getNextStatus,
    isUpdating,
  };
};
