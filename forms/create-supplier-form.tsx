import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { Button, Grid, Group, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { maskCnpj, maskPhone } from '@/utils/formatters';

interface CreateSupplierFormProps {
  onSubmit: (values: any) => Promise<void>;
  initialValues: any;
  resetOnSuccess?: boolean;
  isSubmitting?: boolean; // 1. Adicione a prop de loading
}

export function CreateSupplierForm({
  onSubmit,
  initialValues,
  resetOnSuccess = true,
  isSubmitting = false,
}: CreateSupplierFormProps) {
  const router = useRouter();

  const form = useForm({
    initialValues: initialValues,
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

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);

      form.reset();
    } catch (error) {
      console.error('Erro ao submeter o formulário:', error);
    }
  };

  useEffect(() => {
    form.setValues(initialValues);
  }, [initialValues]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: '100%' }}>
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              withAsterisk
              label="Nome do Fornecedor"
              placeholder="Digite o nome do fornecedor"
              {...form.getInputProps('name')}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="CNPJ"
              placeholder="Digite o CNPJ do fornecedor"
              value={maskCnpj(form.values.document_number)}
              onChange={(e) => form.setFieldValue('document_number', maskCnpj(e.target.value))}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="Email"
              placeholder="Digite o email do fornecedor"
              value={form.values.contact.email}
              onChange={(e) => form.setFieldValue('contact.email', e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <TextInput
              withAsterisk
              label="Pessoa de Contato"
              placeholder="Nome da pessoa de contato"
              value={form.values.contact.contact_person}
              onChange={(e) => form.setFieldValue('contact.contact_person', e.target.value)}
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
              value={form.values.contact.address.zip_code}
              onChange={(e) => form.setFieldValue('contact.address.zip_code', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="Rua"
              placeholder="Digite a rua"
              value={form.values.contact.address.street}
              onChange={(e) => form.setFieldValue('contact.address.street', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="Número"
              placeholder="Digite o número"
              value={form.values.contact.address.number}
              onChange={(e) => form.setFieldValue('contact.address.number', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="Cidade"
              placeholder="Digite a cidade"
              value={form.values.contact.address.city}
              onChange={(e) => form.setFieldValue('contact.address.city', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="Estado"
              placeholder="Digite o estado"
              value={form.values.contact.address.state}
              onChange={(e) => form.setFieldValue('contact.address.state', e.target.value)}
            />
          </Grid.Col>
        </Grid>

        <Text>Observações</Text>
        <Textarea
          withAsterisk
          rows={5}
          placeholder="Digite suas observações"
          value={form.values.notes}
          onChange={(e) => form.setFieldValue('notes', e.target.value)}
        />

        <Grid mt="md">
          <Grid.Col span={12}>
            <Group justify="flex-end">
              <Button
                variant="outline"
                color="gray"
                onClick={() => router.push('/backoffice/suppliers')}
              >
                <IconArrowLeft />
                Voltar
              </Button>
              <Button type="submit" loading={isSubmitting}>
                <IconDeviceFloppy />
                Salvar Fornecedor
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>
    </form>
  );
}
