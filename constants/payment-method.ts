export const PAYMENT_METHODS = new Map<string, string>([
  ['card', 'Cartão de Crédito'],
  ['debit_card', 'Cartão de Débito'],
  ['credit', 'Crediário'],
  ['pix', 'PIX'],
  ['cash', 'Dinheiro'],
]);

export const PAYMENT_METHODS_OPTIONS = [
  { value: 'pix', label: 'Pix (À Vista)' },
  { value: 'cash', label: 'Dinheiro (À Vista)' },
  { value: 'card', label: 'Cartão de Crédito' },
  { value: 'credit', label: 'Crediário (Fiado)' },
  { value: 'debit_card', label: 'Cartão de Débito' },
];

export const SPLIT_ENTRY_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'debit_card', label: 'Cartão de Débito' },
];

export const SPLIT_INSTALLMENT_METHODS = [
  { value: 'card', label: 'Cartão de Crédito' },
  { value: 'credit', label: 'Crediário (Fiado)' },
];
