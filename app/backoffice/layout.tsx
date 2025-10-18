'use client';

import { AppShell, Burger, Flex, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import NavBar from '@/components/navbar/navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      padding="md"
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
        <Flex align="center" justify="space-between" gap="sm">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text fw={600} size="lg">
            Closet da Roh
          </Text>
        </Flex>
      </AppShell.Header>

      <NavBar toggle={toggle} />

      <AppShell.Main>
        <Flex direction="column" style={{ minHeight: '100%' }}>
          {children}
        </Flex>
      </AppShell.Main>
    </AppShell>
  );
}
