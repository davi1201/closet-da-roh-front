'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Button, Grid, Group, Stack, Text } from '@mantine/core';
import ProductCard from '@/components/shared/product-card';
import { useCartStore } from '@/store';
import ProductFilter from './product-filter';
import { getAllProducts } from './product-service';
import { ProductResponse } from './types/product';

export default function ListAllProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const searchLower = searchTerm.trim().toLowerCase();
  const saleFinalizedCount = useCartStore((state) => state.saleFinalizedCount);

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
  }, [saleFinalizedCount]);

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
        <ProductFilter applyFilter={setSearchTerm} />
        <Grid gutter="md">
          {products
            .filter((product) => {
              const nameMatches = product.name?.toLowerCase().includes(searchLower) ?? false;
              const codeMatches = product.code?.toLowerCase().includes(searchLower) ?? false;
              return searchLower === '' ? true : nameMatches || codeMatches;
            })
            .map((product) => (
              <Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 4, lg: 3 }} key={product._id}>
                <ProductCard product={product} handleEdit={handleEdit} />
              </Grid.Col>
            ))}
        </Grid>
      </Stack>
    </>
  );
}
