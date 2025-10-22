import { Group, Stack, Text } from '@mantine/core';

export default function SaleConfig() {
  return (
    <>
      <Stack>
        <Group align="center" justify="space-between" mb="md">
          <Text size="xl" fw={700}>
            Configurações de vendas
          </Text>
        </Group>
      </Stack>
    </>
  );
}
