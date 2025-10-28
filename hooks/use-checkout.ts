'use client';

import { useEffect, useState } from 'react';
import { getPaymentConditions } from '@/domains/sales/sale-service';
import { PaymentCondition } from '@/domains/sales/types/types';
import { useCartStore } from '@/store';
import { TransactionData } from '@/store/cart/types';

export function useCheckout(cart: TransactionData) {
  const { subtotal_amount, paymentDetails, total_amount } = cart;
  const setPaymentDetails = useCartStore((state) => state.setPaymentDetails);

  const [selectedMethod, setSelectedMethod] = useState<string>(
    paymentDetails.method === 'A Vista' ? 'pix' : paymentDetails.method
  );
  const [availableConditions, setAvailableConditions] = useState<PaymentCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (selectedMethod !== 'card' && selectedMethod !== 'credit') {
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
        const conditions = await getPaymentConditions(total_amount);
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
  }, [subtotal_amount, selectedMethod, setPaymentDetails, discountInput, total_amount]);

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

  return {
    loading,
    error,
    selectedMethod,
    setSelectedMethod,
    availableConditions,
    discountInput,
    handleDiscountChange,
    handleInstallmentChange,
    currentDiscountAmount,
  };
}
