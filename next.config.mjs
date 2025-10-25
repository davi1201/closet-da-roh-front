import createWithPWA from '@ducanh2912/next-pwa';
import bundleAnalyzer from '@next/bundle-analyzer';

const withPWA = createWithPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: false,
  skipWaiting: true,
  // CRÍTICO: Usa o worker customizado que integra Firebase + PWA
  swSrc: 'worker/index.ts',
  // swDest: 'public/sw.js',
  // Configurações adicionais recomendadas
  reloadOnOnline: true, // Recarrega quando voltar online
  cacheOnFrontEndNav: true, // Cache em navegação
  aggressiveFrontEndNavCaching: false,
  cacheStartUrl: true,
});

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  transpilePackages: ['@tabler/icons-react'],
  output: 'standalone',
};

export default withPWA(withBundleAnalyzer(nextConfig));
