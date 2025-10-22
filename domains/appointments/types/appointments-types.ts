// src/domains/appointments/types/appointment-types.ts
// (Ou onde você organiza seus tipos)

// Endereço da cliente (usado no agendamento)
export interface ClientAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string; // Ex: "PR"
  zipCode: string;
  details?: string; // Opcional
}

// Representa um slot de horário (vago ou ocupado)
// Usado na tela da cliente para mostrar o calendário
export interface AvailabilitySlot {
  _id: string;
  startTime: string; // Vem como string da API (ISO Date String)
  endTime: string; // Vem como string da API (ISO Date String)
  isBooked: boolean;
}

// Representa um agendamento confirmado
// Usado na tela de admin e retornado após a cliente agendar
export interface Appointment {
  _id: string;
  clientName: string;
  clientPhone: string;
  clientAddress: ClientAddress;
  startTime: string; // Vem como string da API (ISO Date String)
  endTime: string; // Vem como string da API (ISO Date String)
  status: 'confirmed' | 'canceled' | 'completed';
  notes?: string; // Opcional
  createdAt: string; // Vem como string da API (ISO Date String)
  updatedAt: string; // Vem como string da API (ISO Date String)
}

// Dados que a cliente envia para fazer um agendamento
export interface BookAppointmentPayload {
  slotId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: ClientAddress;
  notes?: string; // Opcional
}
