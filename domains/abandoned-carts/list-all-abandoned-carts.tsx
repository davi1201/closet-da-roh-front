'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Stack, Text, Title, Tooltip } from '@mantine/core';
import { DataGrid } from '@/components/ui/data-grid';
import { SALE_CANCEL_REASONS_MAP } from '@/constants/abandoned-cart-reason'; // Assumindo que você tem um MAPA
import { formatPrice } from '@/utils/formatters';
import { getAllAbandonedCarts } from './abandoned-carts-service'; // Assumindo a existência deste serviço

// --- Tipos (Baseado no seu JSON) ---
interface ProductData {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  _id: string;
}

interface AbandonedCartData {
  _id: string;
  userId: string;
  sessionId: string;
  cancellationCode: string;
  cancellationReason: string;
  totalAmount: number;
  totalItems: number;
  products: ProductData[];
  createdAt: string;
}
// ---------------------------------

export default function ListAbandonedCarts() {
  const [carts, setCarts] = useState<AbandonedCartData[]>([]);

  const fetchAllCarts = async () => {
    // Você precisa criar esta função de serviço
    getAllAbandonedCarts().then((data) => {
      setCarts(data);
    });
  };

  const columns: ColumnDef<AbandonedCartData>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Data',
      cell: ({ row }) => <Text>{new Date(row.original.createdAt).toLocaleString('pt-BR')}</Text>,
    },
    {
      accessorKey: 'cancellationCode',
      header: 'Motivo',
      cell: ({ row }) => {
        const reason = SALE_CANCEL_REASONS_MAP[row.original.cancellationCode];
        return (
          <Badge color={reason?.color || 'gray'} variant="light">
            {reason?.label || row.original.cancellationCode}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'cancellationReason',
      header: 'Detalhes',
      cell: ({ row }) => (
        <Tooltip label={row.original.cancellationReason}>
          <Text truncate maw={300}>
            {row.original.cancellationReason}
          </Text>
        </Tooltip>
      ),
    },
    {
      accessorKey: 'products',
      header: 'Produtos',
      cell: ({ row }) => {
        const productNames = row.original.products.map((p) => p.name).join(', ');
        return (
          <Tooltip label={productNames}>
            <Text truncate maw={250}>
              {productNames}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'totalItems',
      header: 'Itens',
    },
    {
      accessorKey: 'totalAmount',
      header: 'Valor Perdido',
      cell: ({ row }) => <Text c="red">{formatPrice(row.original.totalAmount)}</Text>,
    },
  ];

  useEffect(() => {
    fetchAllCarts();
  }, []);

  return (
    <Stack mt="xl" mb="xl">
      <Title order={2}>Registros de Carrinhos Abandonados</Title>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <DataGrid columns={columns} data={carts} />
      </div>
    </Stack>
  );
}
