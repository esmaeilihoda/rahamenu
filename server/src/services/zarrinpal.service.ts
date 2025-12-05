import axios from 'axios';
import {
  ZarrinpalRequestPayload,
  ZarrinpalRequestResponse,
  ZarrinpalVerifyPayload,
  ZarrinpalVerifyResponse,
  ZarrinpalStatusCode,
} from '../types/zarrinpal.types';

class ZarrinpalService {
  private merchantId: string;
  private baseURL: string;
  private sandboxMode: boolean;

  constructor() {
    this.merchantId = process.env.ZARRINPAL_MERCHANT_ID as string;
    this.sandboxMode = process.env.NODE_ENV !== 'production';
    this.baseURL = this.sandboxMode
      ? 'https://sandbox.zarinpal.com/pg/v4/payment'
      : 'https://api.zarinpal.com/pg/v4/payment';

    if (!this.merchantId) {
      throw new Error('ZARRINPAL_MERCHANT_ID is required in environment variables');
    }
  }

  async requestPayment(
    amount: number,
    description: string,
    callbackUrl: string,
    orderId: string,
    mobile?: string
  ): Promise<{ authority: string; gatewayUrl: string }> {
    const payload: ZarrinpalRequestPayload = {
      merchant_id: this.merchantId,
      amount: Math.round(amount),
      description,
      callback_url: callbackUrl,
      metadata: { order_id: orderId, mobile },
    };

    const response = await axios.post<ZarrinpalRequestResponse>(
      `${this.baseURL}/request.json`,
      payload,
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );

    if (response.data.errors) {
      throw new Error(
        `Zarrinpal Error: ${response.data.errors.message} (Code: ${response.data.errors.code})`
      );
    }

    const authority = response.data.data?.authority;
    if (!authority) throw new Error('No authority code received from Zarrinpal');

    const gatewayUrl = this.sandboxMode
      ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
      : `https://www.zarinpal.com/pg/StartPay/${authority}`;

    return { authority, gatewayUrl };
  }

  async verifyPayment(authority: string, amount: number): Promise<{
    verified: boolean;
    refId: number | null;
    cardPan: string | null;
    message: string;
  }> {
    const payload: ZarrinpalVerifyPayload = {
      merchant_id: this.merchantId,
      amount: Math.round(amount),
      authority,
    };

    const response = await axios.post<ZarrinpalVerifyResponse>(
      `${this.baseURL}/verify.json`,
      payload,
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );

    if (response.data.errors) {
      return {
        verified: false,
        refId: null,
        cardPan: null,
        message: response.data.errors.message,
      };
    }

    const { code, ref_id, card_pan, message } = response.data.data!;

    if (code === ZarrinpalStatusCode.SUCCESS || code === ZarrinpalStatusCode.ALREADY_VERIFIED) {
      return { verified: true, refId: ref_id, cardPan: card_pan, message };
    }

    return { verified: false, refId: null, cardPan: null, message: message || 'Verification failed' };
  }

  isValidAmount(amount: number): boolean {
    return amount >= 1000;
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  }
}

export const zarrinpalService = new ZarrinpalService();