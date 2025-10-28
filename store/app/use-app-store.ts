import { create } from 'zustand';

interface AppState {
  mode: 'admin' | 'sale';
}

interface AppActions {
  toggleMode: () => void;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  mode: 'admin',

  toggleMode: () =>
    set((state) => ({
      mode: state.mode === 'admin' ? 'sale' : 'admin',
    })),
}));
