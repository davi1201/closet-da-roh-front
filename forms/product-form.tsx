'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Grid, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core'; // Adicionado NumberInput
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { ImageGenerator } from '@/components/image-generator/image-generator';
import BarcodeScannerIOSFallback from '@/components/ui/barcode-scanner';
import ImageUploaderMantine from '@/components/ui/upload-file';
import { PRODUCT_CATEGORIES } from '@/constants/product-categories';
import { PRODUCT_COLORS } from '@/constants/product-colors';
import { PRODUCT_SIZES } from '@/constants/product-sizes';
import { ProductImage } from '@/domains/product/types/product';
import { getAllSuppliers } from '@/domains/suppliers/supplier-service';
import { SupplierResponse } from '@/domains/suppliers/types/supplier';
import useImageUploader, { ImageObject } from '@/hooks/use-image-uploader';
import { maskCurrency } from '@/utils/formatters';

// --- Constantes de Tecido ---
const FABRIC_OPTIONS = [
  { value: 'Linho', label: 'Linho' },
  { value: 'Algodão', label: 'Algodão' },
  { value: 'Viscose', label: 'Viscose' },
  { value: 'Elastano', label: 'Elastano' },
  { value: 'Poliester', label: 'Poliéster' },
  { value: 'Poliamida', label: 'Poliamida' },
  { value: 'Seda', label: 'Seda' },
  { value: 'Couro', label: 'Couro' },
  { value: 'Cetim', label: 'Cetim' },
  { value: 'Jeans', label: 'Jeans' },
  { value: 'Liocel', label: 'Liocel' },
  { value: 'Modal', label: 'Modal' },
  { value: 'Rayon', label: 'Rayon' },
  { value: 'Microfibra', label: 'Microfibra' },
  { value: 'Sarja', label: 'Sarja' },
  { value: 'Velcro', label: 'Velcro' },
  { value: 'Veludo', label: 'Veludo' },
];

// --- Interfaces Atualizadas ---
export interface FabricComposition {
  fabric: string | null;
  percentage: string; // Usar string para o NumberInput
}

export interface ProductVariant {
  _id?: string;
  size: string | null;
  color: string | null;
  buy_price: string;
  sale_price: string;
  quantity?: number | null;
  minimum_stock?: number | null;
  sku?: string | null;
}

export interface ProductFormValues {
  _id?: string;
  code: string;
  name: string;
  description: string; // Este campo será gerado automaticamente
  category: string | null;
  images: ProductImage[];
  supplier_id: string | null;
  variants: ProductVariant[];
  fabric_composition: FabricComposition[]; // Novo campo para o formulário
}

interface ProductFormProps {
  initialValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues, files: File[]) => Promise<void>;
  isLoading: boolean;
}

// --- Componente de Item de Variante (Sem alteração) ---
interface ProductVariantItemProps {
  listKey: 'variants';
  index: number;
  form: any;
  availableColors: typeof PRODUCT_COLORS;
  availableSizes: typeof PRODUCT_SIZES;
  profitMargin: string;
}

const ProductVariantItem = ({
  form,
  listKey,
  index,
  availableColors,
  availableSizes,
  profitMargin,
}: ProductVariantItemProps) => {
  const handleBuyPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    const maskedBuyPrice = maskCurrency(rawValue);
    form.setFieldValue(`${listKey}.${index}.buy_price`, maskedBuyPrice);

    const onlyDigits = rawValue.replace(/[^\d]/g, '');

    const numericBuyPriceInCents = parseFloat(onlyDigits);

    if (!isNaN(numericBuyPriceInCents)) {
      const numericSalePrice = numericBuyPriceInCents * parseFloat(profitMargin);

      form.setFieldValue(`${listKey}.${index}.sale_price`, maskCurrency(numericSalePrice));
    } else {
      form.setFieldValue(`${listKey}.${index}.sale_price`, '');
    }
  };
  return (
    <>
      <Grid key={index} align="flex-end">
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Select
            withAsterisk
            label="Cor"
            placeholder="Selecione a cor"
            data={PRODUCT_COLORS.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))}
            {...form.getInputProps(`${listKey}.${index}.color`)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Select
            withAsterisk
            label="Tamanho"
            placeholder="Tamanho"
            data={PRODUCT_SIZES}
            {...form.getInputProps(`${listKey}.${index}.size`)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <TextInput
            withAsterisk
            label="Preço Compra"
            inputMode="numeric"
            placeholder="R$ 0,00"
            {...form.getInputProps(`${listKey}.${index}.buy_price`)}
            onChange={handleBuyPriceChange}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <TextInput
            disabled
            withAsterisk
            label="Preço Venda"
            placeholder="R$ 0,00"
            {...form.getInputProps(`${listKey}.${index}.sale_price`)}
          />
        </Grid.Col>
      </Grid>
      <Grid
        key={index + 1}
        align="flex-end"
        style={{
          borderBottom: '1px dashed var(--mantine-color-gray-3)',
          paddingBottom: '16px',
        }}
      >
        <Grid.Col span={{ base: 12, sm: 2 }}>
          <TextInput
            withAsterisk
            label="Quantidade"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={form.values[listKey][index]?.quantity ?? ''}
            onChange={(e) => form.setFieldValue(`${listKey}.${index}.quantity`, e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 2 }}>
          <TextInput
            withAsterisk
            label="Estoque Mínimo"
            type="number"
            inputMode="numeric"
            placeholder="0"
            {...form.getInputProps(`${listKey}.${index}.minimum_stock`)}
            value={form.values[listKey][index]?.minimum_stock ?? ''}
            onChange={(e) =>
              form.setFieldValue(`${listKey}.${index}.minimum_stock`, e.target.value)
            }
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 1 }}>
          <Button
            variant="outline"
            color="red"
            fullWidth
            onClick={() => {
              form.removeListItem(listKey, index);
            }}
          >
            Remover
          </Button>
        </Grid.Col>
      </Grid>
    </>
  );
};

// --- Novo Componente para Item de Composição de Tecido ---
interface FabricCompositionItemProps {
  listKey: 'fabric_composition';
  index: number;
  form: any;
  onRemove: () => void;
}

const FabricCompositionItem = ({ form, listKey, index, onRemove }: FabricCompositionItemProps) => {
  return (
    <Grid key={index} align="flex-end" gutter="xs">
      <Grid.Col span={7}>
        <Select
          label={index === 0 ? 'Tecido' : undefined}
          placeholder="Selecione o tecido"
          data={FABRIC_OPTIONS}
          searchable
          {...form.getInputProps(`${listKey}.${index}.fabric`)}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <NumberInput
          label={index === 0 ? 'Porcentagem' : undefined}
          placeholder="%"
          suffix="%"
          min={0}
          max={100}
          {...form.getInputProps(`${listKey}.${index}.percentage`)}
        />
      </Grid.Col>
      <Grid.Col span={2}>
        <Button
          variant="outline"
          color="red"
          fullWidth
          onClick={onRemove}
          style={{ marginTop: index === 0 ? '25px' : '0' }}
        >
          Remover
        </Button>
      </Grid.Col>
    </Grid>
  );
};

// --- Componente Principal do Formulário ---
export default function ProductForm({ initialValues, onSubmit, isLoading }: ProductFormProps) {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [isImagesInitialized, setIsImagesInitialized] = useState(false);
  const [profitMargin, setProfitMargin] = useState('2.0');

  const PROFIT_MARGIN_OPTIONS = [
    { label: '100%', value: '2' },
    { label: '150%', value: '2.5' },
    { label: '200%', value: '3' },
    { label: '250%', value: '3.5' },
    { label: '300%', value: '4' },
  ];

  // Função para "ler" a descrição e preencher os campos de tecido (para edição)
  const parseDescriptionToFabrics = (desc: string): FabricComposition[] => {
    if (!desc || !desc.startsWith('Tecido ')) {
      return [{ fabric: null, percentage: '' }];
    }
    try {
      const parts = desc.replace('Tecido ', '').split(' | ');
      const composition = parts.map((part) => {
        const match = part.match(/([\d.]+)% (.*)/);
        if (match) {
          const percentage = match[1];
          const fabric = match[2];
          if (FABRIC_OPTIONS.some((f) => f.value === fabric)) {
            return { fabric, percentage };
          }
        }
        return null;
      });

      const validComposition = composition.filter((c) => c !== null) as FabricComposition[];
      return validComposition.length > 0 ? validComposition : [{ fabric: null, percentage: '' }];
    } catch (e) {
      console.error('Erro ao parsear descrição:', e);
      return [{ fabric: null, percentage: '' }];
    }
  };

  const form = useForm<ProductFormValues>({
    initialValues: {
      name: '',
      code: '',
      description: '', // Será sobreescrito pelo useEffect
      category: null,
      supplier_id: null,
      images: [],
      variants: [
        {
          size: null,
          color: null,
          buy_price: '',
          sale_price: '',
          quantity: 1,
          minimum_stock: 0,
        },
      ],
      ...initialValues,
      // Lógica de inicialização da composição
      fabric_composition: initialValues?.description
        ? parseDescriptionToFabrics(initialValues.description)
        : [{ fabric: null, percentage: '' }],
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Nome muito curto' : null),
      // Validação da 'description' removida, pois é automática
      category: (value) => (value ? null : 'Selecione uma categoria'),
      supplier_id: (value) => (value ? null : 'Selecione um fornecedor'),
      variants: {
        size: (value) => (value ? null : 'Tamanho é obrigatório'),
        color: (value) => (value ? null : 'Cor é obrigatória'),
        buy_price: (value) => (value ? null : 'Preço de Compra é obrigatório'),
        sale_price: (value) => (value ? null : 'Preço de Venda é obrigatório'),
        quantity: (value) => (value ? null : 'Quantidade é obrigária'),
      },
      fabric_composition: {
        fabric: (value, values, path) => {
          // Só valida se a porcentagem também foi preenchida
          const index = parseInt(path.split('.')[1], 10);
          return values.fabric_composition[index]?.percentage
            ? value
              ? null
              : 'Tecido é obrigatório'
            : null;
        },
        percentage: (value, values, path) => {
          // Só valida se o tecido também foi preenchido
          const index = parseInt(path.split('.')[1], 10);
          return values.fabric_composition[index]?.fabric
            ? value
              ? null
              : 'Porcentagem é obrigatória'
            : null;
        },
      },
    },
  });

  // --- Efeito para gerar a 'description' automaticamente ---
  useEffect(() => {
    const { fabric_composition } = form.values;
    const validFabrics = fabric_composition.filter(
      (f) => f.fabric && f.percentage && Number(f.percentage) > 0
    );

    if (validFabrics.length === 0) {
      form.setFieldValue('description', ''); // Limpa a descrição se não houver tecidos
      return;
    }

    const description = validFabrics.map((f) => `${f.percentage}% ${f.fabric}`).join(' | ');

    form.setFieldValue('description', `Tecido ${description}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.fabric_composition]);
  // --- Fim do Efeito ---

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
    if (imageUploader.files.length === 0 && values.images.length === 0) {
      notifications.show({
        title: 'Amor 😳😳😳',
        message: 'Ta esquecendo das imagens gatinha. Quero ver esse produto lindo',
        color: 'red',
      });
      return;
    }

    onSubmit(values, imageUploader.files);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (initialValues?.images && initialValues.images.length > 0 && !isImagesInitialized) {
      const imageObjects = initialValues.images.map((img) => ({
        id: img._id,
        previewUrl: img.url,
        key: img.key,
      }));

      imageUploader.setInitialImages(imageObjects);
      setIsImagesInitialized(true);
    }
  }, [initialValues?.images, isImagesInitialized, imageUploader]);

  const variantFields = form.values.variants.map((_, index) => {
    const otherSelectedColors = form.values.variants
      .filter((__, i) => i !== index)
      .map((v) => v.color);

    const otherSelectedSizes = form.values.variants
      .filter((__, i) => i !== index)
      .map((v) => v.size);

    const availableColors = PRODUCT_COLORS.filter((c) => !otherSelectedColors.includes(c.value));
    const availableSizes = PRODUCT_SIZES.filter((s) => !otherSelectedSizes.includes(s.value));

    return (
      <ProductVariantItem
        key={index}
        form={form}
        listKey="variants"
        index={index}
        availableColors={availableColors}
        availableSizes={availableSizes}
        profitMargin={profitMargin}
      />
    );
  });

  // Renderização dos campos de tecido
  const fabricFields = form.values.fabric_composition.map((_, index) => (
    <FabricCompositionItem
      key={index}
      form={form}
      listKey="fabric_composition"
      index={index}
      onRemove={() => form.removeListItem('fabric_composition', index)}
    />
  ));

  const handleAddVariant = () => {
    const currentVariants = form.values.variants;
    let newBuyPrice = '';
    let newSalePrice = '';
    let quantityDefault = 1;

    if (currentVariants.length > 0) {
      const lastVariant = currentVariants[currentVariants.length - 1];
      newBuyPrice = lastVariant.buy_price;
      newSalePrice = lastVariant.sale_price;
      quantityDefault = lastVariant.quantity || 1;
    }

    form.insertListItem('variants', {
      size: null,
      color: null,
      buy_price: newBuyPrice,
      sale_price: newSalePrice,
      quantity: quantityDefault,
      minimum_stock: 0,
    });
  };

  return (
    <>
      <ImageGenerator clothingType={form.values.category || ''} />
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: '100%' }}>
        {/* <BarcodeScannerIOSFallback onChange={(code) => form.setFieldValue('code', code)} /> */}

        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Select
                label="Margem de Lucro"
                placeholder="Selecione a margem de lucro"
                data={PROFIT_MARGIN_OPTIONS}
                value={profitMargin}
                onChange={(value) => {
                  for (let index = 0; index < form.values.variants.length; index++) {
                    form.setFieldValue(`variants.${index}.buy_price`, '');
                    form.setFieldValue(`variants.${index}.sale_price`, '');
                  }

                  setProfitMargin(value || '2.5');
                }}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                withAsterisk
                label="Código"
                type="number"
                inputMode="numeric"
                placeholder="Código do produto"
                {...form.getInputProps('code')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <TextInput
                withAsterisk
                label="Nome"
                placeholder="Nome do produto"
                {...form.getInputProps('name')}
              />
            </Grid.Col>
            {/* Campo Descrição Removido daqui */}
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                withAsterisk
                label="Categoria"
                placeholder="Selecione a categoria"
                data={PRODUCT_CATEGORIES.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))}
                {...form.getInputProps('category')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Fornecedor"
                placeholder="Selecione o fornecedor"
                data={suppliers.map((s) => ({ value: s._id, label: s.name }))}
                {...form.getInputProps('supplier_id')}
              />
            </Grid.Col>
          </Grid>

          {/* --- Nova Seção de Composição de Tecido --- */}
          <Text fw={600} mt="lg">
            Composição do Tecido
          </Text>
          <Stack gap="xs">
            {fabricFields}
            <Button
              variant="light"
              onClick={() =>
                form.insertListItem('fabric_composition', {
                  fabric: null,
                  percentage: '',
                })
              }
            >
              Adicionar Tecido
            </Button>
          </Stack>
          {/* --- Fim da Nova Seção --- */}

          <Text fw={600} mt="lg">
            Variações de Produto (Cor e Tamanho)
          </Text>
          <Stack gap="md">
            {variantFields}
            <Button variant="light" onClick={handleAddVariant}>
              Adicionar Variação
            </Button>
          </Stack>

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
    </>
  );
}
