'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Center, Loader } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { CreateSupplierForm } from '@/forms/create-supplier-form';
import { getSupplierById, updateSupplier } from './supplier-service';
import { SupplierResponse } from './types/supplier';

export default function EditSupplier() {
  const { id } = useParams() as { id: string };

  const queryClient = useQueryClient();

  const {
    data: supplier,
    isLoading: isPageLoading,
    isError: fetchError,
  } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplierById(id),
    enabled: !!id, // Só executa a query se o 'id' existir
  });

  const { mutateAsync: updateSupplierMutation, isPending: isSaving } = useMutation({
    mutationFn: (values: SupplierResponse) => updateSupplier(id, values), // A função que faz o POST/PUT

    onSuccess: (updatedData) => {
      showNotification({
        title: 'Sucesso!',
        message: 'Fornecedor atualizado.',
        color: 'green',
      });
      queryClient.setQueryData(['supplier', id], updatedData);
    },
    onError: (error: any) => {
      showNotification({
        title: 'Erro!',
        message: error.message || 'Falha ao atualizar.',
        color: 'red',
      });
    },
  });

  const handleUpdateSupplier = async (values: any) => {
    await updateSupplierMutation(values);
  };

  if (isPageLoading) {
    return (
      <Center style={{ height: '400px' }}>
        <Loader />
      </Center>
    );
  }

  if (fetchError) {
    return (
      <Alert title="Erro" color="red" variant="light">
        Não foi possível carregar o fornecedor.
      </Alert>
    );
  }

  if (supplier) {
    return (
      <CreateSupplierForm
        initialValues={supplier}
        onSubmit={handleUpdateSupplier}
        resetOnSuccess={false}
        isSubmitting={isSaving}
      />
    );
  }

  return null;
}
