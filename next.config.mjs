import createWithPWA from '@ducanh2912/next-pwa';
import bundleAnalyzer from '@next/bundle-analyzer';

const withPWA = createWithPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
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

  // ADICIONE ISTO para desabilitar SSG em rotas dinâmicas
  output: 'standalone', // ou remova se não usar
};

export default withPWA(withBundleAnalyzer(nextConfig));
