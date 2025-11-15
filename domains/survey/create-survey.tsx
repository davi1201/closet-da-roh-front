'use client';

import React, { useEffect } from 'react';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Group, Paper, Radio, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form'; // Importa o hook principal

import { notifications } from '@mantine/notifications';
import { maskPhone } from '@/utils/formatters';
import { createSurveyResponse } from './survey-service';

// import { SurveyFormValues } from './types/survey-types'; // Opcional

// --- Constantes para as Opções (Mesmas de antes) ---

const optionsQ1 = [
  { value: 'daily', label: 'Diariamente' },
  { value: 'several_times', label: 'Algumas vezes por semana' },
  { value: 'rarely', label: 'Raramente (não se encaixa no perfil)' },
];

const optionsQ2 = [
  { value: 'knows_style', label: 'Sei exatamente o que gosto' },
  { value: 'likes_suggestions', label: 'Gosto de sugestões, mas tenho meu estilo' },
  { value: 'needs_help', label: 'Prefiro ajuda, pois fico insegura' },
];

const optionsQ3 = [
  { value: 'quality_fit', label: 'Qualidade e caimento (o preço é secundário)' },
  { value: 'cost_benefit', label: 'Custo-benefício (preço justo e boa qualidade)' },
  { value: 'price', label: 'O Preço (buscar o mais barato ou promoção)' },
  { value: 'brand_exclusivity', label: 'A Marca ou exclusividade' },
];

const optionsQ4 = [
  { value: 'store', label: 'Ir a uma loja comum (shopping ou rua)' },
  { value: 'online', label: 'Comprar 100% online' },
  { value: 'home_delivery', label: 'Atendimento em casa (mala delivery)' },
  { value: 'scheduled_appointment', label: 'Atendimento com hora marcada (em loja exclusiva)' },
];

const optionsQ5a = [
  { value: 'convenience', label: 'A Conveniência (não sair de casa / loja vazia)' },
  { value: 'consultancy', label: 'A Consultoria (ter alguém focado em você)' },
];

const optionsQ5b = [
  { value: 'obligation_to_buy', label: 'A "obrigação" de ter que comprar' },
  { value: 'scheduling_difficulty', label: 'A dificuldade de agendar' },
  { value: 'prefers_browsing_alone', label: 'Prefiro a liberdade de olhar sozinha' },
];

const optionsQ6 = [
  { value: '25-34', label: '25-34 anos' },
  { value: '35-44', label: '35-44 anos' },
  { value: '45-54', label: '45-54 anos' },
  { value: '55+', label: '55+ anos' },
];

export function SurveyForm() {
  const form = useForm({
    initialValues: {
      name: '' as string | null,
      phone: '' as string | null,
      frequency: null as string | null,
      style_preference: null as string | null,
      priority_in_purchase: null as string | null,
      preferred_sales_model: null as string | null,
      exclusive_service_attraction: null as string | null,
      personalized_service_drawback: null as string | null,
      age_range: null as string | null,
      occupation: '',
    },

    // --- Validação Nativa do Mantine ---
    validate: (values) => ({
      frequency: values.frequency ? null : 'Campo obrigatório',
      style_preference: values.style_preference ? null : 'Campo obrigatório',
      priority_in_purchase: values.priority_in_purchase ? null : 'Campo obrigatório',
      preferred_sales_model: values.preferred_sales_model ? null : 'Campo obrigatório',
      age_range: values.age_range ? null : 'Campo obrigatório',
      occupation: values.occupation.length >= 2 ? null : 'Por favor, informe sua profissão.',

      // Validação condicional para Q5
      exclusive_service_attraction:
        values.preferred_sales_model === 'home_delivery' ||
        values.preferred_sales_model === 'scheduled_appointment'
          ? values.exclusive_service_attraction
            ? null
            : 'Campo obrigatório'
          : null,
      personalized_service_drawback:
        values.preferred_sales_model === 'store' || values.preferred_sales_model === 'online'
          ? values.personalized_service_drawback
            ? null
            : 'Campo obrigatório'
          : null,
    }),
  });

  // --- Lógica de Submissão ---
  const { mutate, isPending, error } = useMutation({
    mutationFn: createSurveyResponse,
    onSuccess: () => {
      notifications.show({
        title: 'Obrigado!',
        message: 'Sua resposta foi enviada com sucesso.',
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      form.reset();
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Ocorreu um erro ao enviar sua resposta.';
      notifications.show({
        title: 'Erro',
        message: message,
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    // @ts-ignore
    mutate(values);
  };

  // --- Lógica Condicional (Q5) ---

  const selectedModel = form.values.preferred_sales_model;

  const showQ5a = selectedModel === 'home_delivery' || selectedModel === 'scheduled_appointment';

  const showQ5b = selectedModel === 'store' || selectedModel === 'online';

  useEffect(() => {
    if (showQ5a) {
      form.setFieldValue('personalized_service_drawback', null);
    } else if (showQ5b) {
      form.setFieldValue('exclusive_service_attraction', null);
    }
  }, [selectedModel, showQ5a, showQ5b, form]);

  return (
    <Paper shadow="md" p="xl" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="xl">
          <Title order={2}>Pesquisa de Hábitos de Compra</Title>

          <TextInput label="Nome" placeholder="Digite seu nome" {...form.getInputProps('name')} />

          <TextInput
            label="Telefone"
            placeholder="Digite seu telefone"
            value={maskPhone(form.values.phone || '')}
            onChange={(event) => form.setFieldValue('phone', event.currentTarget.value)}
          />

          {/* Bloco 1: Perfil e Estilo */}
          <Radio.Group
            label="1. Com que frequência você precisa se vestir de forma mais formal ou social para o trabalho?"
            withAsterisk
            {...form.getInputProps('frequency')}
          >
            <Stack mt="xs" gap="xs">
              {optionsQ1.map((opt) => (
                <Radio key={opt.value} value={opt.value} label={opt.label} />
              ))}
            </Stack>
          </Radio.Group>

          <Radio.Group
            label="2. Sobre seu estilo, qual frase combina mais com você?"
            withAsterisk
            {...form.getInputProps('style_preference')}
          >
            <Stack mt="xs" gap="xs">
              {optionsQ2.map((opt) => (
                <Radio key={opt.value} value={opt.value} label={opt.label} />
              ))}
            </Stack>
          </Radio.Group>

          <Radio.Group
            label="3. O que é mais importante ao comprar uma peça-chave para o trabalho (como um blazer ou vestido)?"
            withAsterisk
            {...form.getInputProps('priority_in_purchase')}
          >
            <Stack mt="xs" gap="xs">
              {optionsQ3.map((opt) => (
                <Radio key={opt.value} value={opt.value} label={opt.label} />
              ))}
            </Stack>
          </Radio.Group>

          {/* Bloco 2: Modelo de Atendimento */}
          <Radio.Group
            label="4. Para comprar um look novo de trabalho, qual destes cenários você prefere?"
            withAsterisk
            {...form.getInputProps('preferred_sales_model')}
          >
            <Stack mt="xs" gap="xs">
              {optionsQ4.map((opt) => (
                <Radio key={opt.value} value={opt.value} label={opt.label} />
              ))}
            </Stack>
          </Radio.Group>

          {/* Q5a (Condicional) */}
          {showQ5a && (
            <Radio.Group
              label="5. O que mais te atrai nesse serviço exclusivo?"
              withAsterisk
              {...form.getInputProps('exclusive_service_attraction')}
            >
              <Stack mt="xs" gap="xs">
                {optionsQ5a.map((opt) => (
                  <Radio key={opt.value} value={opt.value} label={opt.label} />
                ))}
              </Stack>
            </Radio.Group>
          )}

          {/* Q5b (Condicional) */}
          {showQ5b && (
            <Radio.Group
              label="5. O que mais te incomoda nos serviços personalizados (em casa ou hora marcada)?"
              withAsterisk
              {...form.getInputProps('personalized_service_drawback')}
            >
              <Stack mt="xs" gap="xs">
                {optionsQ5b.map((opt) => (
                  <Radio key={opt.value} value={opt.value} label={opt.label} />
                ))}
              </Stack>
            </Radio.Group>
          )}

          {/* Bloco 3: Fechamento */}
          <Radio.Group
            label="6. Qual sua faixa etária?"
            withAsterisk
            {...form.getInputProps('age_range')}
          >
            <Stack mt="xs" gap="xs">
              {optionsQ6.map((opt) => (
                <Radio key={opt.value} value={opt.value} label={opt.label} />
              ))}
            </Stack>
          </Radio.Group>

          <TextInput
            label="7. E qual sua área de atuação profissional?"
            placeholder="Ex: Advogada, Banco, TI, etc."
            withAsterisk
            {...form.getInputProps('occupation')}
          />

          {error && !form.isDirty() && (
            <Alert title="Erro na Submissão" color="red" icon={<IconAlertCircle />}>
              {(error as any).response?.data?.message || 'Não foi possível enviar o formulário.'}
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={isPending}>
              Enviar Resposta
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
