// components/Logo/Logo.tsx
import React from 'react';
import { Box, useMantineColorScheme } from '@mantine/core';

interface LogoProps {
  width?: string | number;
  height?: string | number;
}

export function Logo({ width = '150', height = '100' }: LogoProps) {
  const { colorScheme } = useMantineColorScheme();
  // Define a cor do texto baseada no tema (opcional)
  const textColor = colorScheme === 'dark' ? '#BFA170' : '#8B704E'; // Exemplo de cor para tema claro

  return (
    <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 300 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Você pode querer remover o rect de fundo se o logo for transparente ou usar um fill condicional */}
        {/* <rect width="300" height="150" fill="transparent" /> */}

        <text
          x="150"
          y="85"
          fontFamily="'Times New Roman', Times, serif"
          fontSize="72"
          fill={textColor} // Usando a cor definida
          textAnchor="middle"
        >
          CR
        </text>

        {/* Note: stroke-width e fill-opacity devem ser strokeWidth e fillOpacity em React/JSX */}
        <line x1="120" y1="100" x2="180" y2="100" stroke={textColor} strokeWidth="1" />

        <text
          x="150"
          y="120"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="10"
          fill={textColor} // Usando a cor definida
          textAnchor="middle"
          letterSpacing="3" // Usando camelCase
        >
          CLOSET DA ROH
        </text>
      </svg>
    </Box>
  );
}
