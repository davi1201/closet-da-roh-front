'use client';

// 1. Removemos 'useEffect' e 'useState'
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { IconEye, IconPencil, IconTrash } from '@tabler/icons-react';
// 2. Importamos 'useQuery'
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
// 3. Importamos componentes para os estados de loading e erro
import { ActionIcon, Alert, Button, Center, Group, Loader, Stack, Text } from '@mantine/core';
import { DataGrid } from '@/components/ui/data-grid';
import { maskPhone } from '@/utils/formatters';
import { prepareSupplierTableData } from './list-actions';
import { getAllSuppliers } from './supplier-service';
import { SupplierResponse } from './types/supplier';

export default function ListAllSuppliers() {
  const router = useRouter();

  // 4. (Opcional, mas recomendado) Envolvemos as colunas em 'useMemo'
  //    para otimizar a performance do DataGrid (react-table)
  const columns: ColumnDef<SupplierResponse>[] = useMemo(
    () => [
      {
        header: 'Nome',
        accessorKey: 'name',
      },
      {
        header: 'Vendedora',
        accessorKey: 'contact.contact_person',
      },
      {
        header: 'Telefone',
        accessorKey: 'contact.phone',
        cell: ({ row }) => maskPhone(row.original.contact.phone),
      },
      {
        header: 'Observações',
        accessorKey: 'notes',
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
              onClick={() => router.push(`/backoffice/suppliers/edit/${row.original._id}`)}
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
    ],
    [router]
  ); // 'router' é uma dependência porque é usado no onClick

  // 5. Removemos 'useState', 'useEffect' e 'fetchSuppliers'

  // 6. Adicionamos o 'useQuery'
  const {
    data: suppliers = [], // 'data' é o seu array. Damos um default de []
    isLoading, // Estado de carregamento
    isError, // Estado de erro
    error, // O objeto de erro, se houver
  } = useQuery({
    queryKey: ['suppliers'], // Chave única para esta query (caching)
    queryFn: getAllSuppliers, // A função que busca os dados
  });

  // 7. Lidamos com o estado de carregamento
  if (isLoading) {
    return (
      <Center style={{ height: '300px' }}>
        <Loader />
      </Center>
    );
  }

  // 8. Lidamos com o estado de erro
  if (isError) {
    return (
      <Alert title="Erro ao carregar" color="red" variant="light">
        Não foi possível buscar a lista de fornecedores. Por favor, tente novamente mais tarde.
        {error?.message && (
          <Text size="sm" mt="xs">
            Detalhe: {error.message}
          </Text>
        )}
      </Alert>
    );
  }

  // 9. O return original agora é o "estado de sucesso"
  return (
    <>
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Text size="xl" fw={700}>
            Fornecedores cadastrados
          </Text>
          <Button size="sm" onClick={() => router.push('/backoffice/suppliers/create')}>
            Adicionar Fornecedor
          </Button>
        </Group>

        <Stack>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid columns={columns} data={suppliers} />
          </div>
        </Stack>
      </Stack>
    </>
  );
}
