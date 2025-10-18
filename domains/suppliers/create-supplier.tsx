'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { Button, Grid, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { maskPhone } from '@/utils/formatters';
import { saveSupplier } from './supplier-service';

export default function CreateSupplier() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
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
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Nome muito curto' : null),
      contact: {
        contact_person: (value) =>
          value.length < 2 ? 'Nome da pessoa de contato muito curto' : null,
        phone: (value) => (value.length < 8 ? 'Telefone inválido' : null),
      },
      notes: (value) => (value.length > 500 ? 'Máximo de 500 caracteres' : null),
    },
  });

  const handleCreateSupplier = (values: typeof form.values) => {
    setIsLoading(true);

    saveSupplier(values)
      .then(() => {
        form.reset();

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
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Text size="xl" fw={700} mb="md">
        Cadastrar Fornecedor
      </Text>

      <form
        onSubmit={form.onSubmit((values) => handleCreateSupplier(values))}
        style={{ width: '100%' }}
      >
        <Stack gap="md">
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                withAsterisk
                label="Nome do Fornecedor"
                placeholder="Digite o nome do fornecedor"
                key={form.key('name')}
                {...form.getInputProps('name')}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="CNPJ"
                placeholder="Digite o CNPJ do fornecedor"
                key={form.key('document_number')}
                {...form.getInputProps('document_number')}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="Email"
                placeholder="Digite o email do fornecedor"
                key={form.key('contact.email')}
                {...form.getInputProps('contact.email')}
              />
            </Grid.Col>

            <Grid.Col span={4}>
              <TextInput
                withAsterisk
                label="Pessoa de Contato"
                placeholder="Nome da pessoa de contato"
                key={form.key('contact.contact_person')}
                {...form.getInputProps('contact.contact_person')}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                withAsterisk
                label="Telefone"
                placeholder="(99) 99999-9999"
                value={maskPhone(form.values.contact.phone)}
                onChange={(e) => form.setFieldValue('contact.phone', maskPhone(e.target.value))}
              />
            </Grid.Col>
          </Grid>

          <Text>Endereço</Text>
          <Grid>
            <Grid.Col span={2}>
              <TextInput
                label="CEP"
                placeholder="Digite o CEP"
                key={form.key('contact.address.zip_code')}
                {...form.getInputProps('contact.address.zip_code')}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="Rua"
                placeholder="Digite a rua"
                key={form.key('contact.address.street')}
                {...form.getInputProps('contact.address.street')}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="Número"
                placeholder="Digite o número"
                key={form.key('contact.address.number')}
                {...form.getInputProps('contact.address.number')}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="Cidade"
                placeholder="Digite a cidade"
                key={form.key('contact.address.city')}
                {...form.getInputProps('contact.address.city')}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="Estado"
                placeholder="Digite o estado"
                key={form.key('contact.address.state')}
                {...form.getInputProps('contact.address.state')}
              />
            </Grid.Col>
          </Grid>

          <Text>Observações</Text>
          <Textarea
            withAsterisk
            rows={5}
            placeholder="Digite suas observações"
            key={form.key('notes')}
            {...form.getInputProps('notes')}
          />

          <Grid mt="md">
            <Grid.Col span={12} style={{ textAlign: 'right' }}>
              <Button type="submit" loading={isLoading}>
                <IconDeviceFloppy />
                Salvar Fornecedor
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </>
  );
}
