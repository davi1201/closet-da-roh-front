'use client';

import { IconCash, IconShoppingCartX, IconSwitchHorizontal } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button, Card, Flex, Group, Stack, Text } from '@mantine/core';
import { useCartStore } from '@/store';
import { CartState, MultiCartState } from '@/store/cart/types';
import { formatPrice } from '@/utils/formatters';
import { PaymentOptions } from '../checkout/payment-options';
import { DataGrid } from '../ui/data-grid';

interface CartListProps {
  carts: MultiCartState['carts'];
  activeCartId: MultiCartState['activeCartId'];
  clientsMap: Record<string, string>;
  onSwitchCart: (customerId: string) => void;
  onRemoveItem: (variantId: string) => void;
  onGoToCheckout: () => void;
  onGoToCancel: () => void;
}

export function CartList({
  carts,
  activeCartId,
  clientsMap,
  onSwitchCart,
  onRemoveItem,
  onGoToCheckout,
  onGoToCancel,
}: CartListProps) {
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
          onClick={() => onRemoveItem(row.original.variantId)}
        >
          Remover
        </Button>
      ),
    },
  ];

  const openCartClientIds = Object.keys(carts);

  if (openCartClientIds.length === 0) {
    return <Text c="dimmed">Não há carrinhos (transações) abertos no momento.</Text>;
  }

  return (
    <Stack gap="lg">
      {openCartClientIds.map((customerId) => {
        const cartData = carts[customerId];
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
                    onClick={() => onSwitchCart(customerId)}
                  >
                    Tornar Ativo
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="filled"
                  color="red"
                  leftSection={<IconShoppingCartX size={16} />}
                  onClick={onGoToCancel}
                  disabled={!isActive}
                >
                  Cancelar
                </Button>

                <Button
                  size="sm"
                  variant="gradient"
                  gradient={{ from: 'indigo', to: 'cyan' }}
                  leftSection={<IconCash size={16} />}
                  disabled={cartData.items.length === 0 || !isActive}
                  onClick={onGoToCheckout}
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
}
