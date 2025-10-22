import { useState } from 'react'; // Adicionar useState
import { IconBarcode, IconSearch, IconX } from '@tabler/icons-react'; // Importar ícones
import { ActionIcon, Button, Grid, Group, TextInput } from '@mantine/core';
import BarcodeScannerIOSFallback from '@/components/ui/barcode-scanner';

interface ProductFilterProps {
  applyFilter: (searchTerm: string) => void; // Tornar obrigatório para clareza
}

export default function ProductFilter({ applyFilter }: ProductFilterProps) {
  const [searchTerm, setSearchTerm] = useState(''); // Estado para controlar o input

  // Função para aplicar filtro e atualizar estado local
  const handleFilterChange = (value: string) => {
    setSearchTerm(value);
    applyFilter(value);
  };

  // Função para limpar filtro
  const handleClearFilter = () => {
    setSearchTerm(''); // Limpa o estado local
    applyFilter(''); // Avisa o componente pai para limpar
  };

  return (
    <Grid align="flex-end">
      <Grid.Col span={{ base: 12, sm: 'content' }}>
        <BarcodeScannerIOSFallback onChange={handleFilterChange} />
      </Grid.Col>

      {/* Coluna do Input de Busca */}
      <Grid.Col span={{ base: 12, sm: 'auto' }}>
        <TextInput
          placeholder="Buscar produto por nome ou código..."
          value={searchTerm} // Controlar o valor do input
          onChange={(event) => handleFilterChange(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />} // Ícone de busca
          // Adiciona botão 'X' para limpar DENTRO do input
          rightSection={
            searchTerm ? (
              <ActionIcon
                onClick={handleClearFilter}
                variant="transparent"
                color="gray"
                title="Limpar busca"
              >
                <IconX size={16} />
              </ActionIcon>
            ) : null
          }
        />
      </Grid.Col>

      {/* <Grid.Col span={{ base: 12, sm: 'content' }}>
        <Button
          variant="outline"
          onClick={handleClearFilter}
          leftSection={<IconX size={18} />}
          disabled={!searchTerm}
        >
          Limpar
        </Button>
      </Grid.Col> */}
    </Grid>
  );
}
