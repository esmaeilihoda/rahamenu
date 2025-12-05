import apiClient from '@/lib/api';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface OrderItem {
  menuItemId: string;
  name?: string;
  quantity: number;
  price?: number;
  customizations?: {
    milk?: string;
    sweetness?: number;
    addOns?: string[];
  };
  notes?: string;
}

export interface Order {
  _id: string;
  restaurantId: string;
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  customerNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDTO {
  tableNumber: number;
  items: OrderItem[];
  customerNotes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  tableNumber?: number;
  startDate?: string;
  endDate?: string;
}

export const ordersAPI = {
  /**
   * Create a new order from cart
   */
  createOrder: async (orderData: CreateOrderDTO): Promise<Order> => {
    try {
      const { data } = await apiClient.post('/orders', orderData);
      return data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create order';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get orders for a restaurant with optional filters
   */
  getOrders: async (_restaurantId: string, filters?: OrderFilters): Promise<Order[]> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tableNumber) params.append('tableNumber', filters.tableNumber.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const url = `/orders${queryString ? `?${queryString}` : ''}`;
      
      const { data } = await apiClient.get(url);
      return data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch orders';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get a single order by ID
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    try {
      const { data } = await apiClient.get(`/orders/${orderId}`);
      return data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch order';
      throw new Error(errorMessage);
    }
  },

  /**
   * Update order status with validation
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    try {
      const { data } = await apiClient.patch(`/orders/${orderId}/status`, { status });
      return data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update order status';
      throw new Error(errorMessage);
    }
  },

  /**
   * Cancel an order (only if pending or confirmed)
   */
  cancelOrder: async (orderId: string, reason: string): Promise<void> => {
    try {
      await apiClient.delete(`/orders/${orderId}`, {
        data: { reason }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel order';
      throw new Error(errorMessage);
    }
  }
};
