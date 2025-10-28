'use client';

import { IconDiamond, IconHeart, IconHome, IconHomeHeart } from '@tabler/icons-react';
import {
  Blockquote,
  Box,
  Container,
  Grid,
  Image,
  List,
  rem,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import CardImage from '@/components/ui/card-image';
import { FashionCarousel } from '@/components/ui/fashion-carousel';
import ListaAllPublicProducts from '@/domains/product/public/lista-all-public-products';
import AboutUsPage from './about-us';
import { Footer } from './footer';

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
      <AboutUsPage />

      <Stack my="xl" px="xl">
        <ListaAllPublicProducts />
      </Stack>

      <Footer />
    </>
  );
}
