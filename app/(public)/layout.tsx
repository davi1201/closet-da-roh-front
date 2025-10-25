'use client';

import { IconCalendar, IconCalendarEvent, IconHeart } from '@tabler/icons-react';
import { AppShell, Burger, Button, Flex, Group, Modal, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();

  const menuItems = ['Home', 'Nossos produtos', 'Contato', 'Agendar visita'].map((item) => (
    <UnstyledButton key={item} className={classes.control}>
      {item}
    </UnstyledButton>
  ));

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          {/* Esquerda - logo e menu mobile */}
          <Group gap="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700}>Closet da Roh</Text>
          </Group>

          {/* Centro - menu desktop centralizado */}
          <Group
            gap="md"
            visibleFrom="sm"
            justify="center"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {menuItems}
          </Group>

          {/* Direita - botões de ação */}
          <Group gap="xs" justify="flex-end">
            <Button color="green" variant="outline" size="sm">
              <IconCalendarEvent size={16} style={{ marginRight: 8 }} />
              Agendar visita
            </Button>
            <Button color="red" size="sm">
              <IconHeart size={16} style={{ marginRight: 8 }} />
              Meus favoritos
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        <UnstyledButton className={classes.control}>Home</UnstyledButton>
        <UnstyledButton className={classes.control}>Blog</UnstyledButton>
        <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
        <UnstyledButton className={classes.control}>Support</UnstyledButton>
      </AppShell.Navbar>

      <AppShell.Main>
        <Flex direction="column" style={{ minHeight: '100%' }}>
          {children}
        </Flex>
      </AppShell.Main>
    </AppShell>
  );
}
