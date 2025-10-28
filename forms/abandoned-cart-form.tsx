'use client';

import { useState } from 'react';
import { Button, Flex, Group, Select, Stack, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { SALE_CANCEL_REASONS } from '@/constants/abandoned-cart-reason';
import api from '@/lib/api';
import { TransactionData } from '@/store/cart/types';

interface AbandonedCartFormProps {
  cart: TransactionData;
  cartId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormValues {
  cancellationCode: string;
  details: string;
}

export default function AbandonedCartForm({
  cart,
  cartId,
  onSuccess,
  onCancel,
}: AbandonedCartFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      cancellationCode: '',
      details: '',
    },
    validate: {
      cancellationCode: (value) => (value ? null : 'Selecione um motivo'),
      details: (value) => (value ? null : 'Informe os detalhes'),
    },
  });

  const handleSubmit = async (values: FormValues) => {
    if (!cart || !cartId) {
      notifications.show({
        title: 'Erro',
        message: 'Nenhum carrinho ativo para abandonar.',
        color: 'red',
      });
      return;
    }

    setIsLoading(true);

    const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    const formattedProducts = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.unit_sale_price,
      name: item.name,
    }));

    const payload = {
      sessionId: cartId,
      totalAmount: cart.total_amount,
      totalItems: totalItems,
      products: formattedProducts,
      userId: cart.customer || undefined,
      cancellationCode: values.cancellationCode,
      cancellationReason: values.details,
    };

    try {
      await api.post('/abandoned-cart', payload);
      notifications.show({
        title: 'Registro salvo',
        message: 'O motivo do abandono foi registrado.',
        color: 'green',
      });
      onSuccess();
    } catch (error) {
      console.error('Erro ao enviar motivo de abandono:', error);
      notifications.show({
        title: 'Erro',
        message: 'Não foi possível salvar o motivo.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Text>Informe o motivo do abandono:</Text>

        <Select
          data={SALE_CANCEL_REASONS}
          placeholder="Selecione um motivo"
          {...form.getInputProps('cancellationCode')}
        />
        <Textarea
          rows={8}
          placeholder="Informe o motivo com detalhes"
          {...form.getInputProps('details')}
        />

        <Flex justify="end">
          <Group align="flex-end">
            <Button variant="outline" color="gray" mt="md" onClick={onCancel} disabled={isLoading}>
              Voltar
            </Button>
            <Button type="submit" variant="gradient" mt="md" loading={isLoading}>
              Confirmar
            </Button>
          </Group>
        </Flex>
      </Stack>
    </form>
  );
}
