import { Supplier } from '@/domains/suppliers/types/supplier';

export interface ProductImage {
  key: string;
  url: string;
  _id: string;
}

export interface ProductData {
  id?: string;
  name: string;
  description: string;
  size: string | null;
  color: string | null;
  category: string | null;
  buy_price: string;
  sale_price: string;
  supplier_id: string | null;
}

export interface ProductResponse extends ProductData {
  _id: string;
  supplier: Supplier;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  image_urls?: string[];
}
