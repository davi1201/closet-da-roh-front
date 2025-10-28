'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { IconCalendar } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Center,
  Chip,
  Flex,
  Grid,
  Group,
  Image,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import ProductCard from '@/components/shared/product-card';
import ProductsDetail from '@/components/shared/products-detail';
import { PRODUCT_CATEGORIES } from '@/constants/product-categories';
import { Client } from '@/domains/clients/types/client';
import { getAllProducts } from '../product-service';
import { ProductResponse } from '../types/product';
import { getClientByPhone, getProductsByClientId } from './public-products-service';

interface ProductWithSelection extends ProductResponse {
  isSelected?: boolean;
}

export default function ListaAllPublicProducts() {
  const params = useParams();
  const phone = params.phone as string | undefined;

  // Estados
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [productSelected, setProductSelected] = useState<ProductResponse | null>(null);
  const [isModalProductDetailsOpen, setIsModalProductDetailsOpen] = useState(false);
  const [selectedColorUrl, setSelectedColorUrl] = useState<string>('');

  // Query para buscar cliente
  const {
    data: client,
    isLoading: isLoadingClient,
    isError: isClientError,
  } = useQuery({
    queryKey: ['clientByPhone', phone],
    queryFn: () => getClientByPhone(phone!),
    enabled: !!phone,
    retry: false,
  }) as { data: Client | undefined; isLoading: boolean; isError: boolean };

  // Query para buscar produtos
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useQuery<ProductWithSelection[]>({
    queryKey: ['productsForSelection', client?._id || 'all'],
    queryFn: async () => {
      if (client?._id) {
        return getProductsByClientId(client._id);
      }
      return getAllProducts();
    },
    enabled: !phone || !!client || isClientError,
  });

  // Atualiza cor selecionada quando produto muda

  // Categorias únicas dos produtos
  const categories = useMemo(() => {
    if (!products.length) return [];

    const uniqueCategories = new Set(
      products.map((p) => p.category).filter((cat): cat is string => Boolean(cat))
    );

    return Array.from(uniqueCategories);
  }, [products]);

  // Produtos filtrados por categoria
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Handlers
  const handleProductSelect = (product: ProductResponse) => {
    setProductSelected(product);
    setIsModalProductDetailsOpen(true);
  };

  const handleModalClose = () => {
    setIsModalProductDetailsOpen(false);
    setProductSelected(null);
    setSelectedColorUrl('');
  };

  const getCategoryLabel = (categoryValue: string): string => {
    const category = PRODUCT_CATEGORIES.find((cat) => cat.value === categoryValue);
    return category?.label.toUpperCase() || categoryValue;
  };

  // Estados de carregamento e erro
  if (isLoadingProducts) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Carregando produtos...</Text>
        </Stack>
      </Center>
    );
  }

  if (phone && isClientError) {
    return (
      <Center h="100vh" p="lg">
        <Alert
          color="yellow"
          title="Aviso"
          maw={500}
          styles={{ message: { fontSize: 'var(--mantine-font-size-sm)' } }}
        >
          Não foi possível identificar seu cadastro com este link. Você pode visualizar os produtos,
          mas não poderá selecioná-los.
        </Alert>
      </Center>
    );
  }

  if (isProductsError) {
    return (
      <Center h="100vh" p="lg">
        <Alert color="red" title="Erro" maw={500}>
          Não foi possível carregar os produtos. Tente novamente mais tarde.
        </Alert>
      </Center>
    );
  }

  return (
    <Stack gap="lg" p={{ base: 'md', sm: 'xl' }}>
      {/* Header */}
      {client ? (
        <Stack gap="xs">
          <Title order={2}>Olá, {client.name}!</Title>
          <Text c="dimmed">
            Selecione os produtos que você gostaria de ver na sua visita. Você pode marcar e
            desmarcar quantas vezes quiser.
          </Text>
        </Stack>
      ) : (
        <Stack gap="xs" align="center">
          <Title order={2}>Catálogo de Produtos</Title>
          <Text c="dimmed" ta="center">
            {phone && isLoadingClient
              ? 'Identificando seu cadastro...'
              : 'Navegue pelo nosso catálogo de produtos disponíveis.'}
          </Text>
        </Stack>
      )}

      {/* Loading do cliente */}
      {isLoadingClient && phone && (
        <Alert color="blue" title="Carregando seus dados...">
          Identificando seu cadastro...
        </Alert>
      )}

      {/* Filtros de categoria */}
      {categories.length > 0 && (
        <Chip.Group
          value={selectedCategory}
          onChange={(value) =>
            setSelectedCategory(Array.isArray(value) ? value[0] || '' : value || '')
          }
        >
          <Group justify="center" mt="md" mb="lg" gap="xs">
            <Chip value="" variant="outline" size="sm" radius="sm">
              Todas
            </Chip>
            {categories.map((category) => (
              <Chip key={category} value={category} variant="outline" size="sm" radius="sm">
                {getCategoryLabel(category)}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      )}

      {/* Grid de produtos */}
      {filteredProducts.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing="md">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              showPrice={false}
              onSelect={handleProductSelect}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Center h={200}>
          <Text c="dimmed">
            {selectedCategory
              ? 'Nenhum produto encontrado para esta categoria.'
              : 'Nenhum produto disponível no momento.'}
          </Text>
        </Center>
      )}

      {/* Modal de detalhes do produto */}
      <ProductsDetail
        isOpen={isModalProductDetailsOpen}
        handleModalClose={handleModalClose}
        product={productSelected}
      />
    </Stack>
  );
}
