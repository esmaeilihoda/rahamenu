import { useEffect, useState, useCallback } from 'react';
import { ordersAPI, Order, OrderStatus } from '@/lib/api/orders.api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useSearchParams } from 'react-router-dom';

export interface KitchenFilters {
  station?: 'hot' | 'cold' | 'bar' | 'all';
  category?: 'food' | 'drinks' | 'all';
}

export const useKitchenOrders = () => {
  const { restaurantId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const station = (searchParams.get('station') as KitchenFilters['station']) || 'all';

  const { subscribe, unsubscribe } = useSocket();

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const data = await ordersAPI.getOrders(restaurantId, { status: 'confirmed' });
      // Kitchen focuses on confirmed + preparing + ready
      const kitchenOrders = data.filter((o) => ['confirmed', 'preparing', 'ready'].includes(o.status));
      setOrders(kitchenOrders);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const onCreated = (order: Order) => {
      if (order.status === 'confirmed') {
        setOrders((prev) => [order, ...prev]);
      }
    };
    const onUpdated = (updated: Order) => {
      setOrders((prev) => {
        const exists = prev.some((o) => o._id === updated._id);
        const relevant = ['confirmed', 'preparing', 'ready'].includes(updated.status);
        if (!exists && relevant) return [updated, ...prev];
        if (exists && relevant) return prev.map((o) => (o._id === updated._id ? updated : o));
        if (exists && !relevant) return prev.filter((o) => o._id !== updated._id);
        return prev;
      });
    };

    subscribe('order:created', onCreated);
    subscribe('order:updated', onUpdated);

    return () => {
      unsubscribe('order:created');
      unsubscribe('order:updated');
    };
  }, [subscribe, unsubscribe]);

  const advanceStatus = async (orderId: string, status: OrderStatus) => {
    const nextMap: Record<OrderStatus, OrderStatus | null> = {
      pending: null,
      confirmed: 'preparing',
      preparing: 'ready',
      ready: null,
      served: null,
      cancelled: null,
    };
    const next = nextMap[status];
    if (!next) return;
    const updated = await ordersAPI.updateOrderStatus(orderId, next);
    setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
  };

  const filteredByStation = orders.filter((o) => {
    if (station === 'all') return true;
    // naive filter by item category/notes containing station keyword
    const itemsText = o.items.map((i) => `${i.name} ${i.customizations?.join(' ') || ''}`).join(' ');
    return itemsText.toLowerCase().includes(station);
  });

  const columns = {
    new: filteredByStation.filter((o) => o.status === 'confirmed'),
    progress: filteredByStation.filter((o) => o.status === 'preparing'),
    ready: filteredByStation.filter((o) => o.status === 'ready'),
  };

  return { orders: filteredByStation, columns, isLoading, advanceStatus };
};
