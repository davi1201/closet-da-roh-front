import React, { useMemo, useState } from 'react';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
  IconDiscount,
  IconFileCheck,
} from '@tabler/icons-react';
import {
  Alert,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Modal,
  NumberInput,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  PAYMENT_METHODS_OPTIONS,
  SPLIT_ENTRY_METHODS,
  SPLIT_INSTALLMENT_METHODS,
} from '@/constants/payment-method';
import SaleSuccessFeedback from '@/domains/sales/sale-feedback-sucess';
import { createSale } from '@/domains/sales/sale-service';
import { PaymentCondition, SaleResponse } from '@/domains/sales/types/types';
import { useCheckout, UseCheckoutResponse } from '@/hooks/use-checkout';
// Supondo que você exporte o tipo
import { useCartModalStore } from '@/store';
import { TransactionData } from '@/store/cart/types';
import { formatPrice } from '@/utils/formatters';

// --- Interface de Props ---

interface CheckoutSummaryProps {
  cart: TransactionData;
  cartId: string;
  onSaleComplete: () => void;
  onFeedbackFinished: () => void;
  onBack: () => void;
  soldBy?: string;
}

const PAYMENT_METHODS_OPTIONS_WITH_SPLIT = [
  ...PAYMENT_METHODS_OPTIONS,
  { value: 'split', label: 'Entrada + Parcelado' },
];

// --- Componente Principal (Orquestrador) ---

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

  const [isProcessing, setIsProcessing] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSuccessFeedbackOpen, setIsSuccessFeedbackOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const checkout = useCheckout(cart);

  const form = useForm({
    initialValues: {
      due_date: null as Date | null,
    },
    validate: {
      due_date: (value) => {
        const { selectedMethod, splitInstallmentMethod } = checkout;
        if (
          (selectedMethod === 'credit' ||
            (selectedMethod === 'split' && splitInstallmentMethod === 'credit')) &&
          !value
        ) {
          return 'A data de vencimento é obrigatória para vendas no crediário.';
        }
        return null;
      },
    },
  });

  // --- Cálculos Memoizados ---
  const computed = useMemo(() => {
    const {
      subtotal_amount,
      paymentDetails: { installments },
    } = cart;
    const {
      currentDiscountAmount,
      calculatedInterest,
      selectedMethod,
      splitDownPayment,
      splitInstallmentMethod,
      availableConditions,
    } = checkout;

    const netSubtotal = subtotal_amount - currentDiscountAmount;
    const splitDownPaymentNumeric = Number(splitDownPayment) || 0;
    const remainingAmount = netSubtotal - splitDownPaymentNumeric;

    const currentInterest = calculatedInterest;
    const installmentAmountWithInterest = remainingAmount + currentInterest;
    const splitTotalAmount = splitDownPaymentNumeric + installmentAmountWithInterest;
    const singlePaymentTotalAmount = netSubtotal + currentInterest;

    const currentTotal = selectedMethod === 'split' ? splitTotalAmount : singlePaymentTotalAmount;

    const currentInstallmentMethod =
      selectedMethod === 'split' ? splitInstallmentMethod : selectedMethod;

    const showInstallments =
      (selectedMethod === 'card' ||
        selectedMethod === 'credit' ||
        (selectedMethod === 'split' &&
          (splitInstallmentMethod === 'card' || splitInstallmentMethod === 'credit'))) &&
      remainingAmount > 0;

    const installmentLabel =
      availableConditions.find((c) => c.installments === installments)?.description ||
      (installments > 1 ? `${installments}x` : '1x (Pagamento único)');

    return {
      netSubtotal,
      splitDownPaymentNumeric,
      remainingAmount,
      currentInterest,
      installmentAmountWithInterest,
      currentTotal,
      currentInstallmentMethod,
      showInstallments,
      installmentLabel,
    };
  }, [cart, checkout]);

  // --- Handlers de Ação ---
  const handleOpenConfirmation = () => {
    setSubmissionError(null);
    form.validate();

    if (cart.items.length === 0) {
      setSubmissionError('O carrinho está vazio.');
      return;
    }

    if (checkout.selectedMethod === 'split') {
      if (computed.splitDownPaymentNumeric <= 0) {
        setSubmissionError('O valor da entrada deve ser maior que zero.');
        return;
      }
      if (computed.splitDownPaymentNumeric > computed.netSubtotal) {
        setSubmissionError('O valor da entrada não pode ser maior que o total líquido.');
        return;
      }
      if (
        computed.remainingAmount > 0 &&
        computed.showInstallments &&
        !cart.paymentDetails.installments
      ) {
        setSubmissionError('Selecione uma opção de parcelamento para o valor restante.');
        return;
      }
    }

    if (
      (checkout.selectedMethod === 'card' || checkout.selectedMethod === 'credit') &&
      !checkout.availableConditions.length &&
      !checkout.loading
    ) {
      setSubmissionError(
        'Aguarde o carregamento das condições de pagamento ou selecione outro método.'
      );
      return;
    }

    if (!form.isValid()) {
      setSubmissionError('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmAndFinalize = async () => {
    setIsProcessing(true);
    setSubmissionError(null);

    const itemsPayload = cart.items.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
    }));

    let paymentsPayload: any[] = [];

    if (checkout.selectedMethod === 'split') {
      paymentsPayload = [
        {
          method: checkout.splitDownPaymentMethod,
          amount: computed.splitDownPaymentNumeric,
          installments: 1,
        },
      ];
      if (computed.remainingAmount > 0) {
        paymentsPayload.push({
          method: checkout.splitInstallmentMethod,
          installments: cart.paymentDetails.installments || 1,
        });
      }
    } else {
      paymentsPayload = [
        {
          method: checkout.selectedMethod,
          installments: cart.paymentDetails.installments || 1,
        },
      ];
    }

    const salePayload = {
      customer_id: cart.customer,
      sold_by: soldBy,
      items: itemsPayload,
      due_date: form.values.due_date || undefined,
      discount_percentage: checkout.discountInput,
      payments: paymentsPayload,
    };

    try {
      const newSale = await createSale(salePayload);
      setSale(newSale);
      onSaleComplete();
      setIsSuccessFeedbackOpen(true);
      setIsConfirmModalOpen(false);
    } catch (e: any) {
      setSubmissionError(e.message || 'Erro desconhecido ao finalizar a venda.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Renderização ---
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

  const currentError = checkout.error || submissionError;

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

        <SaleItems items={cart.items} subtotal={cart.subtotal_amount} />

        <Divider />

        <SaleDiscount
          discountInput={checkout.discountInput}
          onDiscountChange={checkout.handleDiscountChange}
        />

        <SaleTotals
          discountAmount={checkout.currentDiscountAmount}
          discountPercentage={checkout.discountInput}
          interestAmount={computed.currentInterest}
          interestRate={
            checkout.availableConditions.find(
              (c) => c.installments === cart.paymentDetails.installments
            )?.interest_rate || 0
          }
          isSplit={checkout.selectedMethod === 'split'}
        />

        <Divider />

        <SalePayment
          checkout={checkout}
          netSubtotal={computed.netSubtotal}
          remainingAmount={computed.remainingAmount}
        />

        {computed.showInstallments && (
          <SaleInstallments
            isLoading={checkout.loading}
            error={checkout.error}
            availableConditions={checkout.availableConditions}
            selectedInstallments={cart.paymentDetails.installments.toString()}
            onInstallmentChange={checkout.handleInstallmentChange}
            isSplit={checkout.selectedMethod === 'split'}
          />
        )}

        {computed.currentInstallmentMethod === 'credit' && computed.remainingAmount > 0 && (
          <>
            <Alert title="Atenção" color="yellow" mt="md">
              O crediário (fiado) permite que o cliente pague em uma data futura. Certifique-se de
              registrar a data de vencimento.
            </Alert>
            <TextInput
              withAsterisk
              label="Data de vencimento da primeira Parcela"
              type="date"
              placeholder="Selecione a data de vencimento"
              {...form.getInputProps('due_date')}
            />
          </>
        )}

        {currentError && !checkout.loading && !isConfirmModalOpen && (
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
            {formatPrice(computed.currentTotal)}
          </Text>
        </Group>

        <Button
          onClick={handleOpenConfirmation}
          disabled={isProcessing || cart.items.length === 0 || checkout.loading}
          loading={isProcessing}
          leftSection={<IconCheck size={18} />}
          size="lg"
        >
          {isProcessing ? 'Processando Venda...' : 'Finalizar Venda'}
        </Button>
      </Stack>

      <SaleConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onSubmit={handleConfirmAndFinalize}
        isProcessing={isProcessing}
        submissionError={submissionError}
        checkout={checkout}
        computed={computed}
        dueDate={form.values.due_date}
      />
    </Card>
  );
}

// --- Subcomponentes ---

function SaleItems({ items, subtotal }: { items: TransactionData['items']; subtotal: number }) {
  return (
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
        <Text fw={700}>{formatPrice(subtotal)}</Text>
      </Group>
    </Stack>
  );
}

function SaleDiscount({
  discountInput,
  onDiscountChange,
}: {
  discountInput: number;
  onDiscountChange: (value: string | number) => void;
}) {
  return (
    <Stack gap="xs">
      <NumberInput
        label="Aplicar Desconto (%)"
        placeholder="0"
        suffix="%"
        value={discountInput}
        onChange={onDiscountChange}
        decimalScale={2}
        fixedDecimalScale
        min={0}
        max={100}
        allowNegative={false}
        rightSection={<IconDiscount size={18} />}
      />
    </Stack>
  );
}

function SaleTotals({
  discountAmount,
  discountPercentage,
  interestAmount,
  interestRate,
  isSplit,
}: {
  discountAmount: number;
  discountPercentage: number;
  interestAmount: number;
  interestRate: number;
  isSplit: boolean;
}) {
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm">Desconto Aplicado ({discountPercentage.toFixed(2)}%)</Text>
        <Text size="sm" c="green" fw={500}>
          -{formatPrice(discountAmount)}
        </Text>
      </Group>

      {interestAmount > 0 && (
        <Group justify="space-between">
          <Text size="sm">Juros ({interestRate.toFixed(2)}%)</Text>
          <Text size="sm" c="red" fw={500}>
            + {formatPrice(interestAmount)}
          </Text>
        </Group>
      )}
    </Stack>
  );
}

function SalePayment({
  checkout,
  netSubtotal,
  remainingAmount,
}: {
  checkout: UseCheckoutResponse;
  netSubtotal: number;
  remainingAmount: number;
}) {
  const {
    selectedMethod,
    setSelectedMethod,
    setCartInstallments,
    splitDownPayment,
    setSplitDownPayment,
    splitDownPaymentMethod,
    setSplitDownPaymentMethod,
    splitInstallmentMethod,
    setSplitInstallmentMethod,
  } = checkout;

  return (
    <Stack gap="xs">
      <Text fw={600}>Forma de Pagamento</Text>
      <Select
        data={PAYMENT_METHODS_OPTIONS_WITH_SPLIT}
        value={selectedMethod}
        onChange={(value) => {
          setSelectedMethod(value || 'pix');
          if (value !== 'split' && value !== 'card' && value !== 'credit') {
            setCartInstallments(1);
          }
        }}
        placeholder="Selecione a forma de pagamento"
        allowDeselect={false}
      />

      {selectedMethod === 'split' && (
        <Card withBorder p="sm" mt="xs">
          <Stack gap="sm">
            <Text fw={600}>Detalhes da Entrada</Text>
            <NumberInput
              label="Valor da Entrada"
              placeholder="0,00"
              prefix="R$ "
              value={splitDownPayment}
              onChange={setSplitDownPayment}
              decimalScale={2}
              fixedDecimalScale
              min={0}
              max={netSubtotal > 0 ? netSubtotal : 0}
            />
            <Select
              label="Método da Entrada"
              data={SPLIT_ENTRY_METHODS}
              value={splitDownPaymentMethod}
              onChange={(val) => setSplitDownPaymentMethod(val || 'pix')}
              allowDeselect={false}
            />

            <Divider label="Restante a Parcelar" labelPosition="center" />

            <Group justify="space-between">
              <Text>Valor Restante:</Text>
              <Text fw={700} c="blue" size="lg">
                {formatPrice(remainingAmount < 0 ? 0 : remainingAmount)}
              </Text>
            </Group>

            {remainingAmount > 0 && (
              <Select
                label="Método do Parcelamento"
                data={SPLIT_INSTALLMENT_METHODS}
                value={splitInstallmentMethod}
                onChange={(val) => {
                  setSplitInstallmentMethod(val || 'card');
                  if (val !== 'card' && val !== 'credit') {
                    setCartInstallments(1);
                  }
                }}
                allowDeselect={false}
              />
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

function SaleInstallments({
  isLoading,
  error,
  availableConditions,
  selectedInstallments,
  onInstallmentChange,
  isSplit,
}: {
  isLoading: boolean;
  error: string | null;
  availableConditions: PaymentCondition[];
  selectedInstallments: string;
  onInstallmentChange: (value: string) => void;
  isSplit: boolean;
}) {
  return (
    <Stack gap="xs" mt={isSplit ? 'xs' : 'md'}>
      <Text fw={600}>
        {isSplit ? 'Opções de Parcelamento (do restante)' : 'Opções de Parcelamento'}
      </Text>
      {isLoading && <Loader size="sm" />}
      {!isLoading && error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Erro" color="red" variant="light">
          {error}
        </Alert>
      )}

      <Radio.Group value={selectedInstallments} onChange={onInstallmentChange}>
        <Stack gap="xs">
          {availableConditions.length > 0 ? (
            availableConditions.map((condition) => (
              <Radio
                key={condition.installments}
                value={condition.installments.toString()}
                label={condition.description}
                size="sm"
              />
            ))
          ) : !isLoading && !error ? (
            <Text c="dimmed" size="sm">
              Nenhuma opção de parcelamento disponível.
            </Text>
          ) : null}
        </Stack>
      </Radio.Group>
    </Stack>
  );
}

function SaleConfirmationModal({
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
  submissionError,
  checkout,
  computed,
  dueDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
  submissionError: string | null;
  checkout: UseCheckoutResponse;
  computed: any;
  dueDate: Date | null;
}) {
  const { selectedMethod, splitDownPaymentMethod, splitInstallmentMethod } = checkout;
  const {
    currentTotal,
    currentDiscountAmount,
    currentInterest,
    installmentLabel,
    installmentAmountWithInterest,
    splitDownPaymentNumeric,
    remainingAmount,
    showInstallments,
  } = computed;

  const paymentMethodLabel =
    PAYMENT_METHODS_OPTIONS_WITH_SPLIT.find((opt) => opt.value === selectedMethod)?.label ||
    selectedMethod;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon variant="light" size="lg">
            <IconFileCheck size={20} />
          </ThemeIcon>
          <Text fw={700} size="lg">
            Confirmar Venda
          </Text>
        </Group>
      }
      centered
    >
      <Stack gap="md">
        <Text>Por favor, confirme os detalhes da venda antes de finalizar.</Text>
        <Card withBorder padding="sm">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Forma de Pagamento
              </Text>
              <Text size="sm" fw={500}>
                {paymentMethodLabel}
              </Text>
            </Group>

            {selectedMethod === 'split' ? (
              <>
                <Group justify="space-between" ml="md">
                  <Text size="sm" c="dimmed">
                    Entrada ({splitDownPaymentMethod})
                  </Text>
                  <Text size="sm" fw={500}>
                    {formatPrice(splitDownPaymentNumeric)}
                  </Text>
                </Group>
                {remainingAmount > 0 && (
                  <Group justify="space-between" ml="md">
                    <Text size="sm" c="dimmed">
                      Restante ({splitInstallmentMethod})
                    </Text>
                    <Text size="sm" fw={500}>
                      {formatPrice(installmentAmountWithInterest)}
                    </Text>
                  </Group>
                )}
                {showInstallments && (
                  <Group justify="space-between" ml="md">
                    <Text size="sm" c="dimmed">
                      Parcelamento
                    </Text>
                    <Text size="sm" fw={500}>
                      {installmentLabel}
                    </Text>
                  </Group>
                )}
              </>
            ) : (
              <>
                {showInstallments && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Parcelamento
                    </Text>
                    <Text size="sm" fw={500}>
                      {installmentLabel}
                    </Text>
                  </Group>
                )}
              </>
            )}

            {dueDate &&
              (selectedMethod === 'credit' ||
                (splitInstallmentMethod === 'credit' && remainingAmount > 0)) && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    1º Vencimento
                  </Text>
                  <Text size="sm" fw={500}>
                    {new Date(dueDate).toLocaleDateString('pt-BR', {
                      timeZone: 'UTC',
                    })}
                  </Text>
                </Group>
              )}
            <Divider />
            {currentDiscountAmount > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Desconto
                </Text>
                <Text size="sm" fw={500} c="green">
                  -{formatPrice(currentDiscountAmount)}
                </Text>
              </Group>
            )}
            {currentInterest > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Juros
                </Text>
                <Text size="sm" fw={500} c="red">
                  +{formatPrice(currentInterest)}
                </Text>
              </Group>
            )}
            <Divider />
            <Group justify="space-between">
              <Text size="lg" fw={700}>
                Total Final
              </Text>
              <Text size="lg" fw={700} c="blue">
                {formatPrice(currentTotal)}
              </Text>
            </Group>
          </Stack>
        </Card>

        {submissionError && (
          <Alert icon={<IconAlertCircle size={16} />} title="Erro" color="red">
            {submissionError}
          </Alert>
        )}

        <Group grow>
          <Button variant="default" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} loading={isProcessing} leftSection={<IconCheck size={18} />}>
            Confirmar Venda
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
