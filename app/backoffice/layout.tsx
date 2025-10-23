'use client';

import { use, useEffect, useState } from 'react';
import { IconShoppingBag } from '@tabler/icons-react';
import { AppShell, Burger, Button, Flex, Group, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Logo } from '@/components/icons/logo';
import NavBar from '@/components/navbar/navbar';
import { ClientCart } from '@/components/shared/client-cart';
import { AnimatedSplashScreen } from '@/components/ui/splash-screen';
import { useCartModalStore, useCartStore } from '@/store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [opened, { toggle }] = useDisclosure();
  const isCartModalOpen = useCartModalStore((state) => state.isCartModalOpen);
  const open = useCartModalStore((state) => state.openCartModal);
  const close = useCartModalStore((state) => state.closeCartModal);

  if (isAppLoading) {
    return <AnimatedSplashScreen onAnimationComplete={() => setIsAppLoading(false)} />;
  }

  return (
    <>
      <AppShell
        padding="xl"
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'lg',
          collapsed: { mobile: !opened },
        }}
      >
        {/* HEADER */}
        <AppShell.Header
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 60,
            backgroundColor: 'var(--mantine-color-body)',
            borderBottom: '1px solid var(--mantine-color-gray-3)',
          }}
        >
          <Flex align="center" justify="space-between" gap="sm" px="xl" w="100%">
            <Group align="center" gap="sm">
              <Burger opened={opened} onClick={toggle} hiddenFrom="lg" size="sm" />
              <Logo width={150} height={75} />
            </Group>
            <CartSummaryButton onClick={() => open(null)} />
          </Flex>
        </AppShell.Header>

        {/* NAVBAR */}
        <AppShell.Navbar p="lg">
          <NavBar toggle={toggle} />
        </AppShell.Navbar>

        {/* MAIN */}
        <AppShell.Main>
          <Flex direction="column" style={{ minHeight: '100%' }}>
            {children}
          </Flex>
        </AppShell.Main>
      </AppShell>

      {/* MODAL DE CARRINHOS */}
      <Modal opened={isCartModalOpen} size="xl" onClose={close} title="Transações em Andamento">
        <ClientCart />
      </Modal>
    </>
  );
}

/* ------------------------ COMPONENTE BOTÃO DO CARRINHO ------------------------ */
function CartSummaryButton({ onClick }: { onClick: () => void }) {
  const cartCount = useCartStore((state) => Object.keys(state.carts).length);

  return (
    <Button variant="outline" color="yellow" size="md" onClick={onClick}>
      <IconShoppingBag size={16} style={{ marginRight: 4 }} />
      {cartCount > 0 ? `Carrinhos Abertos (${cartCount})` : 'Nenhum Carrinho Ativo'}
    </Button>
  );
}
