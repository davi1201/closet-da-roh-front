export const SALE_CANCEL_REASONS = [
  { value: 'HIGH_PRICE', label: 'Preço muito alto' },
  { value: 'INSTALLMENT_AMOUNT', label: 'Valor da parcela alto' },
  { value: 'HIGH_CARD_INTEREST', label: 'Juros do cartão alto' },
  { value: 'FOUND_BETTER_PRICE', label: 'Encontrou melhor preço' },
  { value: 'PURCHASE_ABANDONED', label: 'Compra abandonada' },
  { value: 'OTHER', label: 'Outro motivo' },
];

export type SaleCancelReason = (typeof SALE_CANCEL_REASONS)[number]['value'];

export const SALE_CANCEL_REASONS_MAP: Record<string, { label: string; color: string }> = {
  HIGH_PRICE: { label: 'Preço Alto', color: 'red' },
  INSTALLMENT_AMOUNT: { label: 'Valor da Parcela', color: 'orange' },
  HIGH_CARD_INTEREST: { label: 'Juros do Cartão', color: 'yellow' },
  FOUND_BETTER_PRICE: { label: 'Achou Mais Barato', color: 'blue' },
  PURCHASE_ABANDONED: { label: 'Abandono', color: 'gray' },
  OTHER: { label: 'Outro', color: 'pink' },
};
