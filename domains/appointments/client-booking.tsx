'use client';

import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import {
  IconAlertCircle,
  IconCalendar,
  IconClock,
  IconSearch,
  IconUser,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Group,
  Loader,
  LoadingOverlay,
  Paper,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DatePicker, DatesProvider, DayProps } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import 'dayjs/locale/pt-br';

import utc from 'dayjs/plugin/utc';
import {
  bookAppointment,
  getAvailableDaysInMonth,
  getPublicSlotsByDay,
} from '@/domains/appointments/appointment-service';
// Ajuste o caminho
import {
  AvailabilitySlot,
  BookAppointmentPayload,
  ClientAddress,
} from '@/domains/appointments/types/appointments-types';
import { fetchAddressByZipCode } from '@/utils/address-helpers';

dayjs.locale('pt-br');
dayjs.extend(utc);

// Ajuste o caminho

// --- Funções Auxiliares ---
const formatSlotTime = (isoString: string): string => {
  // Usar dayjs para formatar a hora localmente
  return dayjs.utc(isoString).format('HH:mm');
};

// Formata Date/dayjs para YYYY-MM-DD (usando UTC para API e comparações)
const formatDateToYMD_UTC = (date: dayjs.Dayjs | Date | null): string => {
  if (!date) return '';
  // Garante que estamos trabalhando com dayjs e em UTC
  return dayjs(date).utc().format('YYYY-MM-DD');
};
// --- Fim Funções Auxiliares ---

interface ClientDetailsForm extends Omit<BookAppointmentPayload, 'slotId' | 'clientAddress'> {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  details?: string;
}

export default function ClientBookingPage() {
  const [activeStep, setActiveStep] = useState(0);
  // Usar dayjs para estado interno, converter para Date apenas para o DatePicker
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [viewedMonth, setViewedMonth] = useState(dayjs());
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null); // Erro específico para slots
  const [daysError, setDaysError] = useState<string | null>(null); // Erro específico para dias
  const [availableDatesSet, setAvailableDatesSet] = useState<Set<string>>(new Set());
  const [isLoadingAvailableDates, setIsLoadingAvailableDates] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const form = useForm<ClientDetailsForm>({
    initialValues: {
      clientName: '',
      clientPhone: '',
      notes: '',
      street: '',
      number: '',
      neighborhood: '',
      city: 'Guarapuava',
      state: 'PR',
      zipCode: '',
      details: '',
    },
    validate: {
      clientName: (value) => (value && value.trim().length > 0 ? null : 'Nome obrigatório'),
      clientPhone: (value) =>
        value && /^\+?[\d\s()-]{8,}$/.test(value) ? null : 'Telefone inválido',
      street: (value) => (value && value.trim() ? null : 'Rua obrigatória'),
      number: (value) => (value && value.trim() ? null : 'Número obrigatório'),
      neighborhood: (value) => (value && value.trim() ? null : 'Bairro obrigatório'),
      city: (value) => (value && value.trim() ? null : 'Cidade obrigatória'),
      state: (value) => (value && /^[A-Za-z]{2}$/.test(value) ? null : 'Estado (2 letras)'),
      zipCode: (value) => (value && /^[0-9]{5}-?[0-9]{3}$/.test(value) ? null : 'CEP inválido'),
      // notes and details are optional, no validators needed
    },
  });

  // --- Efeito para buscar DIAS disponíveis do MÊS ---
  useEffect(() => {
    setIsLoadingAvailableDates(true);
    setDaysError(null); // Limpa erro anterior
    getAvailableDaysInMonth()
      .then((dates) => {
        // Armazena as datas no formato YYYY-MM-DD (já vem assim da API)
        setAvailableDatesSet(new Set(dates));
      })
      .catch((err) => {
        console.error('Erro ao buscar dias disponíveis:', err);
        setDaysError('Não foi possível verificar os dias disponíveis.');
        setAvailableDatesSet(new Set());
      })
      .finally(() => {
        setIsLoadingAvailableDates(false);
      });
  }, [viewedMonth]); // Dispara quando o mês visualizado muda
  // --- Fim Efeito Dias Disponíveis ---

  // --- Efeito para buscar SLOTS do Dia Selecionado ---
  useEffect(() => {
    // Não busca se a data for nula
    if (!selectedDate) {
      setAvailableSlots([]);
      setSelectedSlotId(null);
      setSlotsError(null);
      return;
    }

    const dateStr = formatDateToYMD_UTC(selectedDate); // Usa a função UTC
    if (!dateStr) return;

    setIsLoadingSlots(true);
    setSelectedSlotId(null); // Reseta slot sempre que a data muda
    setSlotsError(null); // Limpa erro anterior

    getPublicSlotsByDay(dateStr)
      .then((slots) => setAvailableSlots(slots))
      .catch((err) => {
        console.error('Erro ao buscar horários:', err);
        setSlotsError('Não foi possível carregar os horários para este dia.');
        setAvailableSlots([]);
      })
      .finally(() => setIsLoadingSlots(false));
  }, [selectedDate]); // Dispara quando a data selecionada muda
  // --- Fim Efeito Slots ---

  const handleBookingSubmit = async (values: ClientDetailsForm) => {
    if (!selectedSlotId) return;

    setIsBooking(true);
    // Limpa apenas o erro de slots, não o de dias
    setSlotsError(null);

    const clientAddress: ClientAddress = {
      street: values.street,
      number: values.number,
      neighborhood: values.neighborhood,
      city: values.city,
      state: values.state.toUpperCase(),
      zipCode: values.zipCode,
      details: values.details,
    };
    const payload: BookAppointmentPayload = {
      slotId: selectedSlotId,
      clientName: values.clientName,
      clientPhone: values.clientPhone,
      clientAddress: clientAddress,
      notes: values.notes,
    };

    try {
      await bookAppointment(payload);
      notifications.show({
        title: 'Agendamento Confirmado!',
        message: 'Sua visita foi agendada com sucesso.',
        color: 'green',
      });
      setBookingSuccess(true);
      // Resetar estados após sucesso
      form.reset();
      setSelectedSlotId(null);
      // Opcional: voltar para o primeiro passo ou resetar a data
      // setActiveStep(0);
      // setSelectedDate(dayjs());
      // setViewedMonth(dayjs()); // Força recarga dos dias/slots
    } catch (err: any) {
      setSlotsError(err.message || 'Ocorreu um erro ao tentar agendar.'); // Mostrar erro no passo 3
      notifications.show({
        title: 'Erro no Agendamento',
        message: err.message || 'Não foi possível completar o agendamento.',
        color: 'red',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const nextStep = () => setActiveStep((current) => (current < 2 ? current + 1 : current));
  const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

  const handleDateSelectNext = () => {
    if (!selectedDate) {
      notifications.show({ message: 'Por favor, selecione uma data.', color: 'orange' });
      return;
    }
    // Verifica se a data selecionada tem disponibilidade ANTES de avançar
    const dateYMD = formatDateToYMD_UTC(selectedDate);
    if (!availableDatesSet.has(dateYMD)) {
      notifications.show({
        message: 'Não há horários disponíveis para a data selecionada.',
        color: 'orange',
      });
      return;
    }
    nextStep();
  };

  const handleSlotSelectNext = () => {
    if (!selectedSlotId) {
      notifications.show({ message: 'Por favor, selecione um horário.', color: 'orange' });
      return;
    }
    nextStep();
  };

  // --- Função para Estilizar Dias ---
  const getDayProps = useCallback(
    (date: Date): Partial<DayProps> & { style?: React.CSSProperties } => {
      // Converte a data do calendário para YYYY-MM-DD UTC
      const dateYMD = formatDateToYMD_UTC(date);
      // Converte a data SELECIONADA para YYYY-MM-DD UTC (se houver)
      const selectedDateYMD = selectedDate ? formatDateToYMD_UTC(selectedDate) : null;
      // Pega o início do dia atual em UTC para comparação
      const startOfTodayYMD = formatDateToYMD_UTC(dayjs().startOf('day'));

      const props: Partial<DayProps> & { style?: React.CSSProperties } = {};
      const isAvailable = availableDatesSet.has(dateYMD);
      const isPast = dateYMD < startOfTodayYMD; // Verifica se a data é anterior a hoje

      // 1. Desabilita dias passados (redundante com minDate, mas garante visualmente)
      //    E desabilita dias futuros SEM disponibilidade
      if (isPast || (!isAvailable && dateYMD >= startOfTodayYMD)) {
        props.disabled = true;
        props.style = {
          color: 'var(--mantine-color-gray-5)', // Cor cinza claro para desabilitado
          // Evita que o fundo verde apareça em dias passados que *tinham* disponibilidade
          backgroundColor: 'transparent',
        };
      }

      // 2. Estilo para dias disponíveis (não passados)
      if (isAvailable && !isPast) {
        props.style = {
          ...(props.style || {}), // Mantém a cor cinza se for desabilitado por outra razão (improvável aqui)
          // backgroundColor: 'var(--mantine-color-green-5)',
          fontWeight: 'bold',
          color: 'var(--mantine-color-gray-9)', // Texto escuro para melhor contraste
        };
      }

      // 3. Estilo para o dia SELECIONADO (SOBRESCREVE outros estilos)
      if (selectedDateYMD === dateYMD) {
        // Se o dia selecionado por acaso for um dia sem disponibilidade (ex: carregamento inicial antes da busca),
        // mantém desabilitado, senão, garante que é habilitado
        props.disabled = !isAvailable;

        props.style = {
          ...props.style, // Mantém borderRadius se disponível
          fontWeight: 'bold',
          backgroundColor: isAvailable
            ? 'var(--mantine-color-green-9)'
            : 'var(--mantine-color-gray-2)', // Azul se disponível, cinza se não
          color: isAvailable ? 'white' : 'var(--mantine-color-gray-5)', // Branco se disponível, cinza escuro se não
        };
      }

      return props;
    },
    [availableDatesSet, selectedDate]
  );
  // Depende das datas disponíveis E da data selecionada
  // --- Fim Função de Estilização ---

  const handleZipCodeBlur = async () => {
    const zipCode = form.values.zipCode;
    if (zipCode && /^\d{5}-?\d{3}$/.test(zipCode)) {
      // Verifica se tem valor e formato básico
      setIsFetchingAddress(true);
      setAddressError(null);
      try {
        const address = await fetchAddressByZipCode(zipCode);
        // Preenche os campos do formulário com os dados retornados
        form.setValues({
          street: address.street,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
        });
        // Opcional: Mover o foco para o campo 'Número'
        // document.getElementById('address-number-input')?.focus();
      } catch (error: any) {
        setAddressError(error.message);
        // Opcional: Limpar campos se o CEP for inválido/não encontrado
        // form.setValues({ street: '', neighborhood: '', city: '', state: '' });
        notifications.show({
          title: 'Erro no CEP',
          message: error.message,
          color: 'red',
        });
      } finally {
        setIsFetchingAddress(false);
      }
    } else {
      setAddressError(null); // Limpa erro se o formato for inválido
    }
  };

  if (bookingSuccess) {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder shadow="md" p="xl" radius="md" ta="center">
          <Stack align="center">
            <Title order={2} c="green.7">
              Agendamento Confirmado!
            </Title>
            <Text>Obrigado! Entraremos em contato em breve.</Text>
            <Button
              onClick={() => {
                setBookingSuccess(false); // Volta para o formulário
                setActiveStep(0);
                setSelectedDate(dayjs());
                setViewedMonth(dayjs()); // Dispara busca de dias/slots novamente
              }}
              mt="md"
            >
              Novo Agendamento
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <DatesProvider settings={{ locale: 'pt-br', firstDayOfWeek: 0 }}>
      <Container size="md" py="xl">
        <Stack gap="xl">
          <Title order={2} ta="center">
            Agende sua visita
          </Title>
          <Text ta="center" c="dimmed">
            Siga os passos para escolher o melhor horário.
          </Text>

          <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}>
            {/* ----- PASSO 1: DATA ----- */}
            <Stepper.Step
              label="Data"
              description="Escolha o dia"
              icon={<IconCalendar size={18} />}
            >
              <Paper withBorder shadow="xs" p="md" radius="md" mt="xl" pos="relative">
                <LoadingOverlay
                  visible={isLoadingAvailableDates}
                  overlayProps={{ radius: 'sm', blur: 1 }}
                />
                {/* Mostra erro se a busca de dias falhar */}
                {daysError && (
                  <Alert
                    title="Erro ao carregar calendário"
                    color="red"
                    icon={<IconAlertCircle />}
                    mb="md"
                  >
                    {daysError} Tente recarregar a página.
                  </Alert>
                )}

                <DatePicker
                  value={selectedDate?.toDate()} // Converte dayjs para Date
                  onChange={(date) => {
                    setSelectedDate(date ? dayjs(date) : null); // Converte Date para dayjs
                    // Não precisa resetar slotId aqui, o useEffect faz isso
                    // Não precisa resetar step aqui, o usuário pode querer voltar
                  }}
                  minDate={new Date()} // JS Date aqui é ok
                  allowDeselect={false} // Mantém sempre uma data selecionada
                  onMonthChange={(monthDate: any) => setViewedMonth(dayjs(monthDate))} // Atualiza com dayjs
                  // @ts-ignore
                  getDayProps={getDayProps}
                  // O onMonthChange não causa mais o warning se o 'month' não for controlado
                />

                <Group justify="flex-end" mt="md">
                  <Button
                    onClick={handleDateSelectNext}
                    disabled={
                      !selectedDate ||
                      isLoadingAvailableDates ||
                      !availableDatesSet.has(formatDateToYMD_UTC(selectedDate))
                    }
                  >
                    Próximo
                  </Button>
                </Group>
              </Paper>
            </Stepper.Step>

            {/* ----- PASSO 2: HORÁRIO ----- */}
            <Stepper.Step
              label="Horário"
              description="Selecione um horário"
              icon={<IconClock size={18} />}
              loading={isLoadingSlots}
            >
              <Paper
                // Usar key pode ajudar se houver problemas de renderização persistentes
                // key={selectedDate?.toISOString()}
                withBorder
                shadow="xs"
                p="md"
                radius="md"
                mt="xl"
                pos="relative"
              >
                <LoadingOverlay visible={isLoadingSlots} overlayProps={{ radius: 'sm', blur: 2 }} />
                {slotsError && !isLoadingSlots && (
                  <Alert title="Erro" color="red" icon={<IconAlertCircle />}>
                    {slotsError}
                  </Alert>
                )}
                {!isLoadingSlots && availableSlots.length > 0 && (
                  <SimpleGrid cols={{ base: 2, xs: 3, sm: 4 }} spacing="sm">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot._id}
                        variant={selectedSlotId === slot._id ? 'filled' : 'outline'} // Usar 'filled' para destaque
                        color={selectedSlotId === slot._id ? 'green' : 'blue'} // Cores diferentes
                        onClick={() => setSelectedSlotId(slot._id)}
                        disabled={slot.isBooked}
                        fullWidth
                      >
                        {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                      </Button>
                    ))}
                  </SimpleGrid>
                )}
                {!isLoadingSlots && availableSlots.length === 0 && !slotsError && (
                  <Text c="dimmed" ta="center">
                    Nenhum horário disponível para
                    {selectedDate ? selectedDate.format('DD/MM/YYYY') : 'a data selecionada'}.
                  </Text>
                )}
                <Group justify="space-between" mt="md">
                  <Button variant="default" onClick={prevStep}>
                    Voltar
                  </Button>
                  <Button onClick={handleSlotSelectNext} disabled={!selectedSlotId}>
                    Próximo
                  </Button>
                </Group>
              </Paper>
            </Stepper.Step>

            {/* ----- PASSO 3: DADOS ----- */}
            <Stepper.Step
              label="Dados"
              description="Informe seus contatos"
              icon={<IconUser size={18} />}
              loading={isBooking}
            >
              <Paper withBorder shadow="xs" p="md" radius="md" mt="xl" pos="relative">
                <Alert title="Atenção" color="blue" mb="md">
                  Após confirmar o agendamento, entraremos em contato para confirmar os detalhes da
                  visita. Por enquanto estamos atendendo apenas na cidade de{' '}
                  <b>Guarapuava - Entre Rios</b>.
                </Alert>
                <LoadingOverlay visible={isBooking} overlayProps={{ radius: 'sm', blur: 2 }} />

                <form onSubmit={form.onSubmit(handleBookingSubmit)}>
                  <Stack gap="md">
                    {/* ... Inputs mantidos ... */}
                    <TextInput
                      withAsterisk
                      label="Nome Completo"
                      placeholder="Seu nome"
                      {...form.getInputProps('clientName')}
                    />
                    <TextInput
                      withAsterisk
                      label="Telefone (WhatsApp)"
                      placeholder="(XX) XXXXX-XXXX"
                      {...form.getInputProps('clientPhone')}
                    />
                    <Title order={5} mt="sm">
                      Endereço da visita
                    </Title>
                    <Grid>
                      {/* ... Grid de endereço mantida ... */}
                      <Grid.Col span={{ base: 12, sm: 3 }}>
                        <TextInput
                          withAsterisk
                          label="CEP"
                          placeholder="XXXXX-XXX"
                          {...form.getInputProps('zipCode')}
                          onBlur={handleZipCodeBlur} // Chama a função ao sair do campo
                          error={addressError || form.errors.zipCode} // Mostra erro de busca ou validação
                          rightSection={
                            isFetchingAddress ? (
                              <Loader size="xs" />
                            ) : (
                              <ActionIcon
                                variant="subtle"
                                onClick={handleZipCodeBlur}
                                title="Buscar Endereço"
                              >
                                <IconSearch size={16} />
                              </ActionIcon>
                            )
                          }
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 7 }}>
                        <TextInput
                          withAsterisk
                          label="Rua / Avenida"
                          placeholder="Nome da rua"
                          {...form.getInputProps('street')}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 2 }}>
                        <TextInput
                          withAsterisk
                          label="Número"
                          placeholder="Ex: 123"
                          {...form.getInputProps('number')}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <TextInput
                          withAsterisk
                          label="Bairro"
                          placeholder="Seu bairro"
                          {...form.getInputProps('neighborhood')}
                        />
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <TextInput
                          disabled
                          withAsterisk
                          label="Cidade"
                          placeholder="Sua cidade"
                          {...form.getInputProps('city')}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <TextInput
                          disabled
                          withAsterisk
                          label="Estado (Sigla)"
                          placeholder="Ex: PR"
                          maxLength={2}
                          {...form.getInputProps('state')}
                        />
                      </Grid.Col>
                      <Grid.Col span={12}>
                        <TextInput
                          label="Complemento / Ponto de Referência"
                          placeholder="Ex: Apto 101, Próximo ao mercado"
                          {...form.getInputProps('details')}
                        />
                      </Grid.Col>
                    </Grid>
                    <Textarea
                      label="Observações (Opcional)"
                      placeholder="Alguma preferência ou informação adicional?"
                      {...form.getInputProps('notes')}
                    />

                    {/* Mostra erro específico do passo 3 (agendamento) */}
                    {slotsError && !isBooking && (
                      <Alert title="Erro ao Agendar" color="red" icon={<IconAlertCircle />} mt="md">
                        {slotsError}
                      </Alert>
                    )}

                    <Group justify="space-between" mt="md">
                      <Button variant="default" onClick={prevStep} disabled={isBooking}>
                        Voltar
                      </Button>
                      <Button type="submit" loading={isBooking} size="md">
                        Confirmar Agendamento
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </Paper>
            </Stepper.Step>
          </Stepper>
        </Stack>
      </Container>
    </DatesProvider>
  );
}
