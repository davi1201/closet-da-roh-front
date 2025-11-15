'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconShoppingBag } from '@tabler/icons-react';
import {
  ActionIcon, // Importe o ActionIcon
  Alert,
  AppShell,
  Burger,
  Button,
  Center,
  Flex,
  Group,
  Indicator, // (Opcional) Para contagem
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

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [opened, { toggle }] = useDisclosure();
  const isCartModalOpen = useCartModalStore((state) => state.isCartModalOpen);
  const openCart = useCartModalStore((state) => state.openCartModal);
  const closeCart = useCartModalStore((state) => state.closeCartModal);
  const { requestPermission, permissionStatus, isClient } = usePushNotifications();

  const userInfo = useAuthStore((state) => state.userInfo);
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1500);

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

    const hydrationTimer = setTimeout(checkAuth, 50);

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
              {/* CORREÇÃO 1: O logo foi redimensionado para caber no header de 60px.
               */}
              <Logo width={100} height={50} />
            </Group>

            {/* CORREÇÃO 2: O componente do botão agora é responsivo por si só.
             */}
            <CartSummaryButton onClick={() => openCart(null)} />
          </Flex>
        </AppShell.Header>

        <AppShell.Navbar p="lg">
          <NavBar toggle={toggle} />
        </AppShell.Navbar>

        <AppShell.Main>
          {isClient && (
            <>
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
                    Você bloqueou as notificações. Para reativá-las, verifique as configurações do
                    seu navegador.
                  </Text>
                </Alert>
              )}
            </>
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

// --- COMPONENTE DE BOTÃO ATUALIZADO ---

function CartSummaryButton({ onClick }: { onClick: () => void }) {
  const cartCount = useCartStore((state) => Object.keys(state.carts).length);
  const text = cartCount > 0 ? `Carrinhos Abertos (${cartCount})` : 'Nenhum Carrinho';

  return (
    <>
      {/* 1. Botão completo, visível apenas a partir do breakpoint 'xs' (telas maiores) */}
      <Button
        variant="outline"
        color="yellow"
        size="md"
        onClick={onClick}
        visibleFrom="xs"
        leftSection={<IconShoppingBag size={16} />}
      >
        {text}
      </Button>

      {/* 2. Botão de ícone, oculto a partir do breakpoint 'xs' (ou seja, visível só no mobile) */}
      <Indicator
        inline
        label={cartCount}
        size={16}
        disabled={cartCount === 0}
        color="red"
        hiddenFrom="xs"
      >
        <ActionIcon
          variant="outline"
          color="yellow"
          size="lg" // 'lg' no ActionIcon tem altura similar a 'md' no Button
          onClick={onClick}
        >
          <IconShoppingBag size={18} />
        </ActionIcon>
      </Indicator>
    </>
  );
}
