import { ProductData, ProductResponse } from '@/domains/product/types/product';
import { ProductFormValues } from '@/forms/product-form';
import api from '@/lib/api';
import { unmaskCurrency } from '@/utils/formatters';

export const saveProduct = async (
  productData: Omit<ProductData, 'id'>,
  imageFiles: File[] = []
): Promise<ProductResponse> => {
  try {
    const formData = new FormData();

    formData.append('name', productData.name);
    formData.append('supplier_id', productData.supplier_id ?? '');
    formData.append('description', productData.description ?? '');
    formData.append('size', productData.size ?? '');
    formData.append('color', productData.color ?? '');
    formData.append('category', productData.category ?? '');
    formData.append('buy_price', unmaskCurrency(productData.buy_price));
    formData.append('sale_price', unmaskCurrency(productData.sale_price));

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post<ProductResponse>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar produto:', error);

    throw error;
  }
};

export const updateProduct = async (
  id: string,
  // 🚨 Usamos ProductFormValues para aceitar os dados do formulário
  data: Partial<ProductFormValues>,
  // 🚨 NOVO: Incluímos o array de arquivos para novos uploads
  newFiles: File[]
): Promise<ProductResponse> => {
  try {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof Partial<ProductFormValues>];

      if (value !== null && value !== undefined) {
        if (key === 'images' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          // Adiciona campos simples (name, price, supplier_id, etc.)
          formData.append(key, String(value));
        }
      }
    });

    newFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.put<ProductResponse>(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);

    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    throw error;
  }
};

export const getAllProducts = async (): Promise<ProductResponse[]> => {
  try {
    const response = await api.get<ProductResponse[]>('/products');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<ProductResponse> => {
  try {
    // Tipamos a resposta como ProductResponse
    const response = await api.get<ProductResponse>(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter produto:', error);
    throw error;
  }
};
