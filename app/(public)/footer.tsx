import { IconBrandInstagram, IconBrandWhatsapp } from '@tabler/icons-react';
import { ActionIcon, Box, Container, Group, rem, Stack, Text, Title } from '@mantine/core';

// 1. COLOQUE SEUS LINKS AQUI
const WHATSAPP_LINK = 'https://api.whatsapp.com/send?phone=55SEUNUMERO';
const INSTAGRAM_LINK = 'https://www.instagram.com/SEUUSUARIO';

export function Footer() {
  return (
    <Box
      component="footer"
      py="xl"
      bg="gray.0"
      style={{ borderTop: `${rem(1)} solid var(--mantine-color-gray-2)` }}
    >
      <Container size="xl">
        <Stack align="center" gap="lg">
          <Title order={3} c="dark.7">
            Closet da Roh
          </Title>

          <Text size="sm" c="dimmed" ta="center">
            Elegância e exclusividade no conforto do seu lar.
          </Text>

          <Group gap="xl" mt="sm">
            <ActionIcon
              component="a"
              href={WHATSAPP_LINK}
              target="_blank"
              size={rem(48)}
              variant="light"
              color="green"
              radius="xl"
            >
              <IconBrandWhatsapp style={{ width: rem(28), height: rem(28) }} stroke={1.5} />
            </ActionIcon>

            <ActionIcon
              component="a"
              href={INSTAGRAM_LINK}
              target="_blank"
              size={rem(48)}
              variant="light"
              color="pink"
              radius="xl"
            >
              <IconBrandInstagram style={{ width: rem(28), height: rem(28) }} stroke={1.5} />
            </ActionIcon>
          </Group>

          <Text c="dimmed" size="xs" mt="lg">
            © {new Date().getFullYear()} Closet da Roh. Todos os direitos reservados.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
