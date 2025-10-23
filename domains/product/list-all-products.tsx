'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Grid, Group, Skeleton, Stack, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks'; // Hook para evitar spam na API
import { showNotification } from '@mantine/notifications'; // Para feedback
import ProductCard from '@/components/shared/product-card';
import { useCartStore } from '@/store';
import ProductFilter from './product-filter';
// Assumindo que os serviços de API foram atualizados
import { deleteProduct, getAllProducts } from './product-service';
import { ProductResponse } from './types/product';

// --- Componente de Loading (Melhor que um Loader central) ---
function ProductGridSkeleton() {
  return (
    <Grid gutter="md">
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
          <Skeleton height={350} radius="md" />
        </Grid.Col>
      ))}
    </Grid>
  );
}

export default function ListAllProducts() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  // 2. Estado "atrasado" (debounced) para enviar à API
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300); // Atraso de 300ms

  // 3. Pega o contador da store para invalidar o cache
  const saleFinalizedCount = useCartStore((state) => state.saleFinalizedCount);

  // 4. Hook de BUSCA (useQuery)
  const {
    data: products = [], // Valor padrão para evitar erros
    isLoading,
    isError,
    error,
  } = useQuery<ProductResponse[], Error>({
    // A queryKey agora inclui o filtro
    queryKey: ['products', debouncedSearch],
    // A queryFn agora passa o filtro para a API
    queryFn: () => getAllProducts(debouncedSearch),
    // staleTime: 1000 * 60 * 5, // (Opcional) Cache de 5 min
  });

  useEffect(() => {
    if (saleFinalizedCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  }, [saleFinalizedCount, queryClient]);

  const { mutate: deleteProductMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      showNotification({
        title: 'Sucesso!',
        message: 'Produto removido.',
        color: 'green',
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      showNotification({
        title: 'Erro!',
        message: err.message || 'Não foi possível remover o produto.',
        color: 'red',
      });
    },
  });

  // Handlers
  const handleEdit = (id: string) => {
    router.push(`/backoffice/products/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    // (Implementação real do delete)
    deleteProductMutation(id);
  };

  // O 'columns' não estava sendo usado, foi removido.

  return (
    <>
      <Stack>
        <Group align="center" justify="space-between" mb="md">
          <Text size="xl" fw={700}>
            Produtos cadastrados
          </Text>
          <Button size="sm" onClick={() => router.push('/backoffice/products/create')}>
            Adicionar Produto
          </Button>
        </Group>

        {/* O filtro agora controla o 'searchTerm' local */}
        <ProductFilter
          applyFilter={(value) => {
            if (value.length > 2 || value === '') {
              setSearchTerm(value);
            }
          }}
        />

        {/* --- LÓGICA DE RENDERIZAÇÃO OTIMIZADA --- */}
        {isLoading && <ProductGridSkeleton />}

        {isError && (
          <Alert title="Erro ao Carregar" color="red" variant="light">
            {error?.message || 'Não foi possível buscar os produtos.'}
          </Alert>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <Text c="dimmed" ta="center" mt="xl">
            Nenhum produto encontrado.
          </Text>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <Grid gutter="xl">
            {/* NÃO PRECISA MAIS DE .filter() AQUI!
              A API já retorna os dados filtrados.
            */}
            {products.map((product) => (
              <Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 4, lg: 3 }} key={product._id}>
                <ProductCard
                  product={product}
                  handleEdit={handleEdit}
                  // handleDelete={handleDelete}
                  // isDeleting={isDeleting} // (Opcional: passe o loading para o card)
                />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </>
  );
}
