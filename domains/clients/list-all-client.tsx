'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconEye, IconPencil, IconTrash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Button, Group, Stack, Text } from '@mantine/core';
import { DataGrid } from '@/components/ui/data-grid';
import { getAllClients } from './client-service';
import { Client } from './types/client';

export default function ListAllClients() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);

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
    </>
  );
}
