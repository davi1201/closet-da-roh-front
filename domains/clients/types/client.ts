export type PurchasingPower = 'low' | 'medium' | 'high';

export interface ClientDesiredProduct {
  _id?: string;
  photoUrl: string;
  description?: string;
  additionDate?: Date;
}

export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface Client {
  products_url: string;
  _id: string;
  name: string;
  phoneNumber: string;
  address?: ClientAddress;
  instagram?: string;
  profession?: string;
  purchasingPower?: PurchasingPower;
  observations?: string;
  desiredProducts: ClientDesiredProduct[];
  createdAt?: Date;
  updatedAt?: Date;
  is_active?: boolean;
}
