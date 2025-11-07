// --- Imports do Dayjs ---
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconCalendarPlus, IconNotes, IconShoppingBag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button, Group, Modal, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import ProductCard from '@/components/shared/product-card';
import { DataGrid } from '@/components/ui/data-grid';
import { getLikedProductsByClientId } from '../product/product-service';
import { ProductResponse } from '../product/types/product';
import { getAdminAppointments } from './appointment-service';

dayjs.locale('pt-br');
dayjs.extend(utc);

const statusColors: Record<string, string> = {
  confirmed: 'blue',
  completed: 'green',
  canceled: 'red',
};

export default function ListAllAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string>('');
  const [products, setProducts] = useState<ProductResponse[]>([]);

  const fetchLikedProducts = async (clientId: string) => {
    const likedProducts = await getLikedProductsByClientId(clientId);
    const products = likedProducts.map((item) => item.product);

    setProducts(products);
    setIsDetailModalOpen(true);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'client.name',
      header: 'Cliente',
      cell: ({ row }) => <Text>{row.original.client?.name || 'Cliente Não Informado'}</Text>,
    },
    {
      accessorKey: 'startTime',
      header: 'Início',
      cell: ({ row }) => (
        <Text>{dayjs(row.original.startTime).utc().format('DD/MM/YYYY, HH:mm:ss')}</Text>
      ),
    },
    {
      accessorKey: 'endTime',
      header: 'Término',
      cell: ({ row }) => (
        <Text>{dayjs(row.original.endTime).utc().format('DD/MM/YYYY, HH:mm:ss')}</Text>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge color={statusColors[row.original.status] || 'gray'} variant="light">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <Group>
          <Button
            leftSection={<IconShoppingBag size={14} />}
            variant="outline"
            size="xs"
            onClick={() => fetchLikedProducts(row.original.client._id)}
          >
            Produtos selecionados
          </Button>
          {/* <Button
            leftSection={<IconNotes size={14} />}
            onClick={() => {
              setIsDetailModalOpen(true);
              setSelectedNotes(row.original.notes || 'Nenhuma nota cadastrada.');
            }}
            variant="outline"
            size="xs"
          >
            Ver Notas
          </Button> */}
        </Group>
      ),
    },
  ];

  const fetchAppointments = async () => {
    await getAdminAppointments('2000-01-01', '2100-12-31').then((data) => {
      setAppointments(data);
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <>
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Text size="xl" fw={700}>
            Agendamentos cadastrados
          </Text>
          <Button
            size="sm"
            onClick={() => router.push('/backoffice/appointments/create')}
            leftSection={<IconCalendarPlus size={16} />}
          >
            Adicionar Agendamento
          </Button>
        </Group>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <DataGrid columns={columns} data={appointments} />
        </div>
      </Stack>

      <Modal
        size="lg"
        opened={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalhes do Agendamento"
      >
        <Stack mt="lg">
          <Text size="lg" fw={600}>
            Produtos Selecionados
          </Text>
          {products.length === 0 ? (
            <Text>Nenhum produto selecionado.</Text>
          ) : (
            <>
              <SimpleGrid cols={2} spacing="md">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    showVariations
                    isPublic={false}
                    showPrice
                    product={product}
                  />
                ))}
              </SimpleGrid>
            </>
          )}
        </Stack>
      </Modal>
    </>
  );
}
