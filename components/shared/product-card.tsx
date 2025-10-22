import { useEffect, useRef, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel } from '@mantine/carousel';
import {
  Autocomplete,
  Badge,
  Button,
  Card,
  ColorSwatch,
  Flex,
  Image,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { getAllClients } from '@/domains/clients/client-service';
import { ProductResponse } from '@/domains/product/types/product';
import { ProductVariant } from '@/forms/product-form';
import { useCartStore } from '@/store';
import { formatPrice } from '@/utils/formatters';
import AddCartProduct from './add-product-cart';

interface ProductCardProps {
  product: ProductResponse;
  handleEdit: (id: string) => void;
}

export default function ProductCard({ product, handleEdit }: ProductCardProps) {
  const theme = useMantineTheme();
  const [variantActive, setVariantActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const isProductOutOfStock = () => {
    const quantity = product.variants?.[variantActive]?.quantity ?? 0;
    return quantity <= 0;
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Carousel height={360}>
            {product.images.map((image) => {
              return (
                <Carousel.Slide
                  key={image.url}
                  onClick={() => setModalOpen(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <Image src={image.url} height={360} alt={product.name} fit="cover" />
                  {isProductOutOfStock() && (
                    <Badge
                      variant="filled"
                      color="red"
                      size="lg"
                      radius="md"
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                      }}
                    >
                      Esgotado
                    </Badge>
                  )}
                </Carousel.Slide>
              );
            })}
          </Carousel>
        </Card.Section>

        <Flex direction="column" gap="xs" mt="md" mb="xs">
          <Text fw={500}>{product.name.toUpperCase()}</Text>
          <Badge variant="filled" size="lg" radius="md">
            {formatPrice(parseFloat(product.variants[variantActive].sale_price))}
          </Badge>
        </Flex>

        <Text size="md" c="dimmed">
          {product.description}
        </Text>

        <Flex mt="md" gap="xs" align="center">
          <Text size="md" c="dimmed">
            Cor:
          </Text>
          {product.variants.map((variant) => (
            <ColorSwatch
              key={variant._id}
              color={variant.color || theme.colors.gray[2]}
              size={20}
              radius="lg"
            />
          ))}
        </Flex>

        <Flex mt="md" gap="xs" align="center">
          <Text size="md" c="dimmed">
            Tamanho:
          </Text>
          <SegmentedControl
            data={product.variants.map((variant) => ({
              label: variant.size ?? '',
              value: variant.size ?? '',
            }))}
            value={product.variants[variantActive].size || ''}
            onChange={(value) => {
              const index = product.variants.findIndex((v) => v.size === value);
              if (index !== -1) setVariantActive(index);
            }}
          />
        </Flex>

        <Flex direction="column">
          <Button
            variant="gradient"
            fullWidth
            mt="md"
            radius="md"
            onClick={() => setModalOpen(true)}
          >
            Adicionar ao carrinho
          </Button>

          <Button
            variant="filled"
            color="yellow"
            fullWidth
            mt="md"
            radius="md"
            onClick={() => handleEdit(product._id)}
          >
            Editar
          </Button>
        </Flex>
      </Card>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={product.name}>
        <AddCartProduct
          isProductOutOfStock={isProductOutOfStock()}
          onClose={() => setModalOpen(false)}
          product={{
            _id: product._id,
            name: product.name,
            description: product.description,
            images: product.images,
            variant: product.variants[variantActive],
          }}
        />
      </Modal>
    </>
  );
}
