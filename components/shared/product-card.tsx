import { useMemo, useState } from 'react'; // Adicionado useMemo
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

// Interface para a variante, garantindo que os campos existem
interface ProductVariant {
  _id: string;
  size?: string;
  color?: string;
  quantity: number;
  sale_price: string;
}

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
    const quantity = (product.variants as ProductVariant[])?.[variantActive]?.quantity ?? 0;
    return quantity <= 0;
  };

  // Processa as cores únicas para exibir
  const uniqueColors = useMemo(() => {
    if (!hasVariants) return [];
    const colors = new Set<string>();
    (product.variants as ProductVariant[]).forEach((variant) => {
      if (variant.color) {
        colors.add(variant.color);
      }
    });
    return Array.from(colors);
  }, [product.variants, hasVariants]);

  // Processa os tamanhos únicos e seu status de estoque
  const uniqueSizesData = useMemo(() => {
    if (!hasVariants) return [];

    // 1. Agrupa todas as variantes por tamanho
    const sizesMap = new Map<string, { hasStock: boolean }>();

    (product.variants as ProductVariant[]).forEach((variant) => {
      const size = variant.size;
      if (!size) return;

      const variantHasStock = variant.quantity > 0;

      if (!sizesMap.has(size)) {
        // Primeira vez vendo esse tamanho
        sizesMap.set(size, { hasStock: variantHasStock });
      } else {
        // Se o tamanho já foi marcado como 'hasStock', não faça nada.
        // Se ainda não foi, verifique se *esta* variante tem estoque.
        if (!sizesMap.get(size)!.hasStock && variantHasStock) {
          sizesMap.set(size, { hasStock: true });
        }
      }
    });

    // 2. Converte o Map para um array
    const sizesArray = Array.from(sizesMap.entries()); // ex: [['M', {hasStock: true}], ['P', {hasStock: false}]]

    // 3. Ordena o array usando o sizeOrder
    const sortedSizes = sizesArray.sort((a, b) => {
      const orderA = sizeOrder[a[0]] || 99;
      const orderB = sizeOrder[b[0]] || 99;
      return orderA - orderB;
    });

    // 4. Formata para o SegmentedControl
    return sortedSizes.map(([size, data]) => ({
      label: size,
      value: size,
      disabled: !data.hasStock, // Desabilita se NENHUMA variante desse tamanho tem estoque
    }));
  }, [product.variants, hasVariants]);

  // Atualiza a variante ativa ao mudar o tamanho
  const handleSizeChange = (size: string) => {
    // Tenta encontrar a primeira variante DESSE tamanho QUE TENHA estoque
    let index = (product.variants as ProductVariant[]).findIndex(
      (v) => v.size === size && v.quantity > 0
    );

    // Se não achar (ex: todas daquele tamanho estão esgotadas, mas o item foi clicado)
    // apenas selecione a primeira variante daquele tamanho
    if (index === -1) {
      index = (product.variants as ProductVariant[]).findIndex((v) => v.size === size);
    }

    if (index !== -1) {
      setVariantActive(index);
    }
  };

  const activeVariant = (product.variants as ProductVariant[])[variantActive];

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
        {showPrice && activeVariant && (
          <Badge variant="filled" size="lg" radius="md">
            {formatPrice(parseFloat(activeVariant.sale_price))}
          </Badge>
        )}
      </Flex>

      <Text size="md" c="dimmed" truncate="end">
        {product.description.toLocaleUpperCase()}
      </Text>

      {showVariations && hasVariants && activeVariant && (
        <>
          <Flex mt="md" gap="xs" align="center">
            <Text size="md" c="dimmed">
              {uniqueColors.length > 1 ? 'CORES' : 'COR'}:
            </Text>
            {/* Agora mostra apenas cores únicas */}
            {uniqueColors.map((color) => (
              <ColorSwatch
                key={color}
                color={color || theme.colors.gray[2]}
                size={20}
                radius="sm"
                // Opcional: Adiciona um anel para a cor ativa
                style={{
                  outline:
                    activeVariant.color === color ? `2px solid ${theme.colors.blue[6]}` : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </Flex>

          <Flex mt="md" gap="xs" align="center">
            <Text size="md" c="dimmed">
              {uniqueSizesData.length > 1 ? 'TAMANHOS' : 'TAMANHO'}:
            </Text>
            {/* Agora usa os dados de tamanhos únicos processados */}
            <SegmentedControl
              data={uniqueSizesData}
              value={activeVariant.size || ''}
              onChange={handleSizeChange}
            />
          </Flex>
        </>
      )}

      {children}
    </Card>
  );
}
