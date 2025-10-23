'use client';

import { useRouter } from 'next/navigation';
import { Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CreateSupplierForm } from '@/forms/create-supplier-form';
import { saveSupplier } from './supplier-service';

export default function CreateSupplier() {
  const router = useRouter();

  const INITIAL_VALUES = {
    name: '',
    contact_person: '',
    phone: '',
    document_type: 'CNPJ',
    document_number: '',
    contact: {
      contact_person: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
      },
    },
    notes: '',
  };

  const handleCreateSupplier = async (values: any) => {
    saveSupplier(values)
      .then(() => {
        notifications.show({
          title: 'Amor 😍😍😍',
          message: 'Fornecedor salvo com sucesso! Peça desconto ao comprar 😉',
          color: 'green',
        });
        router.push('/backoffice/suppliers');
      })
      .catch((error) => {
        notifications.show({
          title: 'Vish 😢😢😢',
          message:
            'Deu ruim ao salvar o fornecedor, procure o seu marido que fez esse sistema super top',
          color: 'red',
        });
        console.error('Erro ao salvar fornecedor:', error);
      });
  };

  return (
    <>
      <Text size="xl" fw={700} mb="md">
        Cadastrar Fornecedor
      </Text>

      <CreateSupplierForm onSubmit={handleCreateSupplier} initialValues={INITIAL_VALUES} />
    </>
  );
}
