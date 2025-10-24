// src/app/providers.tsx (NOVO ARQUIVO - Client Component)
'use client';

// ESSENCIAL: Marca este como um Client Component
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Opcional
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme'; // Importe seu tema

// Props para receber os children (o conteúdo da página)
interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // useState para QueryClient SÓ pode existir em Client Components
  const [queryClient] = useState(() => new QueryClient());

  return (
    // QueryClientProvider SÓ pode existir em Client Components
    <QueryClientProvider client={queryClient}>
      {/* MantineProvider SÓ pode existir em Client Components */}
      <MantineProvider theme={theme} defaultColorScheme="auto">
        {/* Notifications SÓ pode existir em Client Components */}
        <Notifications position="top-center" />
        {children} {/* Renderiza o conteúdo da página envolvido pelos providers */}
      </MantineProvider>

      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
