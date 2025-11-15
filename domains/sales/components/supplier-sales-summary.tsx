// Salve como, por exemplo, '@/domains/dashboard/SupplierSalesSummary.tsx'

'use client';

import { IconAlertCircle, IconBuildingStore } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Card, Divider, Group, Loader, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { getDashboardSummary } from '@/domains/sales/sale-service';
import { formatPrice } from '@/utils/formatters';

export function SupplierSalesSummary() {
  const {
    data: summary,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });

  const { supplierSales = [] } = summary || {};

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={4}>Vendas por Fornecedor</Title>
        <IconBuildingStore size={24} />
      </Group>

      {isLoading && (
        <Group justify="center" mt="xl">
          <Loader />
        </Group>
      )}

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Erro" color="red" variant="light">
          Não foi possível carregar o resumo de fornecedores.
        </Alert>
      )}

      {!isLoading && !error && (
        <ScrollArea h={300}>
          <Stack gap="sm">
            {supplierSales.length > 0 ? (
              supplierSales.map((supplier) => (
                <Stack key={supplier._id} gap={4}>
                  <Group justify="space-between">
                    <Text size="sm" fw={600} truncate>
                      {supplier.name || 'Fornecedor Desconhecido'}
                    </Text>
                    <Text size="sm" fw={700} c="blue">
                      {formatPrice(supplier.totalSold)}
                    </Text>
                  </Group>
                  <Divider />
                </Stack>
              ))
            ) : (
              <Text c="dimmed" size="sm" ta="center" mt="md">
                Nenhum dado de venda por fornecedor encontrado.
              </Text>
            )}
          </Stack>
        </ScrollArea>
      )}
    </Card>
  );
}
