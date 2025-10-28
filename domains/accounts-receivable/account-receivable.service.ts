import api from '@/lib/api';

export type ReceivableStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Receivable {
  _id: string;
  customerId: string;
  saleId: string;
  amount: number;
  dueDate: string; // Datas do JSON vêm como string
  status: ReceivableStatus;
  installmentNumber: number;
  totalInstallments: number;
  createdAt: string;
  updatedAt: string;

  client?: {
    _id: string;
    name: string;
  };
}

export interface GetReceivablesFilters {
  status?: ReceivableStatus;
  customerId?: string;
  page?: number;
  limit?: number;
}

// --- Funções do Serviço ---

/**
 * Busca uma lista de contas a receber com base em filtros.
 * @param filters - Objeto de filtros (status, customerId, etc.)
 */
async function getAllReceivables(filters: GetReceivablesFilters = {}): Promise<Receivable[]> {
  try {
    const response = await api.get('/accounts-receivable', {
      params: filters,
    });
    // Assumindo que a API retorna um array de Receivables
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar contas a receber:', error);
    throw new Error('Não foi possível buscar as contas a receber.');
  }
}

/**
 * Busca todas as contas a receber de um cliente específico.
 * @param customerId - O ID do cliente
 */
async function getReceivablesByCustomer(customerId: string): Promise<Receivable[]> {
  return getAllReceivables({ customerId });
}

/**
 * Atualiza o status de uma parcela (ex: para "PAID").
 * @param receivableId - O ID da parcela
 * @param status - O novo status (normalmente 'PAID')
 */
async function updateReceivableStatus(receivableId: string, status: 'PAID'): Promise<Receivable> {
  try {
    const response = await api.patch(
      `/accounts-receivable/${receivableId}`,
      { status } // Envia o novo status no corpo da requisição
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar status da parcela:', error);
    throw new Error('Não foi possível atualizar o status da parcela.');
  }
}

export const accountsReceivableService = {
  getAllReceivables,
  getReceivablesByCustomer,
  updateReceivableStatus,
};

export default accountsReceivableService;
