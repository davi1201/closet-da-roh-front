import api from '@/lib/api';
import { DesiredProductFormValues, DesiredProductResponse } from './types';

export const saveDesiredProduct = async (
  data: DesiredProductFormValues,
  imageFiles: File[] = []
): Promise<DesiredProductResponse> => {
  try {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof DesiredProductFormValues];

      if (value !== null && value !== undefined) {
        if (key === 'images') {
          // Não adicione, pois será tratado pelos 'imageFiles'
        } else {
          formData.append(key, String(value));
        }
      }
    });

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post<DesiredProductResponse>('/desired-products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDesiredProduct = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/desired-products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDesiredProductsByClientId = async (
  clientId: string
): Promise<DesiredProductResponse[]> => {
  try {
    const response = await api.get<DesiredProductResponse[]>(
      `/desired-products/client/${clientId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDesiredProductById = async (id: string): Promise<DesiredProductResponse> => {
  try {
    const response = await api.get<DesiredProductResponse>(`/desired-products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllDesiredProducts = async (): Promise<DesiredProductResponse[]> => {
  try {
    const response = await api.get<DesiredProductResponse[]>('/desired-products');
    return response.data;
  } catch (error) {
    throw error;
  }
};
