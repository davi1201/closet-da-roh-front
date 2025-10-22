import React, { useEffect, useState } from 'react';
import { IconAlertCircle, IconCheck, IconDiscount } from '@tabler/icons-react';
import {
  Alert,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  NumberInput,
  Radio,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import SaleSuccessFeedback from '@/domains/sales/sale-feedback-sucess';
import { createSale, getPaymentConditions } from '@/domains/sales/sale-service';
import { PaymentCondition, SaleResponse } from '@/domains/sales/types/types';
import { useCartModalStore, useCartStore } from '@/store';
import { formatPrice } from '@/utils/formatters';

interface CheckoutSummaryProps {
  soldBy?: string;
}

const PAYMENT_METHODS = [
  { value: 'pix', label: 'Pix (À Vista)' },
  { value: 'cash', label: 'Dinheiro (À Vista)' },
  { value: 'card', label: 'Cartão de Crédito/Débito' },
];

export function CheckoutSummary({ soldBy = '1' }: CheckoutSummaryProps) {
  const activeCartId = useCartStore((state) => state.activeCartId);
  const activeCart = useCartStore((state) => (activeCartId ? state.carts[activeCartId] : null));
  const setPaymentDetails = useCartStore((state) => state.setPaymentDetails);
  const removeCart = useCartStore((state) => state.removeCart);
  const closeCartModal = useCartModalStore((state) => state.closeCartModal);
  const [sale, setSale] = useState<SaleResponse>({} as SaleResponse);

  if (!activeCart || !activeCartId) {
    return (
      <Card shadow="sm" padding="lg" withBorder>
        <Alert icon={<IconAlertCircle size={16} />} title="Carrinho Vazio" color="yellow">
          Nenhuma transação ativa. Selecione um cliente para iniciar uma venda.
        </Alert>
      </Card>
    );
  }

  const { items, customer, subtotal_amount, total_amount, paymentDetails } = activeCart;
  const currentTotalAmount = total_amount;
  const customerId = customer;

  const [selectedMethod, setSelectedMethod] = useState<string>(
    paymentDetails.method === 'A Vista' ? 'pix' : paymentDetails.method
  );
  const [availableConditions, setAvailableConditions] = useState<PaymentCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessFeedbackOpen, setIsSuccessFeedbackOpen] = useState(false);

  const initialDiscountPercent =
    subtotal_amount > 0 ? (paymentDetails.discount_amount / subtotal_amount) * 100 : 0;

  const [discountInput, setDiscountInput] = useState<number>(
    parseFloat(initialDiscountPercent.toFixed(2))
  );

  const calculateDiscountAmount = (percentage: number) => {
    const safePercentage = percentage > 100 ? 100 : percentage < 0 ? 0 : percentage;
    return (subtotal_amount * safePercentage) / 100;
  };

  const currentDiscountAmount = calculateDiscountAmount(discountInput);

  useEffect(() => {
    if (subtotal_amount <= 0) return;

    const discountAmount = calculateDiscountAmount(discountInput);

    if (selectedMethod !== 'card') {
      setAvailableConditions([]);
      setPaymentDetails({
        method: selectedMethod,
        installments: 1,
        interest_rate_percentage: 0,
        discount_amount: discountAmount,
      });
      return;
    }

    const fetchInstallments = async () => {
      setLoading(true);
      setError(null);
      try {
        const conditions = await getPaymentConditions(currentTotalAmount);
        setAvailableConditions(conditions);

        const currentInstallment =
          conditions.find((c) => c.installments === paymentDetails.installments) ||
          conditions.find((c) => c.installments === 1) ||
          conditions[0];

        if (currentInstallment) {
          setPaymentDetails({
            method: selectedMethod,
            installments: currentInstallment.installments,
            interest_rate_percentage: currentInstallment.interest_rate,
            discount_amount: discountAmount,
          });
        }
      } catch (err) {
        setError('Não foi possível carregar as opções de parcelamento.');
        setAvailableConditions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstallments();
  }, [subtotal_amount, selectedMethod, setPaymentDetails, discountInput]);

  useEffect(() => {
    if (subtotal_amount > 0) {
      const currentPercent = (paymentDetails.discount_amount / subtotal_amount) * 100;
      if (Math.abs(currentPercent - discountInput) > 0.01) {
        setDiscountInput(parseFloat(currentPercent.toFixed(2)));
      }
    }
  }, [paymentDetails.discount_amount, subtotal_amount]);

  const handleInstallmentChange = (value: string) => {
    const installments = parseInt(value, 10);
    const condition = availableConditions.find((c) => c.installments === installments);

    if (condition) {
      const discountAmount = calculateDiscountAmount(discountInput);

      setPaymentDetails({
        installments: condition.installments,
        interest_rate_percentage: condition.interest_rate,
        discount_amount: discountAmount,
      });
    }
  };

  const handleDiscountChange = (value: string | number) => {
    const stringValue = typeof value === 'string' ? value.replace('%', '') : value;
    const numericValue = parseFloat(stringValue.toString().replace(',', '.'));

    let safePercentage = isNaN(numericValue) || numericValue === null ? 0 : numericValue;
    safePercentage = safePercentage > 100 ? 100 : safePercentage < 0 ? 0 : safePercentage;

    const discountAmount = calculateDiscountAmount(safePercentage);

    setDiscountInput(safePercentage);
    setPaymentDetails({
      discount_amount: discountAmount,
      installments: paymentDetails.installments,
      interest_rate_percentage: paymentDetails.interest_rate_percentage,
      method: paymentDetails.method,
    });
  };

  const handleFinalizeSale = async () => {
    if (items.length === 0) {
      setError('O carrinho está vazio.');
      return;
    }
    if (selectedMethod === 'card' && !availableConditions.length) {
      setError('Aguarde o carregamento das condições de pagamento ou selecione outro método.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const itemsPayload = items.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
    }));

    const salePayload = {
      customer_id: customerId,
      sold_by: soldBy,
      items: itemsPayload,
      payment_details: {
        method: selectedMethod,
        installments: paymentDetails.installments,
        discount_percentage: discountInput,
      },
    };

    try {
      const newSale = await createSale(salePayload);
      setSale(newSale);
      setIsSuccessFeedbackOpen(true);
    } catch (e: any) {
      setError(e.message || 'Erro desconhecido ao finalizar a venda.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccessFeedbackOpen) {
    return (
      <SaleSuccessFeedback
        sale={sale}
        onNewSale={() => {
          removeCart(activeCartId);
          setIsSuccessFeedbackOpen(false);
          closeCartModal();
        }}
      />
    );
  }

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Stack gap="md">
        <Text fw={700} size="xl">
          Resumo da Compra
        </Text>

        <Stack gap="xs">
          <Text fw={600}>Itens ({items.length})</Text>
          <Divider />
          {items.map((item) => (
            <Group justify="space-between" key={item.variantId}>
              <Text size="sm">
                {item.name} ({item.quantity}x)
              </Text>
              <Text size="sm" fw={500}>
                {formatPrice(item.quantity * item.unit_sale_price)}
              </Text>
            </Group>
          ))}
          <Divider />
          <Group justify="space-between">
            <Text fw={700}>Subtotal</Text>
            <Text fw={700}>{formatPrice(subtotal_amount)}</Text>
          </Group>
        </Stack>

        <Divider />

        <Stack gap="xs">
          <NumberInput
            label="Aplicar Desconto (%)"
            placeholder="0"
            suffix="%"
            value={discountInput}
            onChange={handleDiscountChange}
            decimalScale={2}
            fixedDecimalScale
            min={0}
            max={100}
            allowNegative={false}
            rightSection={<IconDiscount size={18} />}
          />
        </Stack>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm">Desconto Aplicado ({discountInput.toFixed(2)}%)</Text>
            <Text size="sm" c="green" fw={500}>
              -{formatPrice(currentDiscountAmount)}
            </Text>
          </Group>
          {paymentDetails.interest_rate_percentage > 0 && (
            <Group justify="space-between">
              <Text size="sm">Juros ({paymentDetails.interest_rate_percentage.toFixed(2)}%)</Text>
              <Text size="sm" c="red" fw={500}>
                +
                {/* O cálculo do juros no frontend está incorreto, mas mantemos a estrutura atual */}
                {formatPrice(currentTotalAmount - subtotal_amount + paymentDetails.discount_amount)}
              </Text>
            </Group>
          )}
        </Stack>

        <Divider />

        <Stack gap="xs">
          <Text fw={600}>Forma de Pagamento</Text>
          <Select
            data={PAYMENT_METHODS}
            value={selectedMethod}
            onChange={(value) => setSelectedMethod(value || 'pix')}
            placeholder="Selecione a forma de pagamento"
            allowDeselect={false}
          />
        </Stack>

        {selectedMethod === 'card' && (
          <Stack gap="xs">
            <Text fw={600}>Opções de Parcelamento</Text>
            {loading && <Loader size="sm" />}
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} title="Erro" color="red">
                {error}
              </Alert>
            )}

            <Radio.Group
              value={paymentDetails.installments.toString()}
              onChange={handleInstallmentChange}
            >
              <Stack gap="xs">
                {availableConditions.length > 0
                  ? availableConditions.map((condition) => (
                      <Radio
                        key={condition.installments}
                        value={condition.installments.toString()}
                        label={condition.description}
                        size="sm"
                      />
                    ))
                  : !loading && (
                      <Text c="dimmed" size="sm">
                        Nenhuma opção de parcelamento disponível.
                      </Text>
                    )}
              </Stack>
            </Radio.Group>
          </Stack>
        )}

        <Divider />

        <Group justify="space-between">
          <Text fw={900} size="xl">
            Total a Pagar
          </Text>
          <Text fw={900} size="xl" c="blue">
            {formatPrice(currentTotalAmount)}
          </Text>
        </Group>

        <Button
          onClick={handleFinalizeSale}
          disabled={isProcessing || items.length === 0 || !activeCartId}
          loading={isProcessing}
          leftSection={<IconCheck size={18} />}
          size="lg"
        >
          {isProcessing ? 'Processando Venda...' : 'Finalizar Venda'}
        </Button>
      </Stack>
    </Card>
  );
}
