'use client';

import { useEffect, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { IconCashRegister, IconReceipt } from '@tabler/icons-react';
import Confetti from 'react-confetti';
import { Button, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { PAYMENT_METHODS } from '@/constants/payment-method';
import { formatPrice } from '@/utils/formatters';
import { SaleResponse } from './types/types';

interface SaleSuccessFeedbackProps {
  onNewSale: () => void;
  onViewSaleDetails?: (saleId: string) => void;
  sale?: SaleResponse;
}

export default function SaleSuccessFeedback({
  onNewSale,
  onViewSaleDetails,
  sale,
}: SaleSuccessFeedbackProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const totalItems = sale?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <Stack align="center" justify="center" style={{ minHeight: '80vh', textAlign: 'center' }}>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={true}
          numberOfPieces={isMobile ? 100 : 250}
          tweenDuration={8000}
        />
      )}

      <Player
        autoplay
        loop={true}
        src="https://lottie.host/a43de864-058b-43d0-b271-ad8f1f244e68/ksrnFTZ0Ap.json"
        style={{
          height: isMobile ? '200px' : '300px',
          width: isMobile ? '200px' : '300px',
          marginTop: -100,
        }}
      />

      <Title order={1} style={{ color: 'var(--mantine-color-green-7)' }}>
        Venda Realizada com Sucesso!
      </Title>

      <Text size="lg" color="dimmed" maw={600}>
        Parabéns! A transação foi concluída e a venda registrada com êxito.
      </Text>

      {/* Card de Resumo da Venda */}
      {sale && (
        <Paper
          withBorder
          shadow="md"
          p="lg"
          radius="md"
          mt="xl"
          style={{ minWidth: isMobile ? '100%' : '400px' }}
        >
          <Stack gap="sm">
            <Title order={4} ta="left">
              Resumo da Venda
            </Title>

            {/* Mostra o cliente, se houver */}
            {sale.client && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Cliente:
                </Text>
                <Text size="sm" fw={500}>
                  {sale.client.name}
                </Text>
              </Group>
            )}

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Itens Vendidos:
              </Text>
              <Text size="sm" fw={500}>
                {totalItems}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Pagamento:
              </Text>
              <Text size="sm" fw={500}>
                {sale.payments.map((payment) => PAYMENT_METHODS.get(payment.method)).join(', ')}
              </Text>
            </Group>

            <Divider my="xs" />

            <Group justify="space-between" mt="xs">
              <Text size="lg" fw={700}>
                Total Pago:
              </Text>
              <Text size="lg" fw={700} c="green.7">
                {formatPrice(sale.total_amount)}
              </Text>
            </Group>
          </Stack>
        </Paper>
      )}

      {/* Botões de Ação */}
      <Group mt="xl">
        <Button
          leftSection={<IconCashRegister size={20} />}
          variant="default"
          size="md"
          onClick={onNewSale}
        >
          Nova Venda
        </Button>
        {sale && onViewSaleDetails && (
          <Button
            leftSection={<IconReceipt size={20} />}
            variant="gradient"
            size="md"
            onClick={() => onViewSaleDetails(sale._id)} // Passa o ID da venda
          >
            Ver Detalhes
          </Button>
        )}
      </Group>
    </Stack>
  );
}
