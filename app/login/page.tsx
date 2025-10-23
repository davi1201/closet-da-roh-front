'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importe useRouter

import { IconAlertCircle } from '@tabler/icons-react';
import {
  Alert,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth/use-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pegue a ação 'login' do store
  const login = useAuthStore((state) => state.login);
  const router = useRouter(); // Para redirecionar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/users/login', { email, password });

      // Chame a ação 'login' do Zustand
      login(data);

      // Redirecione manualmente
      router.push('/backoffice/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center style={{ height: '100vh' }}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md" style={{ width: 400 }}>
        <form onSubmit={handleSubmit}>
          <Stack>
            <Title order={2} ta="center">
              Login Admin
            </Title>

            <TextInput
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Senha"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />

            {error && (
              <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                {error}
              </Alert>
            )}

            <Button type="submit" loading={isLoading} fullWidth>
              Entrar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
