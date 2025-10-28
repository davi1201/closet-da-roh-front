import api from '@/lib/api';

const getAllInsttallmentOptions = async (amount: any) => {
  try {
    const response = await api.get(`/installments?purchaseValue=${amount}`);
    const sortedConditions = [...response.data].sort((a, b) => a.installments - b.installments);
    return sortedConditions;
  } catch (error) {
    throw error;
  }
};

export { getAllInsttallmentOptions };
