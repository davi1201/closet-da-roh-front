import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import React from 'react';
import { Metadata } from 'next'; // Importe o tipo Metadata
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';

// ----------------------------------------------------
// 1. OBJETO METADATA AJUSTADO
// ----------------------------------------------------
export const metadata: Metadata = {
  title: 'Nome do Seu PWA', // Atualizado
  description: 'Seu PWA rodando com Next.js e Mantine!', // Atualizado

  // 1. Configuração PWA Universal
  manifest: '/manifest.json',
  themeColor: '#000000', // Cor da barra de navegação do sistema

  // 2. Configurações ESPECÍFICAS para iOS (Safari)
  appleWebApp: {
    title: 'Seu PWA', // Nome que aparece na tela inicial do iOS
    statusBarStyle: 'black-translucent', // Define a cor e estilo da barra de status no PWA instalado
    capable: true, // Habilita o modo de tela cheia (standalone)
  },

  // 3. Ícone Touch Icon para iOS
  icons: {
    icon: '/favicon.svg', // Seu favicon padrão
    apple: '/apple-touch-icon.png', // Requer um arquivo 180x180 na pasta public/
  },
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="pt-BR" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />

        {/* A Apple usa esta tag para o ícone de atalho na tela inicial */}
        {/* A tag 'icons.apple' no metadata fará a injeção disso automaticamente, 
            mas podemos garantir com o link para o ícone de alta resolução se preferir: */}
        {/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> */}

        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no, viewport-fit=cover" // Adicionado 'viewport-fit=cover' para telas com notch
        />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
