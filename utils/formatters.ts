export function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

export function maskZipCode(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
}

export function maskCurrency(value: string | number) {
  const numericValue = typeof value === 'string' ? value.replace(/[^\d]/g, '') : String(value);
  const floatValue = parseFloat(numericValue) / 100;

  return floatValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function unmaskCurrency(value: string) {
  if (!value) return '0';

  const onlyNumbers = value.replace(/[^\d,.-]/g, '');

  return onlyNumbers.replace(',', '.');
}

export function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
