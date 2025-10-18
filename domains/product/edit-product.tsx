'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ProductForm, { ProductFormValues } from '@/forms/product-form';
import { maskCurrency } from '@/utils/formatters';
import { getProductById, updateProduct } from './product-service'; // Importe a função de atualização
import { ProductResponse } from './types/product';

export default function EditProduct() {
  const { id } = useParams() as { id: string };

  const [productData, setProductData] = useState<ProductFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const handleGetProductById = async (productId: string) => {
    setIsDataLoading(true);
    try {
      const data: ProductResponse = await getProductById(productId);

      const initialValues: ProductFormValues = {
        _id: data._id,
        supplier_id: data.supplier._id,

        name: data.name,
        description: data.description || '',
        category: data.category,
        color: data.color,
        size: data.size,

        buy_price: maskCurrency(data.buy_price.toString()),
        sell_price: maskCurrency(data.sale_price.toString()),

        images: data.images,
      };

      setProductData(initialValues);
    } catch (error) {
      notifications.show({
        title: 'Erro de Carga',
        message: 'Não foi possível carregar os dados do produto.',
        color: 'red',
      });
      setProductData(null);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      handleGetProductById(id);
    }
  }, [id]);

  const handleSubmit = async (values: ProductFormValues, files: File[]) => {
    setIsLoading(true);

    const productId = values._id || id;

    const formattedValues = {
      ...values,

      buy_price: values.buy_price.replace(/[^\d.-]/g, ''),
      sale_price: values.sell_price.replace(/[^\d.-]/g, ''),
    };

    updateProduct(productId, formattedValues, files)
      .then(() => {
        notifications.show({
          title: 'Amor 🎉🎉🎉',
          message: 'Produto atualizado com sucesso!',
          color: 'green',
        });
      })
      .catch((error) => {
        notifications.show({
          title: 'Vixi 😢😢😢',
          message: 'Deu ruim ao atualizar o produto, procure seu marido urgente',
          color: 'red',
        });
        console.error('Erro ao atualizar produto:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isDataLoading) {
    return <Text size="xl">Carregando dados do produto...</Text>;
  }

  if (!productData) {
    return (
      <Text size="xl" color="red">
        Produto não encontrado.
      </Text>
    );
  }

  return (
    <>
      <Text size="xl" fw={700} mb="md">
        Editar Produto: {productData.name}
      </Text>

      <ProductForm initialValues={productData} onSubmit={handleSubmit} isLoading={isLoading} />
    </>
  );
}
