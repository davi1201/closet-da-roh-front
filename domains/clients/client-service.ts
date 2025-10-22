import api from '@/lib/api';
import { Client } from './types/client';

export const saveClient = async (clientData: Omit<Client, '_id'>): Promise<Client> => {
  try {
    const response = await api.post<Client>('/clients', clientData);
    return response.data;
  } catch (error) {
    throw new Error('Error saving client');
  }
};

export const getAllClients = async (): Promise<Client[]> => {
  try {
    const response = await api.get<Client[]>('/clients');
    return response.data;
  } catch (error) {
    throw new Error('Error fetching clients');
  }
};

export const getClientById = async (id: string): Promise<Client> => {
  try {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching client');
  }
};

export const updateClient = async (id: string, clientData: Partial<Client>): Promise<Client> => {
  try {
    const response = await api.put<Client>(`/clients/${id}`, clientData);
    return response.data;
  } catch (error) {
    throw new Error('Error updating client');
  }
};

export const deleteClient = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/clients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Error deleting client');
  }
};
