import React, { useState } from 'react';
import { IconAlertCircle, IconArrowLeft, IconCheck, IconDiscount } from '@tabler/icons-react';
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
import { createSale } from '@/domains/sales/sale-service';
import { SaleResponse } from '@/domains/sales/types/types';
import { useCheckout } from '@/hooks/use-checkout';
import { useCartModalStore } from '@/store';
import { TransactionData } from '@/store/cart/types';
import { formatPrice } from '@/utils/formatters';

const PAYMENT_METHODS = [
  { value: 'pix', label: 'Pix (À Vista)' },
  { value: 'cash', label: 'Dinheiro (À Vista)' },
  { value: 'card', label: 'Cartão de Crédito/Débito' },
  { value: 'credit', label: 'Crediário' },
];

interface CheckoutSummaryProps {
  cart: TransactionData;
  cartId: string;
  onSaleComplete: () => void;
  onFeedbackFinished: () => void;
  onBack: () => void;
  soldBy?: string;
}

export function CheckoutSummary({
  cart,
  cartId,
  onSaleComplete,
  onFeedbackFinished,
  onBack,
  soldBy = '1',
}: CheckoutSummaryProps) {
  const closeCartModal = useCartModalStore((state) => state.closeCartModal);
  const [sale, setSale] = useState<SaleResponse>({} as SaleResponse);

  const {
    loading,
    error: hookError,
    selectedMethod,
    setSelectedMethod,
    availableConditions,
    discountInput,
    handleDiscountChange,
    handleInstallmentChange,
    currentDiscountAmount,
  } = useCheckout(cart);

  const { items, subtotal_amount, total_amount } = cart;

  const [isProcessing, setIsProcessing] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSuccessFeedbackOpen, setIsSuccessFeedbackOpen] = useState(false);

  const handleFinalizeSale = async () => {
    if (items.length === 0) {
      setSubmissionError('O carrinho está vazio.');
      return;
    }
    if (selectedMethod === 'card' && !availableConditions.length && !loading) {
      setSubmissionError(
        'Aguarde o carregamento das condições de pagamento ou selecione outro método.'
      );
      return;
    }

    setIsProcessing(true);
    setSubmissionError(null);

    const itemsPayload = items.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
    }));

    const salePayload = {
      customer_id: cart.customer,
      sold_by: soldBy,
      items: itemsPayload,
      payment_details: {
        method: selectedMethod,
        installments: cart.paymentDetails.installments,
        discount_percentage: discountInput,
      },
    };

    try {
      const newSale = await createSale(salePayload);
      setSale(newSale);
      onSaleComplete();
      setIsSuccessFeedbackOpen(true);
    } catch (e: any) {
      setSubmissionError(e.message || 'Erro desconhecido ao finalizar a venda.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccessFeedbackOpen) {
    return (
      <SaleSuccessFeedback
        sale={sale}
        onNewSale={() => {
          onFeedbackFinished();
          closeCartModal();
        }}
      />
    );
  }

  const currentError = hookError || submissionError;

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Stack gap="md">
        <Group>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            Voltar para a Lista
          </Button>
        </Group>

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
          {cart.paymentDetails.interest_rate_percentage > 0 && (
            <Group justify="space-between">
              <Text size="sm">
                Juros ({cart.paymentDetails.interest_rate_percentage.toFixed(2)}%)
              </Text>
              <Text size="sm" c="red" fw={500}>
                +{formatPrice(total_amount - subtotal_amount + cart.paymentDetails.discount_amount)}
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

        {selectedMethod === 'card' ||
          (selectedMethod === 'credit' && (
            <Stack gap="xs">
              <Text fw={600}>Opções de Parcelamento</Text>
              {loading && <Loader size="sm" />}
              {!loading && hookError && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Erro"
                  color="red"
                  variant="light"
                >
                  {hookError}
                </Alert>
              )}

              <Radio.Group
                value={cart.paymentDetails.installments.toString()}
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
                    : !loading &&
                      !hookError && (
                        <Text c="dimmed" size="sm">
                          Nenhuma opção de parcelamento disponível.
                        </Text>
                      )}
                </Stack>
              </Radio.Group>
            </Stack>
          ))}

        {currentError && !loading && (
          <Alert icon={<IconAlertCircle size={16} />} title="Atenção" color="red">
            {currentError}
          </Alert>
        )}

        <Divider />

        <Group justify="space-between">
          <Text fw={900} size="xl">
            Total a Pagar
          </Text>
          <Text fw={900} size="xl" c="blue">
            {formatPrice(total_amount)}
          </Text>
        </Group>

        <Button
          onClick={handleFinalizeSale}
          disabled={isProcessing || items.length === 0 || loading}
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
