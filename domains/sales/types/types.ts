import { Client } from '@/domains/clients/types/client';

export interface SaleItemPayload {
  variant_id: string;
  quantity: number;
}

export interface SalePayload {
  customer_id: string | null;
  due_date?: Date;
  sold_by: string;
  items: SaleItemPayload[];
  payment_details?: {
    method: string;
    installments: number;
  };
}

export interface SaleItemResponse {
  _id: number;
  fulfillment_status: string;
  variant: string;
  sku_at_sale: string;
  quantity: number;
  unit_sale_price: number;
  subtotal: number;
}

export interface Payments {
  method: string;
  amount: number;
  installments: number;
  interest_rate_percentage: number;
}

export interface SaleResponse {
  discount_amount: any;
  fulfillment_status: string;
  payment_status: string;
  payments: Payments[];
  _id: string;
  client: Client;
  sold_by: string;
  items: SaleItemResponse[];
  due_date?: string;
  subtotal_amount: number;
  payment_details: {
    method: string;
    installments: number;
    interest_rate_percentage: number;
    discount_amount: number;
    amount_paid: number;
  };
  total_amount: number;
  status: 'completed' | 'pending' | 'canceled';
  createdAt: string;
}

export interface PaymentCondition {
  installments: number;
  value: number;
  total_value: number;
  description: string;
  interest_rate: number;
}
