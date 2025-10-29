import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconCalendar } from '@tabler/icons-react';
import { Box, Button, Grid, Image, Modal, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ProductResponse } from '@/domains/product/types/product';

interface ProductsDetailProps {
  isOpen: boolean;
  handleModalClose: () => void;
  product: ProductResponse | null;
}

export default function ProductsDetail({ isOpen, handleModalClose, product }: ProductsDetailProps) {
  const [selectedColorUrl, setSelectedColorUrl] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (product?.images?.length) {
      setSelectedColorUrl(product.images[0].url);
    } else {
      setSelectedColorUrl('');
    }
  }, [product]);

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={handleModalClose}
        title="Detalhes do Produto"
        size="xl"
        centered
        padding="lg"
      >
        {product && (
          <Grid gutter="lg">
            {/* Imagem principal */}
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Image
                src={selectedColorUrl}
                h={500}
                fit="contain"
                radius="md"
                alt={product.name}
                fallbackSrc="https://via.placeholder.com/500x500.png?text=Sem+Imagem"
              />
            </Grid.Col>

            {/* Informações do produto */}
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack gap="md">
                <Title order={3}>{product.name}</Title>

                {product.description && (
                  <Text c="dimmed" size="sm" lineClamp={4}>
                    {product.description}
                  </Text>
                )}

                {/* Seletor de cores */}
                {product.images?.length > 0 && (
                  <Box>
                    <Text fw={500} size="sm" mb="xs">
                      Cores disponíveis ({product.images.length}):
                    </Text>
                    <SimpleGrid cols={{ base: 3, sm: 3 }} spacing="xs">
                      {product.images.map((image) => (
                        <Box
                          key={image.url}
                          onClick={() => setSelectedColorUrl(image.url)}
                          style={{
                            cursor: 'pointer',
                            borderRadius: 'var(--mantine-radius-sm)',
                            overflow: 'hidden',
                            border: `3px solid ${
                              selectedColorUrl === image.url
                                ? 'var(--mantine-color-blue-6)'
                                : 'transparent'
                            }`,
                            transition: 'all 0.2s ease',
                          }}
                          bg={selectedColorUrl === image.url ? 'gray.1' : 'transparent'}
                        >
                          <Image
                            src={image.url}
                            h={120}
                            alt={`${product.name} - variação`}
                            fit="contain"
                            radius="xs"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {/* Botão de agendar */}
                <Button
                  variant="gradient"
                  fullWidth
                  mt="md"
                  onClick={() => router.push('/booking-appoitment')}
                  leftSection={<IconCalendar size={16} />}
                >
                  Agendar visita
                </Button>
              </Stack>
            </Grid.Col>
          </Grid>
        )}
      </Modal>
    </>
  );
}
