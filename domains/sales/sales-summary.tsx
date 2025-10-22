'use client';

import React, { useEffect, useState } from 'react';
import { Card, Flex, Group, RingProgress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { PAYMENT_METHODS } from '@/constants/payment-method';
import { getSalesSummary } from '@/domains/sales/sale-service';
import { formatPrice } from '@/utils/formatters';

interface TopClient {
  nome: string;
  totalGasto: number;
}

interface SummaryData {
  totalVendas: number;
  valorTotalVendas: number;
  totalDescontoAplicado: number;
  metodosDePagamento: Record<string, number>;
  topClientes: TopClient[];
}

export function SalesDashboard() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getSalesSummary();
        //@ts-ignore
        setSummary(data);
      } catch (error) {
        console.error('Erro ao carregar o dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !summary) {
    return <Text>Carregando Dashboard...</Text>;
  }

  const totalPaymentValue = summary.valorTotalVendas;
  const paymentSegments = Object.entries(summary.metodosDePagamento).map(
    ([metodo, valor], index) => {
      const percentage = totalPaymentValue > 0 ? (valor / totalPaymentValue) * 100 : 0;
      const label = PAYMENT_METHODS.get(metodo) || metodo;
      return {
        value: percentage,
        label: `${label.toUpperCase()}: ${percentage.toFixed(0)}%`,
        color: ['green', '#11b1f5', 'orange', 'red', 'violet'][index % 5],
        valor: formatPrice(valor),
      };
    }
  );

  const topGasto = summary.topClientes[0]?.totalGasto || 1;

  return (
    <Stack>
      <Title order={2} fz={{ base: 22, sm: 28 }} fw={700}>
        Resumo de Vendas
      </Title>

      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="lg">
        <Card shadow="sm" padding="lg" withBorder>
          <Text fz={{ base: 'sm', sm: 'md' }} c="dimmed">
            Total de Vendas
          </Text>
          <Title order={3} fz={{ base: 20, sm: 26 }}>
            {summary.totalVendas}
          </Title>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Text fz={{ base: 'sm', sm: 'md' }} c="dimmed">
            Valor Total Vendido
          </Text>
          <Title order={3} fz={{ base: 20, sm: 26 }} c="green">
            {formatPrice(summary.valorTotalVendas)}
          </Title>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Text fz={{ base: 'sm', sm: 'md' }} c="dimmed">
            Total de Desconto Aplicado
          </Text>
          <Title order={3} fz={{ base: 20, sm: 26 }} c="red">
            {formatPrice(summary.totalDescontoAplicado)}
          </Title>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} fz={{ base: 18, sm: 22 }} mb="md">
            Vendas por Método de Pagamento
          </Title>

          <Group align="center" wrap="wrap" justify="center">
            <RingProgress
              sections={paymentSegments}
              size={200}
              thickness={20}
              label={
                <Text fz={{ base: 'lg', sm: 'xl' }} fw={700} ta="center">
                  {formatPrice(totalPaymentValue)}
                </Text>
              }
            />

            <Stack gap="xs" style={{ flexGrow: 1, minWidth: '150px' }}>
              {paymentSegments.map((segment) => (
                <Group key={segment.label} gap="xs" justify="space-between" wrap="nowrap">
                  <Group gap="xs">
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: segment.color,
                        borderRadius: 5,
                      }}
                    />
                    <Text fz={{ base: 'xs', sm: 'sm' }} style={{ whiteSpace: 'nowrap' }}>
                      {segment.label}
                    </Text>
                  </Group>
                  <Text fz={{ base: 'xs', sm: 'sm' }} fw={600} style={{ marginLeft: 'auto' }}>
                    {segment.valor}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} fz={{ base: 18, sm: 22 }} mb="md">
            Top Clientes
          </Title>

          {summary.topClientes && summary.topClientes.length > 0 ? (
            <Stack gap="xl">
              {summary.topClientes.map((cliente, index) => {
                const barWidth = (cliente.totalGasto / topGasto) * 100;

                return (
                  <Stack key={index} gap={4}>
                    <Group justify="space-between">
                      <Text fz="xs" c="dimmed">
                        #{index + 1}
                      </Text>
                      <Text fz="sm" fw={600} truncate style={{ flexGrow: 1 }}>
                        {cliente.nome.toLocaleUpperCase() || 'Cliente Desconhecido'}
                      </Text>
                      <Text fz="sm" fw={700}>
                        {formatPrice(cliente.totalGasto)}
                      </Text>
                    </Group>
                    <div
                      style={{
                        height: 8,
                        backgroundColor: 'var(--mantine-color-gray-2)',
                        borderRadius: 4,
                      }}
                    >
                      <div
                        style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          backgroundColor: 'var(--mantine-color-teal-5)',
                          borderRadius: 4,
                          transition: 'width 0.5s ease-out',
                        }}
                      />
                    </div>
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Text c="dimmed" fz="sm">
              Nenhuma venda com cliente registrado para criar o ranking.
            </Text>
          )}
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
