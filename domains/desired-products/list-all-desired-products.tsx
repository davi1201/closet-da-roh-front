import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconEye } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button, Group, Image, Modal, SimpleGrid, Stack, Text } from '@mantine/core';
import { DataGrid } from '@/components/ui/data-grid';
import { getAllDesiredProducts } from './desired-products';
import { DesiredProductResponse, ImageObject } from './types';

export default function ListAllDesiredProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<DesiredProductResponse[]>([]);
  const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
  const [imagesToShow, setImagesToShow] = useState<ImageObject[]>([]);

  const columns: ColumnDef<DesiredProductResponse>[] = [
    {
      accessorKey: 'client.name',
      header: 'Nome do Cliente',
      cell: ({ row }) => <Text>{row.original.client?.name || 'Cliente Não Informado'}</Text>,
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      cell: ({ row }) => <Text>{row.original.description}</Text>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Data de Criação',
      cell: ({ row }) => <Text>{new Date(row.original.createdAt).toLocaleDateString()}</Text>,
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <Group>
          <Button
            leftSection={<IconEye size={14} />}
            onClick={() => {
              setIsProductDetailModalOpen(true);
              setImagesToShow(row.original.images);
            }}
          >
            Ver produtos selecionados
          </Button>
        </Group>
      ),
    },
  ];

  const fetchProducts = async () => {
    await getAllDesiredProducts().then((data) => {
      setProducts(data);
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Text size="xl" fw={700}>
            Produtos Desejados cadastrados
          </Text>
          <Button size="sm" onClick={() => router.push('/backoffice/desired-products/create')}>
            Adicionar Produto Desejado
          </Button>
        </Group>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <DataGrid columns={columns} data={products} />
        </div>
      </Stack>
      <Modal
        size="xl"
        opened={isProductDetailModalOpen}
        onClose={() => setIsProductDetailModalOpen(false)}
        title="Detalhes do Produto Desejado"
      >
        <Stack>
          {imagesToShow.length === 0 ? (
            <Text>Nenhuma imagem disponível.</Text>
          ) : (
            <SimpleGrid cols={3} spacing="md">
              {imagesToShow.map((image, index) => (
                <Image
                  key={index}
                  height={300}
                  src={image.url}
                  fit="cover"
                  alt={`Produto Desejado ${index + 1}`}
                />
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Modal>
    </>
  );
}
