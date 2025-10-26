'use client';

import { Grid, List, Stack } from '@mantine/core';
import CardImage from '@/components/ui/card-image';
import { FashionCarousel } from '@/components/ui/fashion-carousel';
import ListaAllPublicProducts from '@/domains/product/public/lista-all-public-products';

export default function PublicPage() {
  const carouselSlidesData = [
    {
      image: '/slide-1.jpg',
      title: 'Nova Coleção Verão 2024',
      description:
        'Cores vibrantes e tecidos leves para você arrasar na estação mais quente do ano.',
      buttonText: 'Compre Agora',
      link: '/products/collection/summer-2024',
    },
    {
      image: '/slide-2.jpg',
      title: 'Peças Exclusivas para Todas as Ocasiões',
      description: 'Encontre o look perfeito para cada momento, do casual ao mais sofisticado.',
      buttonText: 'Ver Produtos',
      link: '/products/all',
    },
  ];

  return (
    <>
      <FashionCarousel slides={carouselSlidesData} />

      {/* <Stack my="xl" px="100">
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <CardImage image="/aside-2.jpg" href="/products/collection/formal-wear" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Grid mb="md" gutter="md">
              <Grid.Col span={6}>
                <CardImage image="/aside-1.png" href="/products/collection/summer-2024" />
              </Grid.Col>
              <Grid.Col span={6}>
                <CardImage image="/aside-1.png" href="/products/collection/casual-wear" />
              </Grid.Col>
            </Grid>
          </Grid.Col>
        </Grid>
      </Stack> */}

      <Stack my="xl" px="xl">
        <ListaAllPublicProducts />
      </Stack>
    </>
  );
}
