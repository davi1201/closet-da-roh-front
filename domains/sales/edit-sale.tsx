import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IconAlertCircle, IconArrowLeft, IconCheck, IconDiscount } from '@tabler/icons-react';
import {
  Alert,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { PAYMENT_METHODS_OPTIONS } from '@/constants/payment-method';
import { formatPrice } from '@/utils/formatters';
import { getSaleById } from './sale-service';
import { SaleResponse } from './types/types';

function formatDateForInput(date: string | Date | null): string | undefined {
  if (!date) return undefined;
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (e) {
    return undefined;
  }
}

export function EditSaleForm() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [sale, setSale] = useState<SaleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      discount_amount: 0,
      method: 'pix',
      installments: 1,
      due_date: undefined as string | undefined,
    },
    validate: {
      due_date: (value, values) => {
        if (values.method === 'credit' && !value) {
          return 'A data de vencimento é obrigatória para vendas no crediário.';
        }
        return null;
      },
      installments: (value, values) => {
        if (values.method === 'credit' && (!value || value < 1)) {
          return 'Número de parcelas inválido.';
        }
        return null;
      },
    },
  });

  const fetchSale = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const fetchedSale = await getSaleById(id);

      setSale(fetchedSale);
      form.setValues({
        discount_amount: fetchedSale.payment_details.discount_amount || 0,
        method: fetchedSale.payment_details.method || 'pix',
        installments: fetchedSale.payment_details.installments || 1,
        due_date: formatDateForInput(fetchedSale.due_date || null),
      });
      form.resetDirty();
    } catch (e) {
      console.error('Error fetching sale:', e);
      setFetchError('Falha ao carregar os dados da venda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchSale();
  }, [id]);

  const handleFormSubmit = async (values: typeof form.values) => {
    if (!sale) return;
    setIsProcessing(true);
    setSubmissionError(null);

    const updatePayload = {
      payment_details: {
        method: values.method,
        installments: Number(values.installments),
        discount_amount: Number(values.discount_amount),
      },
      due_date: values.method === 'credit' ? values.due_date : null,
    };

    try {
      console.log('Updating sale with payload:', updatePayload);
      // await onSave(sale._id, updatePayload);
      // Após salvar com sucesso, você pode redirecionar ou mostrar mensagem de sucesso
    } catch (e: any) {
      console.error('Error updating sale:', e);
      setSubmissionError(e.message || 'Erro desconhecido ao atualizar a venda.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card shadow="sm" padding="lg" withBorder>
        <Group justify="center" p="xl">
          <Loader />
        </Group>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Card shadow="sm" padding="lg" withBorder>
        <Alert color="red" title="Erro ao Carregar">
          {fetchError}
        </Alert>
      </Card>
    );
  }

  if (!sale) {
    return (
      <Card shadow="sm" padding="lg" withBorder>
        <Alert color="gray">Venda não encontrada.</Alert>
      </Card>
    );
  }

  const { subtotal_amount, items, payment_details } = sale;
  const currentDiscountAmount = Number(form.values.discount_amount) || 0;
  const displayTotal = subtotal_amount - currentDiscountAmount;

  // Calcula o total com juros (se aplicável)
  const interestRate = payment_details.interest_rate_percentage || 0;
  const totalWithInterest = displayTotal * (1 + interestRate / 100);

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <form onSubmit={form.onSubmit(handleFormSubmit)}>
        <Stack gap="md">
          <Group>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              Voltar
            </Button>
          </Group>

          <Text fw={700} size="xl">
            Editar Venda
          </Text>

          {/* Informações do Cliente */}
          <Stack gap="xs">
            <Text fw={600}>Cliente</Text>
            <Divider />
            <Group justify="space-between">
              <Text size="sm">Nome:</Text>
              <Text size="sm" fw={500}>
                {sale.client?.name || 'N/A'}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Telefone:</Text>
              <Text size="sm" fw={500}>
                {sale.client?.phoneNumber || 'N/A'}
              </Text>
            </Group>
          </Stack>

          <Divider />

          {/* Lista de Itens */}
          <Stack gap="xs">
            <Text fw={600}>Itens ({items.length})</Text>
            <Divider />
            {items.map((item, index) => (
              <Group justify="space-between" key={item._id || index}>
                <Stack gap={0}>
                  <Text size="sm" fw={500}>
                    SKU: {item.sku_at_sale}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.quantity}x {formatPrice(item.unit_sale_price)} ={' '}
                    {formatPrice(item.subtotal)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Status:{' '}
                    {item.fulfillment_status === 'pending_stock'
                      ? 'Aguardando Estoque'
                      : item.fulfillment_status}
                  </Text>
                </Stack>
                <Text size="sm" fw={700}>
                  {formatPrice(item.subtotal)}
                </Text>
              </Group>
            ))}
            <Divider />
            <Group justify="space-between">
              <Text fw={700}>Subtotal Original</Text>
              <Text fw={700}>{formatPrice(subtotal_amount)}</Text>
            </Group>
          </Stack>

          <Divider />

          {/* Campo de Desconto */}
          <Stack gap="xs">
            <NumberInput
              label="Aplicar Desconto (R$)"
              placeholder="0.00"
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              min={0}
              max={subtotal_amount}
              allowNegative={false}
              rightSection={<IconDiscount size={18} />}
              {...form.getInputProps('discount_amount')}
            />
            <Text size="xs" c="dimmed">
              Desconto máximo: {formatPrice(subtotal_amount)}
            </Text>
          </Stack>

          {currentDiscountAmount > 0 && (
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Desconto Aplicado</Text>
                <Text size="sm" c="green" fw={500}>
                  -{formatPrice(currentDiscountAmount)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Percentual</Text>
                <Text size="sm" c="dimmed">
                  {((currentDiscountAmount / subtotal_amount) * 100).toFixed(2)}%
                </Text>
              </Group>
            </Stack>
          )}

          <Divider />

          {/* Forma de Pagamento */}
          <Stack gap="xs">
            <Text fw={600}>Forma de Pagamento</Text>
            <Select
              data={PAYMENT_METHODS_OPTIONS}
              placeholder="Selecione a forma de pagamento"
              allowDeselect={false}
              {...form.getInputProps('method')}
              onChange={(value) => {
                form.setFieldValue('method', value || 'pix');
                // Reset installments if not credit
                if (value !== 'credit') {
                  form.setFieldValue('installments', 1);
                  form.setFieldValue('due_date', undefined);
                }
              }}
            />
          </Stack>

          {/* Campos específicos para Crediário */}
          {form.values.method === 'credit' && (
            <>
              <Alert title="Atenção" color="yellow">
                O crediário (fiado) permite que o cliente pague em uma data futura. Certifique-se de
                registrar a data de vencimento corretamente.
              </Alert>

              <NumberInput
                label="Número de Parcelas"
                placeholder="1"
                min={1}
                max={12}
                allowNegative={false}
                {...form.getInputProps('installments')}
              />

              <TextInput
                withAsterisk
                type="date"
                label="Data de Vencimento"
                placeholder="Selecione a data de vencimento"
                {...form.getInputProps('due_date')}
              />
            </>
          )}

          {submissionError && (
            <Alert icon={<IconAlertCircle size={16} />} title="Erro ao Salvar" color="red">
              {submissionError}
            </Alert>
          )}

          <Divider />

          {/* Resumo do Total */}
          <Stack gap="xs">
            <Group justify="space-between">
              <Text fw={700} size="lg">
                Subtotal com Desconto
              </Text>
              <Text fw={700} size="lg">
                {formatPrice(displayTotal)}
              </Text>
            </Group>

            {form.values.method === 'credit' && interestRate > 0 && (
              <>
                <Group justify="space-between">
                  <Text size="sm" c="orange">
                    Juros ({interestRate.toFixed(2)}%)
                  </Text>
                  <Text size="sm" c="orange" fw={500}>
                    +{formatPrice(displayTotal * (interestRate / 100))}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={900} size="xl">
                    Total Final
                  </Text>
                  <Text fw={900} size="xl" c="blue">
                    {formatPrice(totalWithInterest)}
                  </Text>
                </Group>
              </>
            )}

            {form.values.method !== 'credit' && (
              <Group justify="space-between">
                <Text fw={900} size="xl">
                  Total Final
                </Text>
                <Text fw={900} size="xl" c="blue">
                  {formatPrice(displayTotal)}
                </Text>
              </Group>
            )}
          </Stack>

          <Text size="xs" c="dimmed">
            Nota: O total final (incluindo juros de parcelamento, se aplicável) será recalculado no
            servidor ao salvar.
          </Text>

          {/* Status da Venda */}
          <Alert color="blue" title="Status da Venda">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Pagamento:</Text>
                <Text size="sm" fw={500}>
                  {sale.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Atendimento:</Text>
                <Text size="sm" fw={500}>
                  {sale.fulfillment_status === 'awaiting_stock'
                    ? 'Aguardando Estoque'
                    : sale.fulfillment_status}
                </Text>
              </Group>
            </Stack>
          </Alert>

          <Button
            type="submit"
            disabled={isProcessing || !form.isDirty()}
            loading={isProcessing}
            leftSection={<IconCheck size={18} />}
            size="lg"
          >
            {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
