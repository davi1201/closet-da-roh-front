import api from '@/lib/api';

const getAllInsttallmentOptions = async (amount: any) => {
  try {
    const response = await api.get(`/installments?purchaseValue=${amount}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getAllInsttallmentOptions };
