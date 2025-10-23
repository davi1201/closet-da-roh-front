'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconEye, IconHeart, IconPencil, IconTrash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  ActionIcon,
  Button,
  Card,
  CopyButton,
  Grid,
  Group,
  Image,
  Modal,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DataGrid } from '@/components/ui/data-grid';
import { getProductsByClientId } from '../product/public/public-products-service';
import { getAllClients } from './client-service';
import { Client } from './types/client';

export default function ListAllClients() {
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure();
  const [clients, setClients] = useState<Client[]>([]);
  const [productsSelecteds, setProductsSelecteds] = useState<any[]>([]);

  const fetchProductsSelecteds = async (clientId: string) => {
    getProductsByClientId(clientId)
      .then((products) => {
        setProductsSelecteds(products);
        toggle();
      })
      .catch((error) => {
        console.error('Erro ao buscar produtos do cliente:', error);
      });
  };

  const fetchClients = async () => {
    try {
      const clients = await getAllClients();
      setClients(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const columns: ColumnDef<Client>[] = [
    {
      header: 'Nome',
      accessorKey: 'name',
      cell: ({ row }) => <Text>{row.original.name.toUpperCase()}</Text>,
    },
    {
      header: 'Telefone',
      accessorKey: 'phoneNumber',
    },
    {
      header: 'Link',
      accessorKey: 'referralLink',
      cell: ({ row }) => {
        return (
          <CopyButton value={row.original.products_url}>
            {({ copied, copy }) => (
              <Button variant="outline" color={copied ? 'teal' : 'blue'} onClick={copy}>
                {copied ? 'Copiado' : 'Copiar url'}
              </Button>
            )}
          </CopyButton>
        );
      },
    },
    {
      header: 'Instagram',
      accessorKey: 'instagram',
    },
    {
      header: 'Profissão',
      accessorKey: 'profession',
    },
    {
      header: 'Poder Aquisitivo',
      accessorKey: 'purchasingPower',
    },
    {
      header: 'Ações',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => fetchProductsSelecteds(row.original._id)}
            title="Visualizar detalhes"
          >
            <IconHeart size={18} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => console.log(`Visualizar detalhes do Cliente ID: ${row.original._id}`)}
            title="Visualizar detalhes"
          >
            <IconEye size={18} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => console.log(`Editar Cliente ID: ${row.original._id}`)}
            title="Editar fornecedor"
          >
            <IconPencil size={18} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => console.log(`Excluir Cliente ID: ${row.original._id}`)}
            title="Excluir fornecedor"
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <>
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Text size="xl" fw={700}>
            Clientes cadastrados
          </Text>
          <Button size="sm" onClick={() => router.push('/backoffice/clients/create')}>
            Adicionar Cliente
          </Button>
        </Group>

        <Stack>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid columns={columns} data={clients} />
          </div>
        </Stack>
      </Stack>
      <Modal opened={opened} onClose={toggle} size="xl" title="Produtos Selecionados pelo Cliente">
        {productsSelecteds.length === 0 ? (
          <Text>Nenhum produto selecionado por este cliente.</Text>
        ) : (
          <Stack>
            <Grid>
              {productsSelecteds.map((product) => (
                <Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 6, lg: 6 }} key={product._id}>
                  <Card key={product._id} shadow="sm" padding="lg" radius="md" withBorder>
                    <Card.Section>
                      <Image
                        src={product.images[0]?.url}
                        height={160}
                        alt={product.name}
                        fit="contain"
                      />
                    </Card.Section>

                    <Card.Section p="md">
                      <Text fw={500} size="sm" truncate="end">
                        {product.name}
                      </Text>
                    </Card.Section>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        )}
      </Modal>
    </>
  );
}
