'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ProductForm, { ProductFormValues } from '@/forms/product-form';
import { saveProduct } from './product-service'; // Verifique se este é o caminho correto

export default function CreateProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: ProductFormValues, files: File[]) => {
    setIsLoading(true);

    try {
      await saveProduct(values, files);
      notifications.show({
        title: 'Amor 😍😍😍',
        message: 'Produto salvo com sucesso!',
        color: 'green',
      });
      router.push('/backoffice/products');
    } catch (error) {
      notifications.show({
        title: 'Vixi 😢😢😢',
        message: 'Deu ruim ao salvar o produto, procure seu marido urgente',
        color: 'red',
      });
      console.error('Erro ao salvar produto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initialValues: ProductFormValues = {
    _id: undefined,
    code: '',
    name: '',
    description: '',
    category: null,
    supplier_id: null,
    images: [],
    variants: [
      {
        size: null,
        color: null,
        buy_price: '',
        sale_price: '',
        quantity: 1,
        minimum_stock: 0,
        sku: null,
      },
    ],
    fabric_composition: [],
  };

  return (
    <>
      <Text size="xl" fw={700} mb="md">
        Cadastrar Produto
      </Text>

      <ProductForm onSubmit={handleSubmit} initialValues={initialValues} isLoading={isLoading} />
    </>
  );
}
