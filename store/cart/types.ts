export type CartItem = {
  productId: any;
  variantId: string;

  sku: string;
  name: string;
  unit_sale_price: number;
  quantity: number;

  size: string;
  color: string;
};

export type CartPaymentDetails = {
  method: string;
  installments: number;
  interest_rate_percentage: number;
  discount_amount: number;
};

export interface CartState {
  items: CartItem[];

  subtotal_amount: number;
  total_amount: number;

  customer: string | null;
  paymentDetails: CartPaymentDetails;

  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, newQuantity: number) => void;
  setCustomer: (customerId: string | null) => void;
  setPaymentDetails: (details: Partial<CartPaymentDetails>) => void;
  clearCart: () => void;
}

export interface TransactionData {
  items: CartItem[];
  subtotal_amount: number;
  total_amount: number;
  customer: string | null;
  paymentDetails: CartPaymentDetails;
}

export interface MultiCartState {
  saleFinalizedCount: number;
  carts: Record<string, TransactionData>;
  activeCartId: string | null;

  createNewCart: (customerId: string) => void;
  switchCart: (customerId: string) => void;
  removeCart: (customerId: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, newQuantity: number) => void;
  setCustomer: (customerId: string | null) => void;
  setPaymentDetails: (details: Partial<CartPaymentDetails>) => void;
  clearCart: () => void;
}
