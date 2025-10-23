import api from '@/lib/api'; // Sua instância do Axios
import { ProductData } from '../product/types/product';

// --- Definição dos Tipos de Resposta ---

export interface KpiStats {
  upcomingAppointments: number;
  newClientsThisMonth: number;
  totalActiveClients: number;
  totalActiveProducts: number;
  lowStockVariants: number;
  totalInventoryCost: number; // <-- Adicionado
  totalEstimatedSales: number; // <-- Adicionado
}

export interface ActivityFeedItem {
  type: 'APPOINTMENT' | 'LIKE';
  date: string;
  clientName: string;
  clientId: string;
  // Campos opcionais
  productName?: string;
  productId?: string;
}

export interface MostLikedProduct {
  likeCount: number;
  product: ProductData; // O objeto de produto aninhado
}

// O objeto de resposta completo da API
export interface DashboardStats {
  kpis: KpiStats;
  activityFeed: ActivityFeedItem[];
  mostLikedProducts: MostLikedProduct[];
}

/**
 * [ADMIN] Busca todas as estatísticas agregadas para o dashboard principal.
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    throw new Error('Não foi possível buscar os dados do dashboard.');
  }
};
