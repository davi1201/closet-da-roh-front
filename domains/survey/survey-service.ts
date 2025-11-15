// Em @/domains/survey/survey-service.ts

import api from '@/lib/api';
import { SurveyFormValues, SurveyResponse } from './types/survey';

const API_BASE_URL = '/survey-responses';

/**
 * Envia uma nova resposta do questionário para o backend.
 */
export const createSurveyResponse = async (
  responseData: SurveyFormValues
): Promise<SurveyResponse> => {
  try {
    const { data } = await api.post<SurveyResponse>(API_BASE_URL, responseData);
    return data;
  } catch (error) {
    console.error('Erro ao criar resposta do questionário:', error);
    throw error;
  }
};

/**
 * Busca o resumo agregado de todos os questionários.
 */
export const getSurveySummary = async (): Promise<any> => {
  try {
    const { data } = await api.get(`${API_BASE_URL}/summary`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar resumo do questionário:', error);
    throw error;
  }
};
