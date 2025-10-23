import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Closet da Roh',
    short_name: 'Closet da Roh',
    description: 'Do meu closet para o seu!',
    start_url: '/backoffice/products', // <-- Página inicial
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#FFFFFF',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
