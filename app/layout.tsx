// src/app/layout.tsx (CORRIGIDO - Server Component)
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css';

import React from 'react';
import { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider } from '@mantine/core'; // Removido mantineHtmlProps, useState, QueryClientProvider daqui
import { Notifications } from '@mantine/notifications'; // Removido daqui
import { theme } from '../theme';
import Providers from './providers'; // Importa o novo componente Providers

// ----------------------------------------------------
// METADATA - Permanece aqui (Server Component)
// ----------------------------------------------------
export const metadata: Metadata = {
  title: 'Closet da Roh', // Seu título
  description: 'Agendamento de Visitas e Loja Online', // Sua descrição

  manifest: '/manifest.json',
  themeColor: '#FFFFFF', // Cor tema (ex: branco)

  appleWebApp: {
    title: 'Closet da Roh',
    statusBarStyle: 'default', // Ou 'black', 'black-translucent'
    capable: true,
  },

  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png', // Verifique se este arquivo existe na pasta /public
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Ajustado o tipo de children
  return (
    <html lang="pt-BR">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body>
        {/* Renderiza o componente cliente que contém os providers */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
