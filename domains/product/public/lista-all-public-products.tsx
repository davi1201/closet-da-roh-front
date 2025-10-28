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
  useEffect(() => {
    if (productSelected?.images?.length) {
      setSelectedColorUrl(productSelected.images[0].url);
    } else {
      setSelectedColorUrl('');
    }
  }, [productSelected]);

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
      <Modal
        opened={isModalProductDetailsOpen}
        onClose={handleModalClose}
        title="Detalhes do Produto"
        size="xl"
        centered
        padding="lg"
      >
        {productSelected && (
          <Grid gutter="lg">
            {/* Imagem principal */}
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Image
                src={selectedColorUrl}
                h={500}
                fit="contain"
                radius="md"
                alt={productSelected.name}
                fallbackSrc="https://via.placeholder.com/500x500.png?text=Sem+Imagem"
              />
            </Grid.Col>

            {/* Informações do produto */}
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack gap="md">
                <Title order={3}>{productSelected.name}</Title>

                {productSelected.description && (
                  <Text c="dimmed" size="sm" lineClamp={4}>
                    {productSelected.description}
                  </Text>
                )}

                {/* Seletor de cores */}
                {productSelected.images?.length > 0 && (
                  <Box>
                    <Text fw={500} size="sm" mb="xs">
                      Cores disponíveis ({productSelected.images.length}):
                    </Text>
                    <SimpleGrid cols={3} spacing="xs">
                      {productSelected.images.map((image) => (
                        <Box
                          key={image.url}
                          onClick={() => setSelectedColorUrl(image.url)}
                          style={{
                            cursor: 'pointer',
                            borderRadius: 'var(--mantine-radius-sm)',
                            overflow: 'hidden',
                            border: `3px solid ${
                              selectedColorUrl === image.url
                                ? 'var(--mantine-color-blue-6)'
                                : 'transparent'
                            }`,
                            transition: 'all 0.2s ease',
                          }}
                          bg={selectedColorUrl === image.url ? 'gray.1' : 'transparent'}
                        >
                          <Image
                            src={image.url}
                            h={80}
                            alt={`${productSelected.name} - variação`}
                            fit="contain"
                            radius="xs"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {/* Botão de agendar */}
                <Button
                  variant="gradient"
                  fullWidth
                  mt="md"
                  leftSection={<IconCalendar size={16} />}
                >
                  Agendar visita
                </Button>
              </Stack>
            </Grid.Col>
          </Grid>
        )}
      </Modal>
    </Stack>
  );
}
