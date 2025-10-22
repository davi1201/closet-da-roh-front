'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import {
  ActionIcon,
  AppShell,
  ScrollArea,
  Stack,
  Title,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import classes from './style.module.css';

interface NavbarProps {
  toggle: () => void;
}

const linksMockdata = [
  { to: 'sales', label: 'Vendas' },
  { to: 'clients', label: 'Clientes' },
  { to: 'products', label: 'Produtos' },
  { to: 'suppliers', label: 'Fornecedores' },
  { to: 'abandoned-carts', label: 'Carrinhos Abandonados' },
  { to: 'available-days-and-times', label: 'Dias e Horários Disponíveis' },
  { to: 'config', label: 'Configurações' },
];

export default function NavBar({ toggle }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState('Dashboard');
  const [activeLink, setActiveLink] = useState('Produtos');
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const links = linksMockdata.map((link) => (
    <Link
      key={link.label}
      href={`/backoffice/${link.to.toLowerCase()}`}
      className={classes.link}
      data-active={activeLink === link.label || undefined}
      onClick={() => {
        toggle();
        setActiveLink(link.label);
      }}
    >
      {link.label}
    </Link>
  ));

  return (
    <AppShell.Navbar p="lg">
      <AppShell.Section grow component={ScrollArea}>
        <Stack gap="md">
          <Stack mt="lg" gap="xs">
            <Title order={5} c="gray.3" mb="xs">
              Menu
            </Title>
            {links}
          </Stack>
        </Stack>
      </AppShell.Section>

      <AppShell.Section>
        <Title order={6} c="gray.5" ta="center" mt="md">
          {active}
        </Title>

        <Tooltip label="Alternar tema" position="top" withArrow>
          <ActionIcon
            variant="filled"
            color={colorScheme === 'dark' ? 'yellow' : 'blue'}
            onClick={() => toggleColorScheme()}
            size="lg"
            mt="md"
          >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
          </ActionIcon>
        </Tooltip>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
