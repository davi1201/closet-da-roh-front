'use client';

import { useRouter } from 'next/navigation';
import { Card, Image } from '@mantine/core';

interface CardImageProps {
  image: string;
  href?: string;
}

export default function CardImage({ image, href }: CardImageProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => href && router.push(href)}
      shadow="md"
      radius="md"
      padding={0}
      withBorder
      style={{
        cursor: href ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa', // fundo neutro caso a imagem não preencha tudo
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <Image
        src={image}
        alt="Imagem do card"
        fit="contain" // ✅ mostra toda a imagem
        w="100%" // ✅ ocupa toda a largura
        style={{
          objectPosition: 'center',
          transition: 'transform 0.4s ease',
        }}
      />
    </Card>
  );
}
