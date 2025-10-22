import api from '@/lib/api';
import { PaymentCondition, SalePayload, SaleResponse } from './types/types';

// Assumindo que você tem tipos definidos para SaleResponse, SalePayload e PaymentCondition

const API_BASE_URL = '/sales';
const INSTALLMENTS_API_URL = '/installments';

/**
 * Registra uma nova venda no backend.
 * @param {SalePayload} saleData Os dados formatados da venda, prontos para a API.
 * @returns {Promise<SaleResponse>} A venda registrada.
 */
export const createSale = async (saleData: SalePayload): Promise<SaleResponse> => {
  try {
    const response = await api.post<SaleResponse>(API_BASE_URL, saleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Busca todas as condições de parcelamento disponíveis para um determinado valor.
 * @param {number} purchaseValue O valor total da compra antes da aplicação de taxas/juros.
 * @returns {Promise<PaymentCondition[]>} A lista de condições de pagamento.
 */
export const getPaymentConditions = async (purchaseValue: number): Promise<PaymentCondition[]> => {
  try {
    const response = await api.get<PaymentCondition[]>(
      `${INSTALLMENTS_API_URL}?purchaseValue=${purchaseValue}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Busca uma venda pelo ID.
 * @param {string} id ID da venda.
 * @returns {Promise<SaleResponse>} A venda encontrada.
 */
export const getSaleById = async (id: string): Promise<SaleResponse> => {
  try {
    const response = await api.get<SaleResponse>(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Busca todas as vendas, opcionalmente filtradas por status.
 * @param {string} [status] Filtro de status (ex: 'completed', 'canceled').
 * @returns {Promise<SaleResponse[]>} Lista de vendas.
 */
export const getAllSales = async (status?: string): Promise<SaleResponse[]> => {
  try {
    const params = status ? { status } : {};
    const response = await api.get<SaleResponse[]>(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSalesSummary = async (): Promise<{
  totalVendas: number;
  valorTotalVendas: number;
  totalDescontoAplicado: number;
  metodosDePagamento: Record<string, number>;
}> => {
  try {
    const response = await api.get<{
      totalVendas: number;
      valorTotalVendas: number;
      totalDescontoAplicado: number;
      metodosDePagamento: Record<string, number>;
    }>(`${API_BASE_URL}/summary`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Futuramente:
/*
export const cancelSale = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.patch<{ message: string }>(`${API_BASE_URL}/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
*/
