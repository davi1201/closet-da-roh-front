'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Carousel } from '@mantine/carousel';
import {
  Alert,
  Card,
  Center,
  Chip,
  Flex,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { PRODUCT_CATEGORIES } from '@/constants/product-categories';
import { getAllProducts } from '../product-service';
import { ProductActionButton } from './components/product-button-action';
import { getClientByPhone, getProductsByClientId } from './public-products-service';

interface ProductWithSelection {
  _id: string;
  name: string;
  images: { url: string }[];
  isSelected: boolean;
  category: string;
}

export default function ListaAllPublicProducts() {
  const params = useParams();
  const phone = params.phone as string;

  const [selectedCategory, setSelectedCategory] = useState<string>('');

  console.log(
    phone !== undefined ? `Número de telefone: ${phone}` : 'Nenhum número de telefone fornecido'
  );

  const {
    data: client,
    isLoading: isLoadingClient,
    isError: isClientError,
  } = useQuery({
    queryKey: ['clientByPhone', phone],
    queryFn: () => getClientByPhone(phone),
    enabled: !!phone,
    retry: false,
  });

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useQuery<ProductWithSelection[]>({
    queryKey: ['productsForSelection', client?._id, phone],
    //@ts-ignore
    queryFn: () => {
      if (client?._id) {
        return getProductsByClientId(client._id);
      }
      // @ts-ignore
      return getAllProducts();
    },
    enabled: true,
  });

  const categories = useMemo(() => {
    if (!products) return [];
    // @ts-ignore
    const allCategories = products.map((p) => p.category);
    //@ts-ignore
    return [...new Set(allCategories.filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === '') {
      return products;
    }
    // @ts-ignore
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  if (isLoadingProducts) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  if (phone && isClientError) {
    return (
      <Center style={{ height: '100vh', padding: 'var(--mantine-spacing-lg)' }}>
        <Alert color="yellow" title="Aviso">
          Não foi possível identificar seu cadastro com este link. Você pode visualizar os produtos,
          mas não poderá selecioná-los.
        </Alert>
      </Center>
    );
  }

  if (isProductsError) {
    return (
      <Center style={{ height: '100vh' }}>
        <Alert color="red" title="Erro">
          Não foi possível carregar os produtos. Tente novamente mais tarde.
        </Alert>
      </Center>
    );
  }

  return (
    <Stack>
      {client ? (
        <>
          <Title order={2}>Olá, {client.name}!</Title>
          <Text>
            Selecione os produtos que você gostaria de ver na sua visita. Já pode marcar e desmarcar
            quantas vezes quiser.
          </Text>
        </>
      ) : (
        <>
          <Flex direction="column" align="center">
            <Title order={2}>Catálogo de Produtos</Title>
            <Text c="dimmed">
              {phone
                ? 'Aguardando identificação...'
                : 'Navegue pelo nosso catálogo de produtos disponíveis.'}
            </Text>
          </Flex>
        </>
      )}

      {isLoadingClient && phone && (
        <Alert color="blue" title="Carregando seus dados...">
          Identificando seu cadastro...
        </Alert>
      )}

      {categories.length > 0 && (
        // @ts-ignore
        <Chip.Group value={selectedCategory} onChange={(value) => setSelectedCategory(value || '')}>
          <Group justify="center" mt="md" mb="lg">
            <Chip value="" variant="outline" size="sm" radius="sm">
              Todas
            </Chip>
            {categories.map((category) => (
              <Chip key={category} value={category} variant="outline" size="sm" radius="sm">
                {PRODUCT_CATEGORIES.find((cat) => cat.value === category)?.label.toUpperCase() ||
                  category}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      )}

      <SimpleGrid cols={{ base: 1, sm: 3, md: 4, lg: 5 }} mt="lg">
        {
          // @ts-ignore
          filteredProducts.map((product: ProductWithSelection) => (
            <Card key={product._id} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Carousel height={360} withControls={product.images.length > 1}>
                  {product.images.map((image) => (
                    <Carousel.Slide key={image.url} style={{ cursor: 'pointer' }}>
                      <Image src={image.url} height={360} alt={product.name} fit="cover" />
                    </Carousel.Slide>
                  ))}
                </Carousel>
              </Card.Section>

              <Text fw={500} mt="md" size="sm" truncate="end">
                {product.name.toUpperCase()}
              </Text>

              <Text c="dimmed" size="xs" mt="xs" lineClamp={2}>
                {
                  //@ts-ignore
                  product?.description
                }
              </Text>

              <ProductActionButton product={product} client={client} />
            </Card>
          ))
        }
      </SimpleGrid>

      {
        // @ts-ignore
        filteredProducts.length === 0 && (
          <Center style={{ height: '200px' }}>
            <Text>Nenhum produto encontrado para esta categoria.</Text>
          </Center>
        )
      }
    </Stack>
  );
}
