export interface BackendPaymentCondition {
  installments: number;
  value: number; // Valor da parcela
  total_value: number; // Valor total da compra com juros
  description: string;
  interest_rate: number; // Taxa de juros aplicada (do backend)
}
