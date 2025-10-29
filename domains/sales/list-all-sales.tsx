'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button, Stack, Text, Title } from '@mantine/core';
import { DataGrid } from '@/components/ui/data-grid';
import { PAYMENT_METHODS } from '@/constants/payment-method';
import { formatPrice } from '@/utils/formatters';
import { getAllSales } from './sale-service';

export default function ListAllSales() {
  const [sales, setSales] = useState<any[]>([]);
  const fetchAllSales = async () => {
    getAllSales().then((sales) => {
      setSales(sales);
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'client.name',
      header: 'Nome do Cliente',
      cell: ({ row }) => (
        <Text>{row.original.client?.name.toUpperCase() || 'Cliente Não Informado'}</Text>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: 'Valor Total',
      cell: ({ row }) => {
        const isDiscountApplied = row.original.payment_details.discount_amount > 0;
        const total =
          row.original.payment_details.method === 'card'
            ? row.original.subtotal_amount
            : row.original.total_amount;

        return <Text c={isDiscountApplied ? 'red' : 'green'}>{formatPrice(total)}</Text>;
      },
    },
    {
      accessorKey: 'discount_amount',
      header: 'Desconto',
      cell: ({ row }) => {
        const isDiscountApplied = row.original.payment_details.discount_amount > 0;
        const textColor = isDiscountApplied ? 'red' : '';
        const text = isDiscountApplied
          ? formatPrice(row.original.payment_details.discount_amount)
          : '---------';

        return <Text c={textColor}>{text}</Text>;
      },
    },
    {
      accessorKey: 'subtotal_amount',
      header: 'Subtotal',
      cell: ({ row }) => <Text c="yellow">{formatPrice(row.original.subtotal_amount)}</Text>,
    },
    {
      accessorKey: 'payment_details.method',
      header: 'Método de Pagamento',
      cell: ({ row }) => <Text>{PAYMENT_METHODS.get(row.original.payment_details.method)}</Text>,
    },
    {
      accessorKey: 'payment_details',
      header: 'Detalhes do Pagamento',
      cell: ({ row }) => {
        return (
          <Button size="xs" variant="light">
            Ver Detalhes
          </Button>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Data da Venda',
      cell: ({ row }) => <Text>{new Date(row.original.createdAt).toLocaleDateString()}</Text>,
    },
  ];

  useEffect(() => {
    fetchAllSales();
  }, []);

  return (
    <Stack mt="xl" mb="xl">
      <Title order={2}>Vendas realizadas</Title>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        |
        <DataGrid columns={columns} data={sales} />
      </div>
    </Stack>
  );
}
