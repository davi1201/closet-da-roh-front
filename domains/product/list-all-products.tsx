'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button, Card, Flex, Grid, Group, Image, Stack, Text } from '@mantine/core';
import { formatPrice } from '@/utils/formatters';
import ProductFilter from './product-filter';
import { getAllProducts } from './product-service';
import { ProductResponse } from './types/product';

export default function ListAllProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    getAllProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error('Erro ao buscar produtos:', error);
      });
  };

  const handleFilter = (searchTerm: string) => {};

  const handleEdit = (id: string) => {
    router.push(`/backoffice/products/edit/${id}`);
  };

  const handleView = (id: string) => {
    console.log(`Função: Navegar para detalhes do Produto ID: ${id}`);
  };

  const handleDelete = (id: string) => {
    console.log(`Função: Abrir modal de confirmação para Excluir o Produto ID: ${id}`);
  };

  const columns: ColumnDef<ProductResponse>[] = [
    {
      header: 'Nome',
      accessorKey: 'name',
    },
    {
      header: 'Descrição',
      accessorKey: 'description',
    },
    {
      header: 'Categoria',
      accessorKey: 'category',
    },
    {
      header: 'Fornecedor',
      accessorKey: 'supplier.name',
    },
    {
      header: 'Preço Compra',
      accessorKey: 'buy_price',
    },
    {
      header: 'Preço Venda',
      accessorKey: 'sale_price',
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

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
        <ProductFilter applyFilter={(term) => setSearchTerm(term)} />
        <Grid gutter="md">
          {products
            .filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((product) => (
              <Grid.Col span={{ base: 12, md: 4, lg: 3 }} key={product._id}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section>
                    <Image src={product.images[0].url} height={360} alt="Norway" />
                  </Card.Section>
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{product.name}</Text>
                    <Badge color="white" variant="light" size="lg" radius="xs">
                      {formatPrice(parseFloat(product.sale_price) / 100)}
                    </Badge>
                  </Group>
                  <Text size="md" c="dimmed">
                    {product.description}
                  </Text>

                  <Flex mt="md" gap="xs" align="center">
                    <Text size="md" c="dimmed">
                      Cor:
                    </Text>
                    <Badge variant="light" size="md" color={product.color || 'white'} radius="xs">
                      {product.color}
                    </Badge>
                  </Flex>
                  <Flex mt="md" gap="xs" align="center">
                    <Text size="md" c="dimmed">
                      Tamanho:
                    </Text>
                    <Badge variant="outline" size="md" color="white" radius="xs">
                      {product.size}
                    </Badge>
                  </Flex>

                  <Flex direction="column">
                    <Button variant="gradient" fullWidth mt="md" radius="md">
                      Condições de venda
                    </Button>

                    <Button
                      variant="filled"
                      color="yellow"
                      fullWidth
                      mt="md"
                      radius="md"
                      onClick={() => handleEdit(product._id)}
                    >
                      Editar
                    </Button>
                  </Flex>
                </Card>
              </Grid.Col>
            ))}
        </Grid>
      </Stack>
    </>
  );
}
