import { IconDiamond, IconHeart, IconHome } from '@tabler/icons-react';
import {
  Box,
  Container,
  Grid,
  Image,
  List,
  Paper,
  rem,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';

export default function QuemSomosSection() {
  const features = [
    {
      icon: IconHome,
      title: 'Atendimento Domiciliar',
      description:
        'Vamos até o conforto da sua casa com hora marcada, garantindo total privacidade.',
      color: 'pink',
    },
    {
      icon: IconDiamond,
      title: 'Curadoria Exclusiva',
      description: 'Peças selecionadas a dedo, focadas em alta qualidade e design sofisticado.',
      color: 'grape',
    },
    {
      icon: IconHeart,
      title: 'Consultoria Pessoal',
      description: 'Não se trata de vender, mas de encontrar as peças que celebram quem você é.',
      color: 'red',
    },
  ];

  return (
    <Box
      component="section"
      py={{ base: rem(60), md: rem(100) }}
      style={{
        backgroundColor: 'var(--mantine-color-gray-1)',
      }}
    >
      <Container size="xl">
        <Grid gutter={{ base: 'xl', md: rem(80) }} align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box
              h="100%"
              style={{
                borderRadius: 'var(--mantine-radius-xl)',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                minHeight: rem(400),
              }}
            >
              <Image
                src="/quem-somos-closet-da-roh.jpeg"
                alt="Atendimento exclusivo Closet da Roh"
                fit="cover"
                h="100%"
                w="100%"
              />

              <Box pos="absolute" bottom={rem(24)} left={rem(24)} right={rem(24)}>
                <Paper
                  p="lg"
                  radius="lg"
                  bg="rgba(255, 255, 255, 0.7)"
                  style={{
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  shadow="sm"
                >
                  <Text size="lg" fw={600} c="pink.9" ta="center" fs="italic">
                    "Mais que roupas, uma experiência."
                  </Text>
                </Paper>
              </Box>
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="xl" h="100%" justify="center">
              <Stack gap="md">
                <Title
                  order={2}
                  fz={{ base: rem(32), md: rem(42) }}
                  fw={800}
                  c="dark.8"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  Quem Somos
                </Title>

                <Text size="lg" c="dimmed" lh={1.7}>
                  O Closet da Roh nasceu do desejo de transformar a sua relação com a moda.
                  Acreditamos que o verdadeiro luxo não está apenas na qualidade da peça, mas na
                  experiência que a envolve.
                </Text>

                <Text size="lg" c="dimmed" lh={1.7}>
                  Nossa missão é oferecer uma seleção exclusiva de moda feminina de alta qualidade,
                  unindo elegância e tendências. Mas é no atendimento que reside nossa alma:{' '}
                  <strong>nós vamos até a sua casa</strong>.
                </Text>
              </Stack>

              <List spacing="xl" size="lg" mt="md">
                {features.map((feature) => (
                  <List.Item
                    key={feature.title}
                    icon={
                      <ThemeIcon color={feature.color} size={40} radius="xl" variant="light">
                        <feature.icon style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
                      </ThemeIcon>
                    }
                  >
                    <Text fw={600} size="lg" mb={4} c="dark.8">
                      {feature.title}
                    </Text>
                    <Text c="dimmed" size="md" lh={1.6}>
                      {feature.description}
                    </Text>
                  </List.Item>
                ))}
              </List>

              <Text size="lg" c="dimmed" lh={1.7} mt="md">
                Essa é a essência do Closet da Roh: uma experiência de compra{' '}
                <strong>única, pessoal e inesquecível</strong>.
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
