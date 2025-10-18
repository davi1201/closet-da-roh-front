'use client';

import { useEffect, useState } from 'react';
import { Button, Grid, Select, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import BarcodeScanner from '@/components/ui/barcode-scanner';
import ImageUploaderMantine from '@/components/ui/upload-file';
import { PRODUCT_CATEGORIES } from '@/constants/product-categories';
import { PRODUCT_COLORS } from '@/constants/product-colors';
import { PRODUCT_SIZES } from '@/constants/product-sizes';
import { ProductImage } from '@/domains/product/types/product';
import { getAllSuppliers } from '@/domains/suppliers/supplier-service';
import { SupplierResponse } from '@/domains/suppliers/types/supplier';
import useImageUploader from '@/hooks/use-image-uploader';
import { maskCurrency } from '@/utils/formatters';

export interface ProductFormValues {
  _id?: string; // Opcional, usado para edição
  code: string;
  name: string;
  description: string;
  color: string | null;
  size: string | null;
  buy_price: string;
  sell_price: string;
  category: string | null;
  supplier_id: string | null;
  images: ProductImage[];
}

interface ProductFormProps {
  initialValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues, files: File[]) => void;
  isLoading?: boolean;
  saveAndCopy?: boolean;
}

export default function ProductForm({
  initialValues,
  onSubmit,
  isLoading = false,
  saveAndCopy = false,
}: ProductFormProps) {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [isImagesInitialized, setIsImagesInitialized] = useState(false); // NOVO ESTADO
  const [openScanner, setOpenScanner] = useState(false);

  const form = useForm<ProductFormValues>({
    initialValues: {
      name: '',
      code: '',
      description: '',
      color: null,
      size: null,
      buy_price: '',
      sell_price: '',
      category: null,
      supplier_id: null,
      images: [],
      ...initialValues,
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Nome muito curto' : null),
      description: (value) => (value.length < 5 ? 'Descrição muito curta' : null),
      color: (value) => (value ? null : 'Selecione uma cor'),
      size: (value) => (value ? null : 'Selecione um tamanho'),
      buy_price: (value) => (Number(value.replace(/[^\d.-]/g, '')) <= 0 ? 'Preço inválido' : null),
      sell_price: (value) => (Number(value.replace(/[^\d.-]/g, '')) <= 0 ? 'Preço inválido' : null),
      category: (value) => (value ? null : 'Selecione uma categoria'),
      supplier_id: (value) => (value ? null : 'Selecione um fornecedor'),
    },
  });

  const imageUploader = useImageUploader(5);

  const fetchSuppliers = async () => {
    getAllSuppliers()
      .then((data) => {
        setSuppliers(data);
      })
      .catch((error) => {
        console.error('Erro ao buscar fornecedores:', error);
      });
  };

  const handleSubmit = (values: ProductFormValues) => {
    onSubmit(values, imageUploader.files);

    if (saveAndCopy) {
      form.setFieldValue('color', null);
      form.setFieldValue('size', null);
    } else {
      form.reset();
      imageUploader.reset();
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    // 🚨 A nova condição CRÍTICA: Roda APENAS se houver valores iniciais E AINDA NÃO tiver sido inicializado.
    if (initialValues?.images && initialValues.images.length > 0 && !isImagesInitialized) {
      const imageObjects = initialValues.images.map((img) => ({
        id: img._id,
        previewUrl: img.url,
      }));

      imageUploader.setInitialImages(imageObjects);
      setIsImagesInitialized(true); // Marca como inicializado para evitar repetição
    }
  }, [initialValues?.images, isImagesInitialized, imageUploader]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: '100%' }}>
      <Stack gap="md">
        <Grid>
          {/* <Grid.Col span={12}>
            <Button onClick={() => setOpenScanner(true)}>Abrir Scanner</Button>
            {openScanner && (
              <BarcodeScanner
                onDetected={(value) => window.alert(`Código detectado: ${value}`)}
                onClose={() => setOpenScanner(false)}
              />
            )}
          </Grid.Col> */}
          <Grid.Col span={{ base: 12, md: 2 }}>
            <TextInput
              withAsterisk
              label="Código"
              placeholder="Código do produto"
              {...form.getInputProps('code')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <TextInput
              withAsterisk
              label="Nome"
              placeholder="Nome do produto"
              {...form.getInputProps('name')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <TextInput
              withAsterisk
              label="Descrição"
              placeholder="Descrição resumida"
              {...form.getInputProps('description')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Fornecedor"
              placeholder="Selecione o fornecedor"
              data={suppliers.map((s) => ({ value: s._id, label: s.name }))}
              {...form.getInputProps('supplier_id')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Select
              withAsterisk
              label="Cor"
              placeholder="Selecione a cor"
              data={PRODUCT_COLORS}
              {...form.getInputProps('color')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Select
              withAsterisk
              label="Tamanho"
              placeholder="Selecione o tamanho"
              data={PRODUCT_SIZES}
              {...form.getInputProps('size')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Select
              withAsterisk
              label="Categoria"
              placeholder="Selecione a categoria"
              data={PRODUCT_CATEGORIES}
              {...form.getInputProps('category')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              withAsterisk
              label="Preço de Venda"
              placeholder="R$ 0,00"
              {...form.getInputProps('sell_price')}
              onChange={(e) => form.setFieldValue('sell_price', maskCurrency(e.target.value))}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              withAsterisk
              label="Preço de Compra"
              placeholder="R$ 0,00"
              {...form.getInputProps('buy_price')}
              onChange={(e) => form.setFieldValue('buy_price', maskCurrency(e.target.value))}
            />
          </Grid.Col>
        </Grid>

        <div style={{ marginTop: '40px' }}>
          <Text>Upload de Imagens</Text>
          <ImageUploaderMantine {...imageUploader} />
        </div>

        <Grid mt="md">
          <Grid.Col span={12} style={{ textAlign: 'right' }}>
            <Button type="submit" loading={isLoading}>
              Salvar Produto
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>
    </form>
  );
}
