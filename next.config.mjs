import createWithPWA from '@ducanh2912/next-pwa'; // Importamos a função default com um nome
import bundleAnalyzer from '@next/bundle-analyzer';

// 1. Definição do Wrapper PWA
const withPWA = createWithPWA({
  dest: 'public',
  disable: false,
  register: true, // Registra o Service Worker
  skipWaiting: true, // Garante ativação imediata
  swSrc: 'firebase-messaging-sw-config.js', // Aponta para o SW customizado
  // ... outras configurações Workbox
});

// 2. Definição do Wrapper Bundle Analyzer
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// 3. Configuração Base do Next.js
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
};

// 4. Encapsulamento Final: Aplique os wrappers em cadeia
export default withPWA(withBundleAnalyzer(nextConfig));
