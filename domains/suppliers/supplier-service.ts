import api from '@/lib/api';
import { Supplier, SupplierData, SupplierResponse } from './types/supplier';

export const saveSupplier = async (
  supplierData: Omit<SupplierData, 'id'>
): Promise<SupplierData> => {
  try {
    const response = await api.post<SupplierData>('/suppliers', supplierData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    throw error;
  }
};

export const getAllSuppliers = async (): Promise<SupplierResponse[]> => {
  try {
    const response = await api.get<SupplierResponse[]>('/suppliers');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter fornecedores:', error);
    throw error;
  }
};

export const getSupplierById = async (id: string): Promise<Supplier> => {
  try {
    const response = await api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter fornecedor:', error);
    throw error;
  }
};

export const updateSupplier = async (
  id: string,
  supplierData: Partial<Supplier>
): Promise<Supplier> => {
  try {
    const response = await api.put<Supplier>(`/suppliers/${id}`, supplierData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    throw error;
  }
};

export const deleteSupplier = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);
    throw error;
  }
};
