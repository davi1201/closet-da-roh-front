'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Grid, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { saveClient } from '@/domains/clients/client-service';
import { Client } from '@/domains/clients/types/client';
import { maskPhone } from '@/utils/formatters';

interface ClientFormProps {
  initialValues?: Omit<Client, '_id'>;
}

export default function ClientForm({ initialValues }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<Omit<Client, '_id'>>({
    //@ts-ignore
    initialValues: {
      name: '',
      phoneNumber: '',
      profession: '',
      instagram: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
      },
      purchasingPower: 'medium',
      observations: '',
      desiredProducts: [],
      ...initialValues,
    },
    validate: {},
  });

  const handleSubmit = (values: Omit<Client, '_id'>) => {
    saveClient(values)
      .then(() => {
        form.reset();
        router.push('/backoffice/clients');
        notifications.show({
          title: 'Amor 😍😍😍',
          message: 'Cliente cadastrada, agora é com você minha linda, bora vender!',
          color: 'green',
        });
      })
      .catch((error) => {
        notifications.show({
          title: 'Vixi 😢😢😢',
          message: 'Deu ruim ao criar a cliente, procure seu marido urgente',
          color: 'red',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {/* @ts-ignore */}
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: '100%' }}>
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                withAsterisk
                label="Nome"
                placeholder="Nome"
                key={form.key('name')}
                {...form.getInputProps('name')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                withAsterisk
                label="Telefone"
                placeholder="Telefone"
                value={maskPhone(form.values.phoneNumber)}
                onChange={(event) => form.setFieldValue('phoneNumber', event.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Instagram"
                placeholder="Instagram"
                {...form.getInputProps('instagram')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Profissão"
                placeholder="Profissão"
                {...form.getInputProps('profession')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <TextInput
                label="CEP"
                placeholder="CEP"
                {...form.getInputProps('address.zip_code')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <TextInput label="Rua" placeholder="Rua" {...form.getInputProps('address.street')} />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 3 }}>
              <TextInput
                label="Cidade"
                placeholder="Cidade "
                {...form.getInputProps('address.city')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Estado"
                placeholder="Estado"
                {...form.getInputProps('address.state')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12 }}>
              <Textarea
                rows={8}
                label="Observações"
                placeholder="Observações sobre o cliente"
                {...form.getInputProps('observations')}
              />
            </Grid.Col>
          </Grid>

          <Grid mt="md">
            <Grid.Col span={12} style={{ textAlign: 'right' }}>
              <Button type="submit" loading={isLoading}>
                Salvar Cliente
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </>
  );
}
