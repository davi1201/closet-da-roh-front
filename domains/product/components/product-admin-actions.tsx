import { IconPencil, IconShoppingCart } from '@tabler/icons-react';
import { Button, Flex } from '@mantine/core';

interface ProductActionButtonsProps {
  productId: string;
  handleEdit: (id: string) => void;
  addToCart: (id: string) => void;
}

export default function ProductAdminActionButtons({
  productId,
  addToCart,
  handleEdit,
}: ProductActionButtonsProps) {
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
    </Flex>
  );
}
