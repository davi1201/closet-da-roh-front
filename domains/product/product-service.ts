import { ProductResponse } from '@/domains/product/types/product';
import { ProductFormValues } from '@/forms/product-form';
import api from '@/lib/api';

export const saveProduct = async (
  data: ProductFormValues,
  imageFiles: File[] = []
): Promise<ProductResponse> => {
  try {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof ProductFormValues];

      if (value !== null && value !== undefined) {
        if (key === 'variants' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'images') {
        } else if (key !== 'variants') {
          formData.append(key, String(value));
        }
      }
    });

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
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  data: Partial<ProductFormValues>,
  newFiles: File[]
): Promise<ProductResponse> => {
  try {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof Partial<ProductFormValues>];

      if (value !== null && value !== undefined) {
        if (key === 'variants' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'images' && Array.isArray(value)) {
          const imagesToKeep = value
            // @ts-ignore
            .filter((img) => img.isRemote)
            .map((img) => ({
              // @ts-ignore
              url: img.previewUrl,
              // @ts-ignore
              key: img.key,
              // @ts-ignore
              _id: img.id,
            }));

          formData.append('existing_images', JSON.stringify(imagesToKeep));
        } else if (key !== 'variants' && key !== 'images') {
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
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllProducts = async (searchTerm?: string): Promise<ProductResponse[]> => {
  const url = searchTerm ? `/products?search=${encodeURIComponent(searchTerm)}` : '/products';

  const { data } = await api.get(url);
  return data;
};

export const getProductById = async (id: string): Promise<ProductResponse> => {
  try {
    const response = await api.get<ProductResponse>(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
