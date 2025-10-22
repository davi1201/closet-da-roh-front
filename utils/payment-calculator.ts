import { InstallmentRule } from '@/types/payment';

interface InstallmentCalculation {
  installments: number;
  totalAmount: number;
  installmentAmount: number;
  interestRate: number;
}

export function calculateInstallments(
  amount: number,
  rules: InstallmentRule[] = []
): InstallmentCalculation[] {
  return rules
    .map((rule) => {
      const rate = rule.interest_rate_percentage / 100;
      const installments = rule.installments;

      if (installments <= 0 || amount <= 0) {
        return null;
      }

      let totalAmount = amount;
      let installmentAmount;

      if (rate > 0) {
        const rateFactor = Math.pow(1 + rate, installments);
        const denominator = rateFactor - 1;

        if (denominator === 0) {
          return null;
        }

        installmentAmount = (amount * rate * rateFactor) / denominator;
        totalAmount = installmentAmount * installments;

        return {
          installments,
          totalAmount: totalAmount,
          installmentAmount: installmentAmount,
          interestRate: rule.interest_rate_percentage,
        };
      } else {
        installmentAmount = amount / installments;

        return {
          installments,
          totalAmount: amount,
          installmentAmount: installmentAmount,
          interestRate: 0,
        };
      }
    })
    .filter((calc): calc is InstallmentCalculation => calc !== null && calc.installmentAmount > 0);
}
