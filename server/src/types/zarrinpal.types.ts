export interface ZarrinpalRequestPayload {
  merchant_id: string;
  amount: number;
  description: string;
  callback_url: string;
  metadata?: {
    mobile?: string;
    email?: string;
    order_id?: string;
  };
}

export interface ZarrinpalRequestResponse {
  data?: {
    code: number;
    message: string;
    authority: string;
    fee_type: string;
    fee: number;
  };
  errors?: {
    code: number;
    message: string;
    validations?: any[];
  };
}

export interface ZarrinpalVerifyPayload {
  merchant_id: string;
  amount: number;
  authority: string;
}

export interface ZarrinpalVerifyResponse {
  data?: {
    code: number;
    message: string;
    card_hash: string;
    card_pan: string;
    ref_id: number;
    fee_type: string;
    fee: number;
  };
  errors?: {
    code: number;
    message: string;
    validations?: any[];
  };
}

export enum ZarrinpalStatusCode {
  SUCCESS = 100,
  ALREADY_VERIFIED = 101,
  INVALID_MERCHANT = -9,
  INVALID_IP = -11,
  INVALID_AMOUNT = -12,
  INVALID_AUTHORITY = -33,
  TRANSACTION_FAILED = -54,
}