import { TextInput } from '@mantine/core';

interface ProductFilterProps {
  applyFilter?: (searchTerm: string) => void;
}

export default function ProductFilter({ applyFilter }: ProductFilterProps) {
  return (
    <TextInput
      placeholder="Buscar produto..."
      onChange={(event) => applyFilter?.(event.currentTarget.value)}
    />
  );
}
