'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Grid, Group, Modal, Skeleton, Stack, Text } from '@mantine/core';
import { useDebouncedValue, useToggle } from '@mantine/hooks'; // Hook para evitar spam na API
import { showNotification } from '@mantine/notifications'; // Para feedback

import AddCartProduct from '@/components/shared/add-product-cart';
import ProductCard from '@/components/shared/product-card';
import ProductsDetail from '@/components/shared/products-detail';
import { useCartStore } from '@/store';
import { useAppStore } from '@/store/app/use-app-store';
import ProductAdminActionButtons from './components/product-admin-actions';
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
  const [productSelected, setProductSelected] = useState<ProductResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isModalProductDetailsOpen, setIsModalProductDetailsOpen] = useState(false);

  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const saleFinalizedCount = useCartStore((state) => state.saleFinalizedCount);

  const mode = useAppStore((state) => state.mode);
  const toggleMode = useAppStore((state) => state.toggleMode);

  const {
    data: products = [], // Valor padrão para evitar erros
    isLoading,
    isError,
    error,
  } = useQuery<ProductResponse[], Error>({
    queryKey: ['products', debouncedSearch],

    queryFn: () => getAllProducts(debouncedSearch),
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

  const handleEdit = (id: string) => {
    router.push(`/backoffice/products/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteProductMutation(id);
  };

  return (
    <>
      <Stack>
        <Group align="center" justify="space-between" mb="md">
          <Text size="xl" fw={700}>
            Produtos cadastrados
          </Text>
          <Group gap="sm">
            {mode === 'admin' && (
              <Button size="sm" onClick={() => router.push('/backoffice/products/create')}>
                Adicionar Produto
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => toggleMode()}>
              {mode === 'admin' ? 'Modo Venda' : 'Modo Admin'}
            </Button>
          </Group>
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
            {products.map((product) => (
              <Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 4, lg: 3 }} key={product._id}>
                <ProductCard
                  product={product}
                  onSelect={(product) => {
                    setProductSelected(product);
                    setModalOpen(true);
                  }}
                >
                  <ProductAdminActionButtons
                    productId={product._id}
                    handleEdit={handleEdit}
                    onDetail={() => {
                      setProductSelected(product);
                      setIsModalProductDetailsOpen(true);
                    }}
                    addToCart={() => {
                      setProductSelected(product);
                      setModalOpen(true);
                    }}
                  />
                </ProductCard>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>

      <ProductsDetail
        isOpen={isModalProductDetailsOpen}
        handleModalClose={() => setIsModalProductDetailsOpen(false)}
        product={productSelected}
      />

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={productSelected?.name}>
        {productSelected && (
          <AddCartProduct
            isProductOutOfStock={false}
            onClose={() => setModalOpen(false)}
            product={{
              _id: productSelected._id,
              name: productSelected.name,
              description: productSelected.description,
              images: productSelected.images,
              variant: productSelected.variants[0],
            }}
          />
        )}
      </Modal>
    </>
  );
}
