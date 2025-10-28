import { IconEye, IconPencil, IconShoppingCart } from '@tabler/icons-react';
import { Button, Flex } from '@mantine/core';
import { useAppStore } from '@/store/app/use-app-store';

interface ProductActionButtonsProps {
  productId: string;
  handleEdit: (id: string) => void;
  addToCart: (id: string) => void;
  onDetail?: (id: string) => void;
}

export default function ProductAdminActionButtons({
  productId,
  addToCart,
  handleEdit,
  onDetail,
}: ProductActionButtonsProps) {
  const mode = useAppStore((state) => state.mode);

  return (
    <Flex direction="column">
      <Button
        variant="gradient"
        fullWidth
        mt="md"
        size="lg"
        radius="md"
        onClick={() => addToCart(productId)}
      >
        <IconShoppingCart size={20} style={{ marginRight: 8 }} />
        Adicionar ao carrinho
      </Button>
      {mode === 'admin' && (
        <Button
          variant="filled"
          color="yellow"
          fullWidth
          mt="xs"
          size="lg"
          radius="md"
          onClick={() => handleEdit(productId)}
        >
          <IconPencil size={20} style={{ marginRight: 8 }} />
          Editar
        </Button>
      )}

      {mode === 'sale' && (
        <Button
          variant="filled"
          color="green"
          fullWidth
          mt="xs"
          size="lg"
          radius="md"
          onClick={() => onDetail?.(productId)}
        >
          <IconEye size={20} style={{ marginRight: 8 }} />
          Ver Detalhes
        </Button>
      )}
    </Flex>
  );
}
