// src/domains/appointments/appointment-service.ts
// (Ou onde você organiza seus serviços de API)

import api from '@/lib/api'; // Sua instância configurada do Axios ou similar
import { Appointment, AvailabilitySlot, BookAppointmentPayload } from './types/appointments-types';

// Importa os tipos que definimos

// --- Funções para a CLIENTE ---

/**
 * Busca os slots de horário disponíveis (e ocupados) para um dia específico.
 * @param date - A data no formato 'YYYY-MM-DD'
 * @returns Uma Promise com um array de AvailabilitySlot
 */
export const getPublicSlotsByDay = async (date: string): Promise<AvailabilitySlot[]> => {
  try {
    const response = await api.get<AvailabilitySlot[]>('/appointments/public/slots', {
      params: { date }, // Envia a data como query parameter
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar slots públicos:', error);
    throw error; // Re-lança o erro para o componente lidar
  }
};

/**
 * Envia os dados para criar um novo agendamento.
 * @param payload - Os dados do agendamento (nome, telefone, endereço, etc.)
 * @returns Uma Promise com o Appointment criado
 */
export const bookAppointment = async (payload: BookAppointmentPayload): Promise<Appointment> => {
  try {
    const response = await api.post<Appointment>('/appointments/public', payload);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }
};

// --- Funções para o ADMIN (Sua Esposa) ---

/**
 * Busca os agendamentos confirmados dentro de um período.
 * @param startDate - Data de início no formato 'YYYY-MM-DD'
 * @param endDate - Data de fim no formato 'YYYY-MM-DD'
 * @returns Uma Promise com um array de Appointment
 */
export const getAdminAppointments = async (
  startDate: string,
  endDate: string
): Promise<Appointment[]> => {
  try {
    const response = await api.get<Appointment[]>('/admin/appointments', {
      params: { startDate, endDate }, // Envia as datas como query parameters
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar agendamentos do admin:', error);
    throw error;
  }
};

export const getAvailableDaysInMonth = async (): Promise<string[]> => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Janeiro é 0
    const response = await api.get<string[]>(
      `/availability/available-days?year=${currentYear}&month=${currentMonth}`
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dias disponíveis:', error);
    throw error;
  }
};

/**
 * Cancela um agendamento existente.
 * @param appointmentId - O ID do agendamento a ser cancelado
 * @returns Uma Promise com o Appointment atualizado (com status 'canceled')
 */
export const cancelAppointment = async (appointmentId: string): Promise<Appointment> => {
  try {
    const response = await api.put<Appointment>(`/admin/appointments/${appointmentId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    throw error;
  }
};
