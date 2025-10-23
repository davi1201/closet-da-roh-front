'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, Center, Grid, Loader, Stack, Title } from '@mantine/core';
import { KpiCards } from '@/domains/dashboard/components/kpi-cards';
import { ActivityFeed } from './components/activity-feed';
import { MostLikedList } from './components/most-liked';
import { getDashboardStats } from './dashboard-service';

export default function Dashboard() {
  // 2. Busca todos os dados do dashboard de uma vez
  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['dashboardStats'], // Chave de cache
    queryFn: getDashboardStats, // Função do service
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });

  // 3. Estado de Carregamento
  if (isLoading) {
    return (
      <Center style={{ height: '400px' }}>
        <Loader />
      </Center>
    );
  }

  // 4. Estado de Erro
  if (isError) {
    return (
      <Alert title="Erro ao carregar o dashboard" color="red" variant="light">
        Não foi possível buscar os dados: {error.message}
      </Alert>
    );
  }

  // 5. Estado de Sucesso (Renderiza a UI)
  if (stats) {
    return (
      <Stack gap="xl">
        <Title order={2}>Dashboard Geral</Title>

        {/* --- KPIs (Cards no Topo) --- */}
        <KpiCards kpis={stats.kpis} />

        <Grid>
          {/* --- Coluna da Esquerda: Feed de Atividades --- */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <ActivityFeed feed={stats.activityFeed} />
          </Grid.Col>

          {/* --- Coluna da Direita: Produtos Mais Curtidos --- */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <MostLikedList products={stats.mostLikedProducts} />
          </Grid.Col>
        </Grid>
      </Stack>
    );
  }

  return null;
}
