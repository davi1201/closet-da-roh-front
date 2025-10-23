// src/domains/availability/availability-service.ts
// (Ou adicione ao seu appointment-service.ts)

import api from '@/lib/api';

// import { Availability } from './types/availability-types'; // Você precisará criar este tipo

// Interface para os dados que enviamos para criar slots
export interface CreateAvailabilityPayload {
  startTime: string; // ISO UTC String
  endTime: string; // ISO UTC String
}

/**
 * Cria um ou mais slots de disponibilidade.
 * @param slotsData Array de objetos com startTime e endTime em ISO UTC String.
 * @returns Promise<Availability[]> Os slots criados.
 */
export const createAvailabilitySlots = async (
  slotsData: CreateAvailabilityPayload[]
): Promise<Availability[]> => {
  try {
    // A rota é /admin/availability conforme definimos no backend
    const response = await api.post<Availability[]>('/availability', slotsData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar slots de disponibilidade:', error);
    throw error;
  }
};

// Você também precisará definir o tipo Availability se ainda não o fez
// src/domains/availability/types/availability-types.ts
export interface Availability {
  _id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  appointment?: string | null; // ID do agendamento
  createdAt: string;
  updatedAt: string;
}
