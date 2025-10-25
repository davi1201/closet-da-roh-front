// src/app/(public)/[...phone]/ProductActionButton.tsx
'use client';

import { IconCheck, IconCirclePlus, IconEye } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@mantine/core';
import { postInteraction, removeInteraction } from '../public-products-service';

// Recebe os mesmos tipos do seu componente pai
interface ProductWithSelection {
  _id: string;
  name: string;
  images: { url: string }[];
  isSelected: boolean;
  category: string;
}

interface Client {
  _id: string;
  name: string;
}

// Props do novo componente
interface ProductActionButtonProps {
  product: ProductWithSelection;
  client: Client | undefined; // O cliente pode não existir
}

export function ProductActionButton({ product, client }: ProductActionButtonProps) {
  const queryClient = useQueryClient();

  // 1. A LÓGICA DE MUTAÇÃO VEM PARA CÁ
  const selectMutation = useMutation({
    mutationFn: postInteraction,
    onSuccess: () => {
      // Invalida a query principal
      queryClient.invalidateQueries({ queryKey: ['productsForSelection', client?._id] });
    },
    onError: (error) => {
      console.error('Erro ao selecionar produto:', error);
    },
  });

  const deselectMutation = useMutation({
    mutationFn: removeInteraction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productsForSelection', client?._id] });
    },
    onError: (error) => {
      console.error('Erro ao desmarcar produto:', error);
    },
  });

  // 2. O HANDLER VEM PARA CÁ
  const handleToggleSelect = () => {
    // A checagem de 'client' aqui é uma segurança extra
    if (!client) return;

    if (product.isSelected) {
      deselectMutation.mutate({
        clientId: client._id,
        productId: product._id,
      });
    } else {
      selectMutation.mutate({
        clientId: client._id,
        productId: product._id,
        interaction: 'liked',
      });
    }
  };

  const isInteracting = selectMutation.isPending || deselectMutation.isPending;

  // 3. A LÓGICA DE RENDERIZAÇÃO DECIDE O QUE MOSTRAR

  // ---- CASO 1: Não há cliente (Ação de Convidado) ----
  if (!client) {
    // Você pode ter ações diferentes aqui.

    // Opção A: Botão desabilitado (como está hoje)
    // return (
    //   <Button
    //     fullWidth
    //     mt="md"
    //     radius="md"
    //     leftSection={<IconCirclePlus size={16} />}
    //     disabled={true}
    //   >
    //     Selecionar
    //   </Button>
    // );

    // Opção B: Botão de "Ver Detalhes" (exemplo de outra ação)
    return (
      <Button
        fullWidth
        mt="md"
        radius="md"
        variant="outline"
        color="gray"
        leftSection={<IconEye size={16} />}
        // onClick={() => router.push(`/produto/${product._id}`)} // Exemplo
      >
        Ver Detalhes
      </Button>
    );
  }

  // ---- CASO 2: Cliente existe (Ação de Seleção) ----
  return (
    <Button
      fullWidth
      mt="md"
      radius="md"
      variant={product.isSelected ? 'light' : 'filled'}
      color={product.isSelected ? 'green' : 'blue'}
      leftSection={product.isSelected ? <IconCheck size={16} /> : <IconCirclePlus size={16} />}
      onClick={handleToggleSelect}
      loading={isInteracting}
      disabled={isInteracting} // Desabilita enquanto interage
    >
      {product.isSelected ? 'Selecionado' : 'Selecionar'}
    </Button>
  );
}
