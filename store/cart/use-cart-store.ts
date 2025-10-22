import { create, StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CartItem, CartPaymentDetails, MultiCartState, TransactionData } from './types';

const initialTransactionData: TransactionData = {
  items: [],
  subtotal_amount: 0,
  total_amount: 0,
  customer: null,
  paymentDetails: {
    method: 'A Vista',
    installments: 1,
    interest_rate_percentage: 0,
    discount_amount: 0,
  },
};

const calculateAllTotals = (items: CartItem[], payment: CartPaymentDetails) => {
  const subtotal_amount = items.reduce(
    (sum, item) => sum + item.unit_sale_price * item.quantity,
    0
  );

  let total_amount = subtotal_amount - payment.discount_amount;

  if (payment.interest_rate_percentage > 0) {
    const interest = total_amount * (payment.interest_rate_percentage / 100);
    total_amount += interest;
  }

  return {
    subtotal_amount: subtotal_amount,
    total_amount: Math.max(0, total_amount),
  };
};

type TransactionUpdater = (cart: TransactionData) => TransactionData;

const updateActiveCart = (state: MultiCartState, updater: TransactionUpdater): MultiCartState => {
  if (!state.activeCartId) return state;

  const activeId = state.activeCartId;
  const activeCart = state.carts[activeId];

  const updatedCart = updater(activeCart);

  return {
    ...state,
    carts: {
      ...state.carts,
      [activeId]: updatedCart,
    },
  };
};

const createCartStore: StateCreator<MultiCartState> = (set, get) => ({
  carts: {},
  activeCartId: null,
  saleFinalizedCount: 0,

  createNewCart: (customerId: string) => {
    const state = get();
    if (state.carts[customerId]) {
      return set({ activeCartId: customerId });
    }

    const newCart: TransactionData = {
      ...initialTransactionData,
      customer: customerId,
    };

    set({
      carts: {
        ...state.carts,
        [customerId]: newCart,
      },
      activeCartId: customerId,
    });
  },

  switchCart: (customerId: string) => {
    if (!get().carts[customerId]) {
      throw new Error(`Carrinho para o cliente ${customerId} não encontrado.`);
    }
    set({ activeCartId: customerId });
  },

  removeCart: (customerId: string) => {
    const state = get();
    const newCarts = { ...state.carts };
    delete newCarts[customerId];

    const newActiveId = state.activeCartId === customerId ? null : state.activeCartId;

    set({
      carts: newCarts,
      activeCartId: newActiveId,
      saleFinalizedCount: state.saleFinalizedCount + 1,
    });
  },

  addToCart: (newItem: CartItem) =>
    set((state) =>
      updateActiveCart(state, (activeCart) => {
        const existingItemIndex = activeCart.items.findIndex(
          (item) => item.variantId === newItem.variantId
        );

        let newItems: CartItem[];

        if (existingItemIndex > -1) {
          newItems = activeCart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        } else {
          newItems = [...activeCart.items, newItem];
        }

        return {
          ...activeCart,
          items: newItems,
          ...calculateAllTotals(newItems, activeCart.paymentDetails),
        };
      })
    ),

  setPaymentDetails: (details: Partial<CartPaymentDetails>) =>
    set((state) =>
      updateActiveCart(state, (activeCart) => {
        const newPaymentDetails = {
          ...activeCart.paymentDetails,
          ...details,
        };

        return {
          ...activeCart,
          paymentDetails: newPaymentDetails,
          ...calculateAllTotals(activeCart.items, newPaymentDetails),
        };
      })
    ),

  setCustomer: (customerId: string | null) =>
    set((state) =>
      updateActiveCart(state, (activeCart) => ({
        ...activeCart,
        customer: customerId,
      }))
    ),

  removeFromCart: (variantId: string) =>
    set((state) => {
      const { activeCartId, carts, removeCart } = get();
      if (!activeCartId || !carts[activeCartId]) return {};

      const activeCart = carts[activeCartId];
      const newItems = activeCart.items.filter((i) => i.variantId !== variantId);

      if (newItems.length === 0) {
        removeCart(activeCartId);

        return {};
      }

      const updatedCart = {
        ...activeCart,
        items: newItems,
        ...calculateAllTotals(newItems, activeCart.paymentDetails),
      };
      return {
        carts: {
          ...state.carts,
          [activeCartId]: updatedCart,
        },
      };
    }),

  updateQuantity: (variantId: string, quantity: number) =>
    set((state) => {
      const { activeCartId, carts, removeCart } = get();
      if (!activeCartId || !carts[activeCartId]) return {};

      const activeCart = carts[activeCartId];
      const clampedQuantity = Math.max(0, quantity);

      const newItems = activeCart.items
        .map((i) => {
          if (i.variantId === variantId) {
            return { ...i, quantity: clampedQuantity };
          }
          return i;
        })
        .filter((i) => i.quantity > 0);

      if (newItems.length === 0) {
        removeCart(activeCartId);
        return {};
      }

      const updatedCart = {
        ...activeCart,
        items: newItems,
        ...calculateAllTotals(newItems, activeCart.paymentDetails),
      };
      return {
        carts: {
          ...state.carts,
          [activeCartId]: updatedCart,
        },
      };
    }),

  clearCart: () =>
    set((state) => {
      const newState = updateActiveCart(state, (activeCart) => ({
        ...activeCart,
        items: [],
        subtotal_amount: 0,
        total_amount: 0,
      }));

      return {
        ...newState,
        saleFinalizedCount: state.saleFinalizedCount + 1,
      };
    }),
});

export const useCartStore = create<MultiCartState>()(
  devtools(
    persist(createCartStore, {
      name: 'multi-cart-storage',
    }),
    { name: 'Multi-Client Cart Store' }
  )
);
