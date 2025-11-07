'use client';

import { useRouter } from 'next/navigation';
import { IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Button, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { DataGrid } from '@/components/ui/data-grid';
import { PAYMENT_METHODS } from '@/constants/payment-method';
import { formatPrice } from '@/utils/formatters';
import { cancelSale, getAllSales } from './sale-service';
import { SaleResponse } from './types/types';

function getPaymentMethodDescription(sale: SaleResponse): string {
  if (sale.payments && sale.payments.length > 0) {
    const methods = sale.payments.map((p) => PAYMENT_METHODS.get(p.method) || p.method);

    return Array.from(new Set(methods)).join(' + ');
  }

  if (sale.payment_details) {
    // Formato legado: 'payment_details' é um objeto
    return PAYMENT_METHODS.get(sale.payment_details.method) || 'N/A';
  }

  return 'N/A';
}

export default function ListAllSales() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery<SaleResponse[]>({
    queryKey: ['sales'],
    queryFn: () => getAllSales(),
  });

  const { mutate: deleteSale, isPending: isDeleting } = useMutation({
    mutationFn: (saleId: string) => cancelSale(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (err) => {
      console.error('Erro ao cancelar venda:', err);
    },
  });

  const handleEdit = (saleId: string) => {
    router.push(`/backoffice/sales/edit/${saleId}`);
  };

  const columns: ColumnDef<SaleResponse>[] = [
    {
      accessorKey: 'client.name',
      header: 'Nome do Cliente',
      cell: ({ row }) => (
        <Text>{row.original.client?.name?.toUpperCase() || 'Cliente Não Informado'}</Text>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: 'Valor Total',
      cell: ({ row }) => {
        const { total_amount, discount_amount } = row.original;
        const isDiscount = discount_amount && discount_amount > 0;
        return <Text c={isDiscount ? 'red' : 'green'}>{formatPrice(total_amount)}</Text>;
      },
    },
    {
      accessorKey: 'discount_amount',
      header: 'Desconto',
      cell: ({ row }) => {
        const discount_amount = row.original.discount_amount;
        return (
          <Text c={discount_amount > 0 ? 'red' : undefined}>
            {discount_amount > 0 ? formatPrice(discount_amount) : '—'}
          </Text>
        );
      },
    },
    {
      accessorKey: 'subtotal_amount',
      header: 'Subtotal',
      cell: ({ row }) => <Text c="yellow">{formatPrice(row.original.subtotal_amount)}</Text>,
    },
    {
      accessorKey: 'payments', // Alterado de payment_details
      header: 'Método de Pagamento',
      cell: ({ row }) => <Text>{getPaymentMethodDescription(row.original)}</Text>,
    },
    {
      accessorKey: 'details', // Chave genérica para o botão
      header: 'Detalhes',
      cell: () => (
        <Button size="xs" variant="light">
          Ver Detalhes
        </Button>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Data da Venda',
      cell: ({ row }) => <Text>{new Date(row.original.createdAt).toLocaleDateString()}</Text>,
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <Group gap="xs" wrap="nowrap">
          {/* <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleEdit(row.original._id)}
            title="Editar venda"
          >
            <IconPencil size={18} />
          </ActionIcon> */}
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => deleteSale(row.original._id)}
            title="Cancelar venda"
            disabled={isDeleting}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Stack mt="xl" mb="xl">
      <Title order={2}>Vendas realizadas</Title>

      {isLoading ? (
        <Group justify="center" mt="lg">
          <Loader size="lg" />
        </Group>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <DataGrid columns={columns} data={sales} />
        </div>
      )}
    </Stack>
  );
}
