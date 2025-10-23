'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconShoppingBag } from '@tabler/icons-react';
import {
  Alert,
  AppShell,
  Burger,
  Button,
  Center,
  Flex,
  Group,
  Loader,
  Modal,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Logo } from '@/components/icons/logo';
import NavBar from '@/components/navbar/navbar';
import { ClientCart } from '@/components/shared/client-cart';
import { AnimatedSplashScreen } from '@/components/ui/splash-screen';
import { usePushNotifications } from '@/hooks/use-push-notification';
import { useAuthStore, useCartModalStore, useCartStore } from '@/store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [opened, { toggle }] = useDisclosure();
  const isCartModalOpen = useCartModalStore((state) => state.isCartModalOpen);
  const openCart = useCartModalStore((state) => state.openCartModal);
  const closeCart = useCartModalStore((state) => state.closeCartModal);
  const { requestPermission, permissionStatus } = usePushNotifications();

  const userInfo = useAuthStore((state) => state.userInfo);
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1500); // Shorter splash duration

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      if (isAppLoading) return;

      const currentUser = useAuthStore.getState().userInfo;
      if (!currentUser) {
        router.push('/login');
      } else {
        setIsVerifying(false);
      }
    };

    const hydrationTimer = setTimeout(checkAuth, 50); // Shorter delay

    return () => clearTimeout(hydrationTimer);
  }, [isAppLoading, router]);

  if (isAppLoading) {
    return <AnimatedSplashScreen onAnimationComplete={() => setIsAppLoading(false)} />;
  }

  if (isVerifying) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
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
            <CartSummaryButton onClick={() => openCart(null)} />
          </Flex>
        </AppShell.Header>

        <AppShell.Navbar p="lg">
          <NavBar toggle={toggle} />
        </AppShell.Navbar>

        <AppShell.Main>
          {permissionStatus === 'default' && (
            <Alert
              title="Notificações"
              color="blue"
              variant="light"
              withCloseButton
              closeButtonLabel="Fechar"
              mb="md"
            >
              <Text>Receba notificações sobre agendamentos e estoque.</Text>
              <Button onClick={requestPermission} size="xs" mt="xs">
                Ativar Notificações
              </Button>
            </Alert>
          )}
          {permissionStatus === 'denied' && (
            <Alert title="Notificações Bloqueadas" color="yellow" variant="light" mb="md">
              <Text size="sm">
                Você bloqueou as notificações. Para reativá-las, verifique as configurações do seu
                navegador.
              </Text>
            </Alert>
          )}
          <Flex direction="column" style={{ minHeight: '100%' }}>
            {children}
          </Flex>
        </AppShell.Main>
      </AppShell>

      <Modal opened={isCartModalOpen} size="xl" onClose={closeCart} title="Transações em Andamento">
        <ClientCart />
      </Modal>
    </>
  );
}

function CartSummaryButton({ onClick }: { onClick: () => void }) {
  const cartCount = useCartStore((state) => Object.keys(state.carts).length);

  return (
    <Button variant="outline" color="yellow" size="md" onClick={onClick}>
      <IconShoppingBag size={16} style={{ marginRight: 4 }} />
      {cartCount > 0 ? `Carrinhos Abertos (${cartCount})` : 'Nenhum Carrinho Ativo'}
    </Button>
  );
}
