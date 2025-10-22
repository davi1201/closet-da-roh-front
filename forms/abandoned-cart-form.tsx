import { useState } from 'react';
import { Button, Flex, Group, Select, Stack, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { SALE_CANCEL_REASONS } from '@/constants/abandoned-cart-reason';
import api from '@/lib/api';
import { useCartStore } from '@/store';

// 2. Definir as props que o componente espera (para fechar o modal)
interface AbandonedCartFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// 3. Definir os valores que este formulário controla
interface FormValues {
  cancellationCode: string;
  details: string;
}

export default function AbandonedCartForm({ onSuccess, onCancel }: AbandonedCartFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const activeCart = useCartStore((state) => {
    const activeId = state.activeCartId;
    return activeId ? state.carts[activeId] : null;
  });

  const activeCartId = useCartStore((state) => state.activeCartId);
  const removeCart = useCartStore((state) => state.removeCart);

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
    // 5. Validar se o carrinho existe
    if (!activeCart || !activeCartId) {
      notifications.show({
        title: 'Erro',
        message: 'Nenhum carrinho ativo para abandonar.',
        color: 'red',
      });
      return;
    }

    setIsLoading(true);

    // 6. Mapear os dados do Zustand para o formato do Model do Backend
    const totalItems = activeCart.items.reduce((acc, item) => acc + item.quantity, 0);

    const formattedProducts = activeCart.items.map((item) => ({
      productId: item.productId, // O Model espera 'productId'
      quantity: item.quantity,
      price: item.unit_sale_price,
      name: item.name,
    }));

    // 7. Montar o payload final
    const payload = {
      sessionId: activeCartId, // Usando o ID do carrinho como SessionID
      totalAmount: activeCart.total_amount,
      totalItems: totalItems,
      products: formattedProducts,
      userId: activeCart.customer || undefined,
      cancellationCode: values.cancellationCode,
      cancellationReason: values.details, // O Model espera 'cancellationReason'
    };

    try {
      await api.post('/abandoned-cart', payload);
      notifications.show({
        title: 'Registro salvo',
        message: 'O motivo do abandono foi registrado.',
        color: 'green',
      });

      // 8. Remover o carrinho do Zustand e fechar o modal
      removeCart(activeCartId);
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

        {/* 9. Conectar os campos ao formulário com getInputProps */}
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
