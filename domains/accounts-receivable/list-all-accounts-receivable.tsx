'use client';

import { useEffect, useState } from 'react';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button, Group, LoadingOverlay, Select, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DataGrid } from '@/components/ui/data-grid';
import accountsReceivableService, {
  Receivable,
  ReceivableStatus,
} from '@/domains/accounts-receivable/account-receivable.service';
import { formatPrice } from '@/utils/formatters';

// --- Funções Auxiliares (Helpers) ---

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

function StatusBadge({ status }: { status: ReceivableStatus }) {
  const config = {
    PAID: { label: 'Pago', color: 'green' },
    PENDING: { label: 'Pendente', color: 'blue' },
    OVERDUE: { label: 'Vencido', color: 'red' },
  };
  const { label, color } = config[status] || { label: 'Desconhecido', color: 'gray' };

  return (
    <Badge color={color} variant="light">
      {label}
    </Badge>
  );
}

// --- Componente Principal ---

export default function AccountsReceivableList() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReceivableStatus | 'ALL'>('PENDING');

  const fetchReceivables = async () => {
    setLoading(true);
    const params = filter === 'ALL' ? {} : { status: filter };

    accountsReceivableService
      .getAllReceivables(params)
      .then(setReceivables)
      .catch((err) => {
        notifications.show({
          title: 'Erro ao buscar dados',
          message: err.message || 'Não foi possível carregar as parcelas.',
          color: 'red',
          icon: <IconAlertCircle />,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleMarkAsPaid = async (id: string) => {
    setLoading(true);
    try {
      await accountsReceivableService.updateReceivableStatus(id, 'PAID');
      notifications.show({
        title: 'Sucesso!',
        message: 'Parcela marcada como paga.',
        color: 'green',
        icon: <IconCheck />,
      });
      // Atualiza a lista localmente ou busca novamente
      // Buscar novamente é mais simples se o filtro for 'PENDING'
      if (filter === 'PENDING') {
        fetchReceivables();
      } else {
        // Atualiza o item no estado local
        setReceivables((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'PAID' } : r)));
        setLoading(false);
      }
    } catch (err: any) {
      notifications.show({
        title: 'Erro',
        message: err.message || 'Não foi possível atualizar a parcela.',
        color: 'red',
        icon: <IconAlertCircle />,
      });
      setLoading(false);
    }
  };

  const columns: ColumnDef<Receivable>[] = [
    {
      accessorKey: 'client.name',
      header: 'Cliente',
      cell: ({ row }) => <Text>{row.original.client?.name || 'Cliente Não Informado'}</Text>,
    },
    {
      accessorKey: 'dueDate',
      header: 'Vencimento',
      cell: ({ row }) => <Text>{formatDate(row.original.dueDate)}</Text>,
    },
    {
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }) => <Text fw={500}>{formatPrice(row.original.amount)}</Text>,
    },
    {
      header: 'Parcela',
      cell: ({ row }) => (
        <Text c="dimmed" size="sm">
          {row.original.installmentNumber} / {row.original.totalInstallments}
        </Text>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      header: 'Ações',
      cell: ({ row }) => (
        <>
          {row.original.status !== 'PAID' && (
            <Button
              size="xs"
              variant="light"
              color="green"
              leftSection={<IconCheck size={14} />}
              onClick={() => handleMarkAsPaid(row.original._id)}
            >
              Marcar como Pago
            </Button>
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchReceivables();
  }, [filter]); // Recarrega os dados quando o filtro mudar

  return (
    <Stack mt="xl" mb="xl">
      <Group justify="space-between">
        <Title order={2}>Contas a Receber</Title>
        <Select
          label="Filtrar por status"
          value={filter}
          onChange={(value) => setFilter(value as any)}
          data={[
            { value: 'PENDING', label: 'Pendentes' },
            { value: 'OVERDUE', label: 'Vencidos' },
            { value: 'PAID', label: 'Pagos' },
            { value: 'ALL', label: 'Todos' },
          ]}
          style={{ minWidth: 200 }}
          disabled={loading}
        />
      </Group>
      <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 1 }} />
        <DataGrid columns={columns} data={receivables} />
      </div>
    </Stack>
  );
}
