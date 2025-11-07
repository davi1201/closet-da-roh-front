'use client';

import { useEffect, useState } from 'react';
import { getAllInsttallmentOptions } from '@/domains/installments/installment-service';
import { PaymentCondition } from '@/domains/sales/types/types';
import { useCartStore } from '@/store';
import { TransactionData } from '@/store/cart/types';

export type UseCheckoutResponse = {
  loading: boolean;
  error: string | null;
  selectedMethod: string;
  setSelectedMethod: React.Dispatch<React.SetStateAction<string>>;
  availableConditions: PaymentCondition[];
  discountInput: number;
  handleDiscountChange: (value: string | number) => void;
  handleInstallmentChange: (value: string) => void;
  setCartInstallments: (installments: number) => void;
  currentDiscountAmount: number;
  calculatedInterest: number;
  splitDownPayment: number | string;
  setSplitDownPayment: React.Dispatch<React.SetStateAction<number | string>>;
  splitDownPaymentMethod: string;
  setSplitDownPaymentMethod: React.Dispatch<React.SetStateAction<string>>;
  splitInstallmentMethod: string;
  setSplitInstallmentMethod: React.Dispatch<React.SetStateAction<string>>;
};

export function useCheckout(cart: TransactionData) {
  const { subtotal_amount, paymentDetails } = cart;
  const setPaymentDetails = useCartStore((state) => state.setPaymentDetails);

  const [selectedMethod, setSelectedMethod] = useState<string>(
    paymentDetails.method === 'A Vista' ? 'pix' : paymentDetails.method
  );
  const [availableConditions, setAvailableConditions] = useState<PaymentCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [calculatedInterest, setCalculatedInterest] = useState(0);

  // Split payment states (All props in English)
  const [splitDownPayment, setSplitDownPayment] = useState<number | string>('');
  const [splitDownPaymentMethod, setSplitDownPaymentMethod] = useState('pix');
  const [splitInstallmentMethod, setSplitInstallmentMethod] = useState('card');

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
    const baseTotal = subtotal_amount - discountAmount;

    let methodToFetch: string | null = null;
    let amountToFetch: number = 0;

    if (selectedMethod === 'card' || selectedMethod === 'credit') {
      methodToFetch = selectedMethod;
      amountToFetch = baseTotal;
    } else if (selectedMethod === 'split') {
      if (splitInstallmentMethod === 'card' || splitInstallmentMethod === 'credit') {
        methodToFetch = splitInstallmentMethod;
        const splitDownPaymentNumeric = Number(splitDownPayment) || 0;
        const remainingAmount = baseTotal - splitDownPaymentNumeric;
        amountToFetch = remainingAmount > 0 ? remainingAmount : 0;
      }
    }

    if (!methodToFetch || amountToFetch <= 0) {
      setAvailableConditions([]);
      setCalculatedInterest(0);
      setPaymentDetails({
        method: selectedMethod,
        installments: 1,
        interest_rate_percentage: 0,
        discount_amount: discountAmount,
      });
      return;
    }

    const repassInterest = selectedMethod !== 'split';

    const fetchInstallments = async () => {
      setLoading(true);
      setError(null);
      try {
        const conditions = await getAllInsttallmentOptions(amountToFetch, repassInterest);
        setAvailableConditions(conditions);
        const currentInstallment =
          conditions.find((c) => c.installments === paymentDetails.installments) ||
          conditions.find((c) => c.installments === 1) ||
          conditions[0];

        if (currentInstallment) {
          const interest = currentInstallment.total_value - amountToFetch;
          setCalculatedInterest(interest > 0 ? interest : 0);

          setPaymentDetails({
            method: selectedMethod,
            installments: currentInstallment.installments,
            interest_rate_percentage: currentInstallment.interest_rate,
            discount_amount: discountAmount,
          });
        }
      } catch (err: any) {
        setError(err.message || 'Could not load installment options.');
        setAvailableConditions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstallments();
  }, [
    subtotal_amount,
    selectedMethod,
    setPaymentDetails,
    discountInput,
    paymentDetails.installments,
    splitDownPayment,
    splitInstallmentMethod,
  ]);

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
      const baseTotal = subtotal_amount - discountAmount;

      let amountToFetch = 0;
      if (selectedMethod === 'card' || selectedMethod === 'credit') {
        amountToFetch = baseTotal;
      } else if (
        selectedMethod === 'split' &&
        (splitInstallmentMethod === 'card' || splitInstallmentMethod === 'credit')
      ) {
        const splitDownPaymentNumeric = Number(splitDownPayment) || 0;
        amountToFetch = baseTotal - splitDownPaymentNumeric;
      }

      const interest = condition.total_value - amountToFetch;
      setCalculatedInterest(interest > 0 ? interest : 0);

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
    });
  };

  const setCartInstallments = (installments: number) => {
    setPaymentDetails({
      installments: installments,
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
    setCartInstallments,
    currentDiscountAmount,
    calculatedInterest,
    splitDownPayment,
    setSplitDownPayment,
    splitDownPaymentMethod,
    setSplitDownPaymentMethod,
    splitInstallmentMethod,
    setSplitInstallmentMethod,
  };
}
