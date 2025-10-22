// components/carousel/FashionCarousel.tsx
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel } from '@mantine/carousel';
import { Button, Card, Group, Image, Overlay, Text } from '@mantine/core';
import classes from './fashion-carousel.module.css';

// Interface para definir a estrutura de cada slide
interface CarouselSlideProps {
  image: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
  overlayColor?: string; // Cor do overlay para melhor contraste do texto
}

export function FashionCarousel({ slides }: { slides: CarouselSlideProps[] }) {
  const autoplay = useRef(Autoplay({ delay: 5000 }));

  const carouselItems = slides.map((slide, index) => (
    <Carousel.Slide key={index}>
      <Card radius="md" p="0" className={classes.slideCard}>
        <Image src={slide.image} alt={slide.title} className={classes.slideImage} />

        {/* Overlay para melhorar a legibilidade do texto sobre a imagem */}
        <Overlay
          gradient={`linear-gradient(45deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 100%)`}
          opacity={0.7}
          className={classes.slideOverlay}
        />

        {/* Conteúdo do slide (título, descrição, botão) */}
        <div className={classes.slideContent}>
          <Text className={classes.slideTitle} variant="white" fw={700} size="h1">
            {slide.title}
          </Text>
          <Text className={classes.slideDescription} variant="white" size="lg" mt="sm" mb="xl">
            {slide.description}
          </Text>
          <Button
            component={Link}
            href={slide.link}
            variant="outline"
            color="white"
            size="lg"
            className={classes.slideButton}
          >
            {slide.buttonText}
          </Button>
        </div>
      </Card>
    </Carousel.Slide>
  ));

  return (
    <Carousel
      withIndicators
      height={700} // Altura padrão do carrossel
      // loop={false}
      // dragFree // Permite arrastar livremente (sem forçar o slide completo)
      // align="start"
      className={classes.carouselWrapper}
      // Outras props do Carousel que você pode ajustar:
      // slideSize="100%"
      // slideGap="md"
      // controlSize={40}
      // initialSlide={0}
      // controlsOffset="lg"

      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={() => autoplay.current.play()}
    >
      {carouselItems}
    </Carousel>
  );
}
