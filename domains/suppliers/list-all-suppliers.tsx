'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Group, Stack, Table, TableData, Text } from '@mantine/core';
import { prepareSupplierTableData } from './list-actions';
import { getAllSuppliers } from './supplier-service';
import { SupplierResponse } from './types/supplier';

export default function ListAllSuppliers() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);

  const fetchSuppliers = async () => {
    getAllSuppliers()
      .then((data) => {
        setSuppliers(data);
      })
      .catch((error) => {
        console.error('Erro ao buscar fornecedores:', error);
      });
  };

  const handleEdit = (id: string) => {
    console.log(`Função: Abrir modal de edição para o Fornecedor ID: ${id}`);
  };

  const handleView = (id: string) => {
    console.log(`Função: Navegar para detalhes do Fornecedor ID: ${id}`);
  };

  const handleDelete = (id: string) => {
    console.log(`Função: Abrir modal de confirmação para Excluir o Fornecedor ID: ${id}`);
  };

  const tableData = useMemo(() => {
    return prepareSupplierTableData(suppliers, {
      onEdit: handleEdit,
      onView: handleView,
      onDelete: handleDelete,
    });
  }, [suppliers]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

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
            <Table variant="vertical" data={tableData} withRowBorders highlightOnHover />
          </div>
        </Stack>
      </Stack>
    </>
  );
}
