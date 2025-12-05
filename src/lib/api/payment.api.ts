import apiClient from '@/lib/api';

export interface PaymentRequestResponse {
  gatewayUrl: string;
  authority: string;
}

export const paymentAPI = {
  async requestPayment(orderId: string): Promise<PaymentRequestResponse> {
    const { data } = await apiClient.post('/payment/request', { orderId });
    return data.data;
  },

  async markPayAtCounter(orderId: string): Promise<void> {
    await apiClient.post('/payment/counter', { orderId });
  },

  async confirmCounterPayment(orderId: string): Promise<void> {
    await apiClient.patch(`/payment/${orderId}/confirm-counter`);
  },

  async checkPaymentStatus(orderId: string) {
    const { data } = await apiClient.get(`/orders/${orderId}`);
    return data.data;
  },
};
