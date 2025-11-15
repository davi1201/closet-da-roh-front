import api from '@/lib/api';
import { PaymentCondition, SalePayload, SaleResponse } from './types/types';

const API_BASE_URL = '/sales';
const INSTALLMENTS_API_URL = '/installments';

// --- Tipos de Resposta ---

export interface SupplierSale {
  _id: string;
  name: string;
  totalSold: number;
}

export interface DashboardSummaryResponse {
  totalVendas: number;
  valorTotalVendas: number;
  totalDescontoAplicado: number;
  metodosDePagamento: Record<string, number>;
  topClientes: { nome: string; totalGasto: number }[];
  supplierSales: SupplierSale[];
}

// --- Funções de API ---

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
 * @param {boolean} [repassInterest=true] Se deve calcular o repasse de juros.
 * @returns {Promise<PaymentCondition[]>} A lista de condições de pagamento.
 */
export const getPaymentConditions = async (
  purchaseValue: number,
  repassInterest: boolean = true
): Promise<PaymentCondition[]> => {
  try {
    const response = await api.get<PaymentCondition[]>(
      `${INSTALLMENTS_API_URL}?purchaseValue=${purchaseValue}&repassInterest=${repassInterest}`
    );
    const sortedConditions = [...response.data].sort((a, b) => a.installments - b.installments);

    return sortedConditions;
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

/**
 * Busca os dados de resumo do dashboard (vendas, fornecedores, etc.).
 * @returns {Promise<DashboardSummaryResponse>} O objeto de resumo.
 */
export const getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
  try {
    const { data } = await api.get<DashboardSummaryResponse>(`${API_BASE_URL}/summary`);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancela uma venda.
 * @param {string} id ID da venda a ser cancelada.
 * @returns {Promise<{ message: string }>} Mensagem de sucesso.
 */
export const cancelSale = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.patch<{ message: string }>(`${API_BASE_URL}/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
