'use client';

import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { Center, Stack, Title } from '@mantine/core';

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashProps) {
  const [animationData, setAnimationData] = useState<any | null>(null);

  useEffect(() => {
    const url = 'https://lottie.host/1ecb8a19-ebd9-4602-adc0-29236e146e0f/NAkWR5Goe8.json';
    let cancelled = false;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch((err) => {
        console.error('Failed to load animation', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (animationData) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 3000); // Duração da animação em ms

      return () => clearTimeout(timer);
    }
  }, [animationData, onAnimationComplete]);

  return (
    <Center style={{ height: '100vh', width: '100vw', backgroundColor: '#FFF' }}>
      <Stack align="center">
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={true}
            onComplete={onAnimationComplete}
            style={{ width: 500, height: 500 }}
          />
        ) : null}
        <Title order={1}>Closet da Roh</Title>
      </Stack>
    </Center>
  );
}
