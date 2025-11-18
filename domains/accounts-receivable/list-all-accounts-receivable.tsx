'use client';

import { useEffect, useState } from 'react';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DataGrid } from '@/components/ui/data-grid';
import accountsReceivableService, {
  Receivable,
  ReceivableStatus,
} from '@/domains/accounts-receivable/account-receivable.service';
import { formatPrice } from '@/utils/formatters';

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

const currentYear = new Date().getFullYear();
const yearsData = [String(currentYear - 1), String(currentYear), String(currentYear + 1)];

const monthsData = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

export default function AccountsReceivableList() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [totalByMonth, setTotalByMonth] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReceivableStatus | 'ALL'>('PENDING');

  const now = new Date();
  const [month, setMonth] = useState<string>(String(now.getMonth() + 1));
  const [year, setYear] = useState<string>(String(now.getFullYear()));

  const fetchReceivables = async () => {
    setLoading(true);

    const statusParam = filter === 'ALL' ? {} : { status: filter };
    const params = {
      ...statusParam,
      month: Number(month),
      year: Number(year),
    };

    accountsReceivableService
      .getAllReceivables(params)
      .then((data: any) => {
        setReceivables(data.accountsToReceive);
        setTotalByMonth(data.totalByMonth);
      })
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
      if (filter === 'PENDING') {
        fetchReceivables();
      } else {
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
  }, [filter, month, year]);

  return (
    <Stack mt="xl" mb="xl">
      <div>
        <Card withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Total a receber ({monthsData.find((m) => m.value === month)?.label} / {year})
            </Text>
            <IconAlertCircle size={24} stroke={1.5} color={`var(--mantine-color-blue-6)`} />
          </Group>
          <Text size="xl" fw={700}>
            {formatPrice(totalByMonth)}
          </Text>
        </Card>
      </div>
      <Group justify="space-between">
        <Title order={2}>Contas a Receber</Title>
        <Group>
          <Select
            label="Mês"
            value={month}
            onChange={(value) => value && setMonth(value)}
            data={monthsData}
            style={{ minWidth: 140 }}
            disabled={loading}
          />
          <Select
            label="Ano"
            value={year}
            onChange={(value) => value && setYear(value)}
            data={yearsData}
            style={{ minWidth: 100 }}
            disabled={loading}
          />
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
      </Group>
      <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 1 }} />
        <DataGrid columns={columns} data={receivables} />
      </div>
    </Stack>
  );
}
