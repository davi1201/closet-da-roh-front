'use client';

import { useParams } from 'next/navigation';
import { IconCheck, IconCirclePlus } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Carousel } from '@mantine/carousel';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Image,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
// Importamos o service completo
import {
  getClientByPhone,
  getProductsByClientId,
  postInteraction,
  removeInteraction,
} from './public-products-service';

// Tipo para o produto (agora com isSelected)
interface ProductWithSelection {
  _id: string;
  name: string;
  images: { url: string }[];
  isSelected: boolean;
  // ... outros campos do produto
}

export default function ListaAllPublicProducts() {
  const params = useParams();
  const phone = params.phone as string;
  const queryClient = useQueryClient();

  // 1. Busca o Cliente
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

  // 2. Busca a lista de produtos JÁ MESCLADA (com 'isSelected')
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useQuery<ProductWithSelection[]>({
    queryKey: ['productsForSelection', client?._id],
    //@ts-ignore
    queryFn: () => getProductsByClientId(client._id),
    enabled: !!client?._id,
  });

  // 3. Mutação para MARCAR (Criar 'like')
  const selectMutation = useMutation({
    mutationFn: postInteraction,
    onSuccess: () => {
      // Invalida o cache para forçar o refetch e atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['productsForSelection', client?._id] });
    },
    // (Adicione onError para notificação de erro)
  });

  // 4. Mutação para DESMARCAR (Deletar 'like')
  const deselectMutation = useMutation({
    mutationFn: removeInteraction,
    onSuccess: () => {
      // Invalida o cache para forçar o refetch
      queryClient.invalidateQueries({ queryKey: ['productsForSelection', client?._id] });
    },
  });

  // 5. Handler de clique unificado
  const handleToggleSelect = (product: ProductWithSelection) => {
    if (!client) return;

    if (product.isSelected) {
      // Já está selecionado, então DESMARCA
      deselectMutation.mutate({
        clientId: client._id,
        productId: product._id,
      });
    } else {
      // Não está selecionado, então MARCA
      selectMutation.mutate({
        clientId: client._id,
        productId: product._id,
        interaction: 'liked',
      });
    }
  };

  // Verifica se alguma mutação está ocorrendo
  const isInteracting = selectMutation.isPending || deselectMutation.isPending;

  // --- Estados de Renderização (Loading, Erros) ---
  if (isLoadingClient || isLoadingProducts) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }
  if (isClientError) {
    return (
      <Center style={{ height: '100vh' }}>
        <Alert color="red" title="Link Inválido">
          Este link não é válido ou o cliente não foi encontrado.
        </Alert>
      </Center>
    );
  }
  if (!client) {
    return (
      <Center style={{ height: '100vh' }}>
        <Alert color="red" title="Erro">
          Não foi possível localizar os dados do cliente.
        </Alert>
      </Center>
    );
  }
  if (isProductsError) {
    return (
      <Center style={{ height: '100vh' }}>
        <Alert color="red" title="Erro">
          Não foi possível carregar os produtos.
        </Alert>
      </Center>
    );
  }

  // --- Renderização da Lista de Produtos ---
  return (
    <Stack style={{ padding: 'var(--mantine-spacing-lg)' }}>
      <Title order={2}>Olá, {client.name}!</Title>
      <Text>
        Selecione os produtos que você gostaria de ver na sua visita. Já pode marcar e desmarcar
        quantas vezes quiser.
      </Text>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} mt="lg">
        {
          //@ts-ignore
          products.map((product) => (
            <Card key={product._id} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Carousel height={360} withControls={product.images.length > 1}>
                  {
                    // @ts-ignore
                    product.images.map((image) => {
                      return (
                        <Carousel.Slide key={image.url} style={{ cursor: 'pointer' }}>
                          <Image src={image.url} height={360} alt={product.name} fit="cover" />
                        </Carousel.Slide>
                      );
                    })
                  }
                </Carousel>
              </Card.Section>

              <Text fw={500} mt="md" size="sm" truncate="end">
                {product.name.toUpperCase()}
              </Text>

              <Button
                fullWidth
                mt="md"
                radius="md"
                variant={product.isSelected ? 'light' : 'filled'}
                color={product.isSelected ? 'green' : 'blue'}
                leftSection={
                  product.isSelected ? <IconCheck size={16} /> : <IconCirclePlus size={16} />
                }
                onClick={() => handleToggleSelect(product)}
                loading={isInteracting} // Desativa todos os botões durante uma ação
              >
                {product.isSelected ? 'Selecionado' : 'Selecionar'}
              </Button>
            </Card>
          ))
        }
      </SimpleGrid>

      {
        //@ts-ignore
        products.length === 0 && (
          <Center style={{ height: '200px' }}>
            <Text>Nenhum produto encontrado no momento.</Text>
          </Center>
        )
      }
    </Stack>
  );
}
