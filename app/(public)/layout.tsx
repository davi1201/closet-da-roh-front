'use client';

import {
  IconCalendar,
  IconHeart,
  IconHome,
  IconInfoCircle,
  IconMail,
  IconShirt,
} from '@tabler/icons-react';
import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Button,
  Divider,
  Flex,
  Group,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './layout.module.css';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ size?: number; stroke?: number; color?: string }>;
  href: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();

  const menuItems: MenuItem[] = [
    { label: 'Home', icon: IconHome, href: '/' },
    { label: 'Quem somos', icon: IconInfoCircle, href: '/quem-somos' },
    { label: 'Produtos', icon: IconShirt, href: '/produtos' },
    { label: 'Contato', icon: IconMail, href: '/contato' },
  ];

  return (
    <AppShell
      header={{ height: { base: 60, sm: 70 } }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding={{ base: 'xs', sm: 'md' }}
    >
      <AppShell.Header>
        <Group h="100%" px={{ base: 'sm', sm: 'md' }} justify="space-between" wrap="nowrap">
          {/* Esquerda - Burger e Logo */}
          <Group gap="xs" wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label="Toggle navigation"
            />
            <Text
              fw={700}
              fz={{ base: 'md', sm: 'lg' }}
              style={{
                whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Closet da Roh
            </Text>
          </Group>

          {/* Centro - Menu Desktop */}
          <Group
            gap="xs"
            visibleFrom="sm"
            justify="center"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {menuItems.map((item) => (
              <UnstyledButton
                key={item.label}
                className={classes.control}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--mantine-radius-md)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Group gap={6} wrap="nowrap">
                  <item.icon size={16} stroke={1.5} />
                  <Text size="sm" fw={500}>
                    {item.label}
                  </Text>
                </Group>
              </UnstyledButton>
            ))}
          </Group>

          {/* Direita - Botões de Ação */}
          <Group gap="xs" wrap="nowrap">
            {/* Desktop: Botões completos */}
            <Group gap="xs" visibleFrom="sm">
              <Button
                color="pink"
                variant="light"
                size="sm"
                leftSection={<IconCalendar size={16} />}
              >
                Agendar
              </Button>
              <Button color="red" variant="filled" size="sm" leftSection={<IconHeart size={16} />}>
                Favoritos
              </Button>
            </Group>

            {/* Mobile: Ícones apenas */}
            <Group gap={4} hiddenFrom="sm">
              <Tooltip label="Agendar visita" position="bottom">
                <ActionIcon variant="light" color="pink" size="lg" aria-label="Agendar visita">
                  <IconCalendar size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Meus favoritos" position="bottom">
                <ActionIcon variant="filled" color="red" size="lg" aria-label="Meus favoritos">
                  <IconHeart size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar Mobile */}
      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="sm" mb="xs">
            Menu
          </Text>

          {menuItems.map((item) => (
            <UnstyledButton
              key={item.label}
              className={classes.control}
              onClick={close}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--mantine-radius-md)',
                transition: 'all 0.2s ease',
              }}
            >
              <Group gap="sm">
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--mantine-radius-md)',
                    backgroundColor: 'var(--mantine-color-pink-0)',
                  }}
                >
                  <item.icon size={18} stroke={1.5} color="var(--mantine-color-pink-6)" />
                </Box>
                <Text size="sm" fw={500}>
                  {item.label}
                </Text>
              </Group>
            </UnstyledButton>
          ))}

          <Divider my="md" />

          {/* Botões de ação no menu mobile */}
          <Stack gap="xs">
            <Button color="pink" variant="light" fullWidth leftSection={<IconCalendar size={18} />}>
              Agendar visita
            </Button>
            <Button color="red" variant="filled" fullWidth leftSection={<IconHeart size={18} />}>
              Meus favoritos
            </Button>
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Flex direction="column" style={{ minHeight: 'calc(100vh - 70px)' }}>
          {children}
        </Flex>
      </AppShell.Main>
    </AppShell>
  );
}
