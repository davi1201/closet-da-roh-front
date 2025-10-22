import { useEffect, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Collapse,
  Divider,
  Flex,
  LoadingOverlay,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { getAllInsttallmentOptions } from '@/domains/installments/installment-service';
import { BackendPaymentCondition } from '@/types/payment';

interface PaymentOptionsProps {
  totalAmount: number;
}

export function PaymentOptions({ totalAmount }: PaymentOptionsProps) {
  const [conditions, setConditions] = useState<BackendPaymentCondition[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useMantineTheme();
  const [opened, { toggle }] = useDisclosure(false);

  useEffect(() => {
    if (totalAmount <= 0 || isNaN(totalAmount)) {
      setConditions(null);
      return;
    }

    const fetchConditions = async () => {
      setLoading(true);
      setError(null);
      setConditions(null);

      try {
        const installmentOptions = await getAllInsttallmentOptions(totalAmount);

        if (!installmentOptions) {
          throw new Error('Falha ao buscar condições de pagamento.');
        }
        setConditions(installmentOptions);
      } catch (err) {
        setError('Não foi possível carregar as opções de pagamento. Tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConditions();
  }, [totalAmount]);

  if (loading) {
    return (
      <Card shadow="sm" padding="md" withBorder>
        <LoadingOverlay visible={true} zIndex={100} overlayProps={{ radius: 'sm', blur: 2 }} />
        <Text>Buscando condições...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Erro" color="red">
        {error}
      </Alert>
    );
  }

  if (!conditions || conditions.length === 0) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Condições de Pagamento" color="gray">
        Nenhuma opção de pagamento disponível para este valor.
      </Alert>
    );
  }

  return (
    <Card shadow="sm" padding="md" withBorder>
      <Stack gap="xs">
        <Text fw={700} size="md">
          Condições de Pagamento
        </Text>
        <Divider />
        <Button variant="subtle" size="xs" onClick={toggle}>
          {opened ? 'Ocultar' : 'Mostrar'} todas as opções ({conditions.length})
        </Button>
        <Collapse in={opened}>
          <Flex gap="sm" wrap="wrap">
            {conditions.map((option) => (
              <Badge variant="outline" color="gray" key={option.installments} size="lg">
                {option.description}
              </Badge>
            ))}
          </Flex>
        </Collapse>
      </Stack>
    </Card>
  );
}
