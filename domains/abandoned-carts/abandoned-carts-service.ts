import api from '@/lib/api';

const API_BASE_URL = '/abandoned-cart';

export const getAllAbandonedCarts = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
