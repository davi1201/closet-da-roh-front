import { ReactNode } from 'react';
import { create } from 'zustand';

interface ModalState {
  isCartModalOpen: boolean;
  content: ReactNode | null;
  openCartModal: (content: ReactNode) => void;
  closeCartModal: () => void;
}

export const useCartModalStore = create<ModalState>((set) => ({
  isCartModalOpen: false,
  content: null,

  openCartModal: (content) => set({ isCartModalOpen: true, content: content }),

  closeCartModal: () => set({ isCartModalOpen: false, content: null }),
}));
