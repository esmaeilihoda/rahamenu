import { useState, useEffect, useCallback } from 'react';
import { ordersAPI, Order, OrderFilters, OrderStatus } from '@/lib/api/orders.api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';

export const useOrders = (filters?: OrderFilters) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { restaurantId } = useAuth();
  const { toast } = useToast();

  // Subscribe to real-time order updates
  const { subscribe, unsubscribe } = useSocket();

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await ordersAPI.getOrders(restaurantId, filters);
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, filters, toast]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Subscribe to real-time order events
  useEffect(() => {
    if (!restaurantId) return;

    // Handle new order created
    const handleOrderCreated = (newOrder: Order) => {
      console.log('🔔 Socket: New order received:', newOrder);
      setOrders((prev) => [newOrder, ...prev]);
      
      // Show notification for new orders
      toast({
        title: '🔔 New Order',
        description: `Table ${newOrder.tableNumber} - $${newOrder.totalAmount.toFixed(2)}`,
        duration: 5000,
      });

      // Optional: Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {
          // Ignore audio errors (user might not have interacted with page yet)
        });
      } catch (err) {
        // Ignore audio errors
      }
    };

    // Handle order status updated
    const handleOrderUpdated = (updatedOrder: Order) => {
      setOrders((prev) =>
        prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
      );
    };

    // Handle order cancelled
    const handleOrderCancelled = (data: { orderId: string }) => {
      setOrders((prev) => prev.filter((order) => order._id !== data.orderId));
      
      toast({
        title: 'Order Cancelled',
        description: 'An order has been cancelled',
      });
    };

    subscribe('order:created', handleOrderCreated);
    subscribe('order:updated', handleOrderUpdated);
    subscribe('order:cancelled', handleOrderCancelled);

    return () => {
      unsubscribe('order:created');
      unsubscribe('order:updated');
      unsubscribe('order:cancelled');
    };
  }, [restaurantId, subscribe, unsubscribe, toast]);

  // Get order counts by status
  const getOrderCounts = useCallback(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      served: orders.filter((o) => o.status === 'served').length,
    };
  }, [orders]);

  // Filter orders by status
  const getOrdersByStatus = useCallback(
    (status?: OrderStatus) => {
      if (!status) return orders;
      return orders.filter((order) => order.status === status);
    },
    [orders]
  );

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
    getOrderCounts,
    getOrdersByStatus,
  };
};
