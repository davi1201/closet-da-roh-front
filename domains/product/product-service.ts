import { ProductResponse } from '@/domains/product/types/product';
import { ProductFormValues } from '@/forms/product-form';
import api from '@/lib/api';

// Não precisamos mais do unmaskCurrency aqui
// import { unmaskCurrency } from '@/utils/formatters';

const generateSku = (productName: string, color: string | null, size: string | null): string => {
  const namePart = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 3);

  const colorPart = (color ? color.toUpperCase().substring(0, 3) : 'XXX').replace(/[^A-Z0-9]/g, '');

  const sizePart = size ? size.toUpperCase().replace(/[^A-Z0-9]/g, '') : '00';

  return `${namePart}${colorPart}${sizePart}`.substring(0, 15);
};

// AJUSTE 1: Remoção do unmaskCurrency
const formatVariantData = (variants: ProductFormValues['variants'], productName: string) => {
  if (!variants) return [];

  return variants.map((variant) => ({
    ...variant,
    // REMOVIDO: buy_price: unmaskCurrency(variant.buy_price),
    // REMOVIDO: sale_price: unmaskCurrency(variant.sale_price),
    // O backend agora é responsável por desmascarar as strings de preço
    sku:
      variant.size && variant.color
        ? generateSku(productName, variant.color, variant.size)
        : variant.sku || generateSku(productName, null, null),
  }));
};

// AJUSTE 2: saveProduct agora usa a mesma lógica robusta do updateProduct
export const saveProduct = async (
  data: ProductFormValues,
  imageFiles: File[] = []
): Promise<ProductResponse> => {
  try {
    const formData = new FormData();
    const productName = data.name; // Nome já está disponível

    // Itera sobre todos os dados do formulário
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof ProductFormValues];

      if (value !== null && value !== undefined) {
        if (key === 'variants' && Array.isArray(value)) {
          // Chama a formatVariantData (que agora SÓ gera SKUs)
          // @ts-ignore
          const formattedVariants = formatVariantData(value, productName);
          formData.append(key, JSON.stringify(formattedVariants));
        } else if (key === 'images') {
          // Não envia o array 'images' do formulário (que é para 'existing')
        } else if (key !== 'variants') {
          formData.append(key, String(value));
        }
      }
    });

    imageFiles.forEach((file) => {
      formData.append('images', file); // Anexa os arquivos de imagem
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

// A updateProduct já estava correta
export const updateProduct = async (
  id: string,
  data: Partial<ProductFormValues>,
  newFiles: File[]
): Promise<ProductResponse> => {
  try {
    const formData = new FormData();
    const productName = data.name || (await getProductById(id)).name;

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof Partial<ProductFormValues>];

      if (value !== null && value !== undefined) {
        if (key === 'variants' && Array.isArray(value)) {
          const variantsValue = value as ProductFormValues['variants'];
          const formattedVariants = formatVariantData(variantsValue, productName);
          formData.append(key, JSON.stringify(formattedVariants));
        } else if (key === 'images' && Array.isArray(value)) {
          const imagesToKeep = value
            // @ts-ignore
            .filter((img) => img.isRemote) // Filtra apenas as imagens que já estavam no S3
            .map((img) => ({
              // @ts-ignore
              url: img.previewUrl, // (O nome da prop no hook)
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

export const getAllProducts = async (): Promise<ProductResponse[]> => {
  try {
    const response = await api.get<ProductResponse[]>('/products');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductById = async (id: string): Promise<ProductResponse> => {
  try {
    const response = await api.get<ProductResponse>(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
