'use client';

import { useEffect, useState } from 'react';
import { IconCash, IconShoppingCartX, IconSwitchHorizontal } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button, Card, Flex, Group, Loader, Stack, Text } from '@mantine/core';
import { getAllClients } from '@/domains/clients/client-service';
import { Client } from '@/domains/clients/types/client';
import AbandonedCartForm from '@/forms/abandoned-cart-form';
import { useCartStore } from '@/store';
import { TransactionData } from '@/store/cart/types';
import { formatPrice } from '@/utils/formatters';
import { CheckoutSummary } from '../checkout/checkout-summary';
import { PaymentOptions } from '../checkout/payment-options';
import { DataGrid } from '../ui/data-grid';

export function ClientCart() {
  const carts = useCartStore((state) => state.carts);
  const activeCartId = useCartStore((state) => state.activeCartId);
  const switchCart = useCartStore((state) => state.switchCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const [saleStatus, setSaleStatus] = useState<'IS_CANCELING' | 'IS_CHECKOUT' | null>(null);
  const [clientsMap, setClientsMap] = useState<Record<string, string>>({});
  const [loadingClients, setLoadingClients] = useState(true);

  const itemColumns: ColumnDef<any>[] = [
    { header: 'Produto', accessorKey: 'name' },
    {
      header: 'Detalhe',
      cell: ({ row }) => (
        <Text size="sm" c="dimmed">
          {row.original.sku} | {row.original.size}
        </Text>
      ),
    },
    { header: 'Qtd', accessorKey: 'quantity' },
    {
      header: 'Preço Unitário',
      cell: ({ row }) => formatPrice(row.original.unit_sale_price),
      meta: { style: { textAlign: 'right' } },
    },
    {
      header: 'Subtotal',
      cell: ({ row }) => formatPrice(row.original.quantity * row.original.unit_sale_price),
      meta: { style: { textAlign: 'right' } },
    },
    {
      header: 'Ações',
      cell: ({ row }) => (
        <Button
          size="xs"
          variant="light"
          color="red"
          onClick={() => removeFromCart(row.original.variantId)}
        >
          Remover
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoadingClients(true);
      try {
        const clientsData = await getAllClients();
        const map: Record<string, string> = {};
        clientsData.forEach((client: Client) => {
          map[client._id] = client.name;
        });
        setClientsMap(map);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchData();
  }, []);

  const openCartClientIds = Object.keys(carts);

  const renderContent = () => {
    if (loadingClients) {
      return (
        <Flex align="center" justify="center" mih={100}>
          <Loader size="sm" />
          <Text ml="sm">Carregando dados dos clientes...</Text>
        </Flex>
      );
    }

    if (openCartClientIds.length === 0) {
      return <Text c="dimmed">Não há carrinhos (transações) abertos no momento.</Text>;
    }

    if (saleStatus === 'IS_CHECKOUT') {
      return <CheckoutSummary />;
    }

    if (saleStatus === 'IS_CANCELING') {
      return (
        <AbandonedCartForm
          onSuccess={() => setSaleStatus(null)}
          onCancel={() => setSaleStatus(null)}
        />
      );
    }

    return (
      <Stack gap="lg">
        {openCartClientIds.map((customerId) => {
          const cartData: TransactionData = carts[customerId];
          const clientName =
            clientsMap[customerId] || `Cliente Desconhecido (${customerId.substring(0, 6)}...)`;
          const isActive = customerId === activeCartId;
          const totalAmount = cartData.total_amount;

          return (
            <Card
              key={customerId}
              shadow="sm"
              padding="lg"
              withBorder
              style={{
                borderColor: isActive ? 'var(--mantine-color-green-6)' : undefined,
                borderWidth: isActive ? 2 : 1,
              }}
            >
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text fw={700} size="lg">
                    {clientName}
                  </Text>
                  {isActive && (
                    <Button size="xs" variant="filled" color="green" radius="xl">
                      Ativo
                    </Button>
                  )}
                </Group>

                <Text size="md" fw={500}>
                  Total da Compra: {formatPrice(cartData.total_amount)}
                </Text>

                <PaymentOptions totalAmount={totalAmount} />

                <DataGrid columns={itemColumns} data={cartData.items} />

                <Group mt="xs" justify="flex-end">
                  {!isActive && (
                    <Button
                      size="sm"
                      variant="light"
                      leftSection={<IconSwitchHorizontal size={16} />}
                      onClick={() => switchCart(customerId)}
                    >
                      Tornar Ativo
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="filled"
                    color="red"
                    leftSection={<IconShoppingCartX size={16} />}
                    onClick={() => setSaleStatus('IS_CANCELING')}
                  >
                    Cancelar
                  </Button>

                  <Button
                    size="sm"
                    variant="gradient"
                    gradient={{ from: 'indigo', to: 'cyan' }}
                    leftSection={<IconCash size={16} />}
                    disabled={cartData.items.length === 0 || !isActive}
                    onClick={() => setSaleStatus('IS_CHECKOUT')}
                  >
                    Finalizar
                  </Button>
                </Group>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    );
  };

  return <>{renderContent()}</>;
}
