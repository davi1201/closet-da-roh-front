import Link from 'next/link';
import { IconHeart } from '@tabler/icons-react';
import { Anchor, Avatar, Badge, Card, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { MostLikedProduct } from '../dashboard-service';

interface MostLikedListProps {
  products: MostLikedProduct[];
}

export function MostLikedList({ products }: MostLikedListProps) {
  return (
    <Card withBorder radius="md" p="lg" h="100%">
      <Title order={4} mb="lg">
        Produtos Mais Curtidos
      </Title>
      {products.length === 0 ? (
        <Text c="dimmed">Nenhum produto foi curtido ainda.</Text>
      ) : (
        <ScrollArea h={400}>
          {' '}
          {/* Mesma altura do feed */}
          <Stack gap="md">
            {products.map((item) => (
              <Group key={item.product._id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Avatar
                    src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={item.product.name}
                    radius="sm"
                  />
                  <Stack gap={0}>
                    <Anchor
                      component={Link}
                      href={`/backoffice/products/edit/${item.product._id}`}
                      size="sm"
                      fw={500}
                    >
                      {item.product.name}
                    </Anchor>
                    <Text size="xs" c="dimmed">
                      {item.product.category}
                    </Text>
                  </Stack>
                </Group>
                <Badge
                  color="pink"
                  variant="light"
                  leftSection={<IconHeart size={12} style={{ marginRight: 4 }} />}
                >
                  {item.likeCount}
                </Badge>
              </Group>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Card>
  );
}
