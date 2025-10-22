import { Text } from '@mantine/core';
import ClientForm from '@/forms/client-form';

export default function CreateClient() {
  return (
    <>
      <Text size="xl" fw={700} mb="md">
        Cadastrar Cliente
      </Text>
      <ClientForm />
    </>
  );
}
