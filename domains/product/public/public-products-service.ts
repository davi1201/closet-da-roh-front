import api from '@/lib/api'; // Sua instância axios

import { ProductResponse } from '../types/product';
import {
  ClientPublic,
  InteractionData,
  InteractionResponse,
  ProductPublic,
} from './types/public-products-types';

// Tipos esperados

/**
 * Busca os dados públicos de um cliente pelo número de telefone.
 */
export const getClientByPhone = async (phone: string): Promise<ClientPublic> => {
  try {
    const response = await api.get<ClientPublic>(`/clients/client-by-phone/${phone}`);
    return response.data;
  } catch (error) {
    // Lança o erro para o React Query (useMutation/useQuery) capturar
    throw new Error('Cliente não encontrado');
  }
};

/**
 * Busca a lista de produtos para o cliente "curtir".
 */
export const getProductsByClientId = async (clientId: string): Promise<ProductResponse[]> => {
  try {
    const response = await api.get<ProductResponse[]>(
      `/product-interactions/products-for-liking/${clientId}`
    );
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar produtos');
  }
};

/**
 * Registra a interação (like/dislike) no banco de dados.
 */
export const postInteraction = async (data: InteractionData): Promise<InteractionResponse> => {
  try {
    const response = await api.post<InteractionResponse>('/product-interactions', data);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao salvar interação');
  }
};

export const removeInteraction = async (data: {
  clientId: string;
  productId: string;
}): Promise<void> => {
  try {
    // Usamos 'data' no body do DELETE, o que é ok
    await api.delete('/product-interactions', { data: data });
  } catch (error) {
    throw new Error('Erro ao remover interação');
  }
};
