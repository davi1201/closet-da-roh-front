import {
  IconArchiveOff,
  IconCalendarEvent,
  IconCoin, // <-- Novo Ícone
  IconPackage,
  IconTrendingUp, // <-- Novo Ícone
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import { Card, Grid, Group, SimpleGrid, Text } from '@mantine/core';
import { KpiStats } from '../dashboard-service';
import classes from './kpi-cards.module.css';

// --- AJUSTE 1: Função para formatar moeda (ou importe de seus utils) ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface KpiCardsProps {
  kpis: KpiStats;
}

const kpiData = (kpis: KpiStats) => [
  // ... (Seus KPIs existentes) ...
  {
    title: 'Próximos Agendamentos',
    value: kpis.upcomingAppointments,
    icon: IconCalendarEvent,
    color: 'blue',
  },
  {
    title: 'Novas Clientes (Mês)',
    value: kpis.newClientsThisMonth,
    icon: IconUserPlus,
    color: 'green',
  },
  {
    title: 'Total de Clientes Ativas',
    value: kpis.totalActiveClients,
    icon: IconUsers,
    color: 'cyan',
  },
  {
    title: 'Total de Produtos Ativos',
    value: kpis.totalActiveProducts,
    icon: IconPackage,
    color: 'grape',
  },
  {
    title: 'Estoque Baixo',
    value: kpis.lowStockVariants,
    icon: IconArchiveOff,
    color: 'red',
  },
  // --- AJUSTE 2: Novos KPIs Adicionados ---
  {
    title: 'Valor Estoque (Custo)',
    value: formatCurrency(kpis.totalInventoryCost), // Formata como R$
    icon: IconCoin,
    color: 'orange',
  },
  {
    title: 'Estimativa Venda (Estoque)',
    value: formatCurrency(kpis.totalEstimatedSales), // Formata como R$
    icon: IconTrendingUp,
    color: 'teal',
  },
];

export function KpiCards({ kpis }: KpiCardsProps) {
  const items = kpiData(kpis).map((item) => (
    <Card key={item.title} withBorder radius="md" p="md" className={classes.card}>
      <Group justify="space-between">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
          {item.title}
        </Text>
        <item.icon size={24} stroke={1.5} color={`var(--mantine-color-${item.color}-6)`} />
      </Group>
      <Text size="xl" fw={700} className={classes.value}>
        {item.value}
      </Text>
    </Card>
  ));

  return <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }}>{items}</SimpleGrid>;
}
