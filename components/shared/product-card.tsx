import { useState } from 'react';
import { Carousel } from '@mantine/carousel';
import {
  Badge,
  Card,
  ColorSwatch,
  Flex,
  Image,
  SegmentedControl,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { ProductResponse } from '@/domains/product/types/product';
import { formatPrice } from '@/utils/formatters';

interface ProductCardProps {
  product: ProductResponse;
  children?: React.ReactNode;
  onSelect?: (product: ProductResponse) => void;
  isPublic?: boolean;
  showPrice?: boolean;
  showVariations?: boolean;
}

const sizeOrder: Record<string, number> = {
  P: 1,
  M: 2,
  G: 3,
  GG: 4,
  XG: 5,
  XGG: 6,
};

export default function ProductCard({
  product,
  children,
  onSelect,
  isPublic = false,
  showPrice = false,
  showVariations = false,
}: ProductCardProps) {
  const theme = useMantineTheme();
  const [variantActive, setVariantActive] = useState(0);

  const hasVariants = product.variants && product.variants.length > 0;

  const isProductOutOfStock = () => {
    const quantity = product.variants?.[variantActive]?.quantity ?? 0;
    return quantity <= 0;
  };

  const sortedVariants = hasVariants
    ? [...product.variants].sort((a, b) => {
        const orderA = sizeOrder[a.size ?? ''] || 99;
        const orderB = sizeOrder[b.size ?? ''] || 99;
        return orderA - orderB;
      })
    : [];

  const handleSizeChange = (size: string) => {
    const index = product.variants.findIndex((v) => v.size === size);
    if (index !== -1) setVariantActive(index);
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Carousel height={360} withControls={product.images.length > 1}>
          {product.images.map((image) => (
            <Carousel.Slide
              key={image.url}
              onClick={() => onSelect?.(product)}
              style={{ cursor: 'pointer' }}
            >
              <Image src={image.url} height={360} alt={product.name} w="100%" fit="cover" />
              {!isPublic && isProductOutOfStock() && (
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
          ))}
        </Carousel>
      </Card.Section>

      <Flex direction="column" gap="xs" mt="md" mb="xs">
        <Text fw={500}>{product.name.toUpperCase()}</Text>
        {showPrice && hasVariants && (
          <Badge variant="filled" size="lg" radius="md">
            {formatPrice(parseFloat(product.variants[variantActive].sale_price))}
          </Badge>
        )}
      </Flex>

      <Text size="md" c="dimmed" truncate="end">
        {product.description.toLocaleUpperCase()}
      </Text>

      {showVariations && hasVariants && (
        <>
          <Flex mt="md" gap="xs" align="center">
            <Text size="md" c="dimmed">
              {product.variants.length > 1 ? 'CORES' : 'COR'}:
            </Text>
            {sortedVariants.map((variant) => (
              <ColorSwatch
                key={variant._id}
                color={variant.color || theme.colors.gray[2]}
                size={20}
                radius="sm"
              />
            ))}
          </Flex>

          <Flex mt="md" gap="xs" align="center">
            <Text size="md" c="dimmed">
              {product.variants.length > 1 ? 'TAMANHOS' : 'TAMANHO'}:
            </Text>
            <SegmentedControl
              data={sortedVariants.map((variant) => ({
                label: variant.size ?? '',
                value: variant.size ?? '',
              }))}
              value={product.variants[variantActive].size || ''}
              onChange={handleSizeChange}
            />
          </Flex>
        </>
      )}

      {children}
    </Card>
  );
}
