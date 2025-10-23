import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Badge,
  Button,
  Card,
  Flex,
  Image,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { getAllClients } from '@/domains/clients/client-service';
import { ProductVariant } from '@/forms/product-form';
import { useCartStore } from '@/store';
import { formatPrice } from '@/utils/formatters';

interface AddCartProductProps {
  isProductOutOfStock: boolean;
  product: {
    _id: string;
    name: string;
    description: string;
    images: { url: string }[];
    variant: ProductVariant;
  };
  onClose?: () => void;
}

export default function AddCartProduct({
  product,
  onClose,
  isProductOutOfStock,
}: AddCartProductProps) {
  const [clients, setClients] = useState<{ value: string; label: string }[]>([]);

  const [clientSelectId, setClientSelectId] = useState<string | null>(null);
  const [clientSelectName, setClientSelectName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const theme = useMantineTheme();

  const addToCart = useCartStore((state) => state.addToCart);
  const createNewCart = useCartStore((state) => state.createNewCart);
  const activeCartId = useCartStore((state) => state.activeCartId);

  const findClientIdByName = (name: string): string | null => {
    const client = clients.find((c) => c.label === name);
    return client ? client.value : null;
  };

  const fetchClients = async () => {
    return getAllClients()
      .then((data) => {
        const clientOptions = data.map((client) => ({
          value: client._id,
          label: client.name,
        }));
        setClients(clientOptions);
        return clientOptions;
      })
      .catch((error) => {
        console.error('Erro ao buscar clientes:', error);
        return [];
      });
  };

  const handleAutocompleteChange = (value: string) => {
    setClientSelectName(value);
    const id = findClientIdByName(value);
    setClientSelectId(id);
    if (error) setError(null);
  };

  const handleAddToCart = () => {
    if (!clientSelectId) {
      setError('Por favor, selecione ou digite um cliente válido para o carrinho.');
      return;
    }
    setError(null);

    createNewCart(clientSelectId);

    addToCart({
      variantId: product.variant._id as string,
      name: product.name,
      unit_sale_price: parseFloat(product.variant.sale_price),
      quantity: 1,
      size: product.variant.size || '',
      color: product.variant.color || '',
      sku: product.variant.sku || '',
      productId: product._id,
    });

    if (onClose) onClose();
  };

  useEffect(() => {
    fetchClients().then((clientOptions) => {
      if (activeCartId) {
        const lastClient = clientOptions.find((c) => c.value === activeCartId);

        if (lastClient) {
          setClientSelectId(lastClient.value);
          setClientSelectName(lastClient.label);
        }
      }
    });
  }, [activeCartId]);

  return (
    <>
      <Stack gap="lg" style={{ width: '100%' }}>
        {isProductOutOfStock && (
          <Alert title="Atenção" color="red">
            Este produto está fora de estoque. Ao finalizar será gerada uma pêndendencia de
            reposição de estoque.
          </Alert>
        )}
        <Autocomplete
          label="Selecione o cliente"
          data={clients.map((c) => c.label)}
          value={clientSelectName}
          onChange={handleAutocompleteChange}
          placeholder="Selecione ou digite um cliente"
          error={error}
          clearable
        />

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section>
            <Image
              src={product.images[0]?.url || '/placeholder.png'}
              height={360}
              alt={product.name}
              fit="cover"
            />
          </Card.Section>

          <Stack gap="md" mt="md">
            <Text fw={500}>{product.name.toUpperCase()}</Text>
            <Badge variant="filled" size="lg" radius="md">
              {formatPrice(parseFloat(product.variant.sale_price))}
            </Badge>

            <Text size="sm" color="dimmed" truncate="end">
              {product.description.toLocaleUpperCase()}
            </Text>
            <Flex align="center" gap="xs">
              <Text size="sm" color="dimmed">
                TAMANHO:
              </Text>

              <Badge color="gray" size="lg" radius="md" variant="outline">
                {product.variant.size}
              </Badge>
            </Flex>

            <Button onClick={handleAddToCart} disabled={!clientSelectId}>
              Adicionar ao Carrinho do Cliente
            </Button>
          </Stack>
        </Card>
      </Stack>
    </>
  );
}
