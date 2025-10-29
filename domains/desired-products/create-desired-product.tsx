'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Select, Stack, Textarea, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import ImageUploaderMantine from '@/components/ui/upload-file';
import useImageUploader, { ImageObject } from '@/hooks/use-image-uploader';
import { getAllClients } from '../clients/client-service';
import { Client } from '../clients/types/client';
import { saveDesiredProduct } from './desired-products';

export type DesiredProductFormValues = {
  client: string;
  images: string;
  description: string;
};

export function DesiredProductForm() {
  const [clients, setClients] = useState<Client[]>([]);
  const fetchClients = async () => {
    try {
      const clients = await getAllClients();
      setClients(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const form = useForm<DesiredProductFormValues>({
    initialValues: {
      client: '',
      description: '',
      images: '',
    },

    validate: {
      client: (value) => (value ? null : 'Você precisa selecionar um cliente'),
    },
  });

  const handleImagesChange = useCallback(
    (images: ImageObject[]) => {
      // @ts-ignore
      form.setFieldValue('images', images);
    },
    [form]
  );

  const imageUploader = useImageUploader({
    maxLimit: 5,
    onImagesChange: handleImagesChange,
  });

  const handleSubmit = async (values: DesiredProductFormValues) => {
    try {
      await saveDesiredProduct(values, imageUploader.files);
      notifications.show({
        title: 'Sucesso',
        message: 'Produto desejado salvo com sucesso!',
        color: 'green',
      });
      form.reset();
    } catch (error) {
      notifications.show({
        title: 'Erro',
        message: 'Ocorreu um erro ao salvar o produto desejado.',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <Box w="80%" mx="auto">
      <Title order={3} mb="lg">
        Cadastrar Produto Desejado
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="Cliente"
            placeholder="Selecione a cliente"
            data={clients.map((client) => ({ value: client._id, label: client.name }))}
            searchable
            withAsterisk
            {...form.getInputProps('client')}
          />

          <Textarea
            label="Descrição"
            placeholder="Descreva o produto que a cliente deseja (cor, tamanho, etc.)"
            rows={4}
            {...form.getInputProps('description')}
          />

          <ImageUploaderMantine {...imageUploader} />
          <div style={{ textAlign: 'right' }}>
            <Button type="submit" mt="md">
              Salvar
            </Button>
          </div>
        </Stack>
      </form>
    </Box>
  );
}
