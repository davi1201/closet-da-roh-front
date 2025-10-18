'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ProductForm, { ProductFormValues } from '@/forms/product-form';
import { saveProduct } from './product-service';

export default function CreateProduct() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveAndCopy, setIsSaveAndCopy] = useState(false);

  const handleSubmit = async (values: ProductFormValues, files: File[]) => {
    setIsLoading(true);

    if (files.length === 0) {
      notifications.show({
        title: 'Amor 😳😳😳',
        message: 'Ta esquecendo das imagens gatinha. Quero ver esse produto lindo',
        color: 'red',
      });
      setIsLoading(false);
      return;
    }

    saveProduct(
      {
        ...values,
        buy_price: values.buy_price.replace(/[^\d.-]/g, ''),
        sale_price: values.sell_price.replace(/[^\d.-]/g, ''),
      },
      files
    )
      .then(() => {
        router.push('/backoffice/products');
        notifications.show({
          title: 'Amor 😍😍😍',
          message: 'Produto criado meu bem, agora é com você minha linda',
          color: 'green',
        });
      })
      .catch((error) => {
        notifications.show({
          title: 'Vixi 😢😢😢',
          message: 'Deu ruim ao criar o produto, procure seu marido urgente',
          color: 'red',
        });
        console.error('Erro ao criar produto:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Text size="xl" fw={700} mb="md">
        Cadastrar Produto
      </Text>

      <ProductForm
        initialValues={{
          code: '',
          name: '',
          description: '',
          color: null,
          size: null,
          buy_price: '',
          sell_price: '',
          category: null,
          supplier_id: null,
          images: [],
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        saveAndCopy={isSaveAndCopy}
      />
    </>
  );
}
