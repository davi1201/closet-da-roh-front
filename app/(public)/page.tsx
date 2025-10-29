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
      title: 'Nova Coleção Verão 2026',
      description:
        'Cores vibrantes e tecidos leves para você arrasar na estação mais quente do ano.',
      buttonText: 'Agendar Visita',
      link: '/booking-appoitment',
    },
    {
      image: '/slide-2.jpg',
      title: 'Peças Exclusivas para Todas as Ocasiões',
      description: 'Encontre o look perfeito para cada momento, do casual ao mais sofisticado.',
      buttonText: 'Ver Produtos',
      link: '#produtos',
    },
  ];

  return (
    <>
      <FashionCarousel slides={carouselSlidesData} />
      <div id="#quem-somos">
        <AboutUsPage />
      </div>

      <Stack my="xl" px="xl" id="produtos">
        <ListaAllPublicProducts />
      </Stack>
      <div id="#contato">
        <Footer />
      </div>
    </>
  );
}
