import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware'; // Para salvar no localStorage

// (Reutilize a interface UserInfo)
interface UserInfo {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

interface AuthState {
  userInfo: UserInfo | null;
  login: (data: UserInfo) => void;
  logout: () => void;
}

// Criando o store com o middleware 'persist'
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Estado inicial
      userInfo: null,

      // Ação de Login
      login: (data) => set({ userInfo: data }),

      // Ação de Logout
      logout: () => set({ userInfo: null }),
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage (ex: 'auth-storage')
      storage: createJSONStorage(() => localStorage), // Usa localStorage
      // (Opcional) Você pode escolher quais partes do estado persistir
      // partialize: (state) => ({ userInfo: state.userInfo }),
    }
  )
);

// (Opcional) Função helper para pegar o token fora do React
export const getAuthToken = (): string | null => {
  const state = useAuthStore.getState();
  return state.userInfo?.token || null;
};
