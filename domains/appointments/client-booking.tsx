'use client';

import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IconAlertCircle,
  IconCalendar,
  IconCheck,
  IconClock,
  IconSearch, // Mantido para o CEP
  IconUser,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Alert,
  Button,
  Container,
  Grid,
  Group,
  Loader, // Mantido para o CEP
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
import { useRouter } from 'next/navigation';
import {
  bookAppointment,
  getAvailableDaysInMonth,
  getPublicSlotsByDay,
} from '@/domains/appointments/appointment-service';
import {
  AvailabilitySlot,
  BookAppointmentPayload,
  ClientAddress,
} from '@/domains/appointments/types/appointments-types';
import { fetchAddressByZipCode } from '@/utils/address-helpers';
import { maskPhone } from '@/utils/formatters';

dayjs.locale('pt-br');
dayjs.extend(utc);

// ============================================
// TIPOS E INTERFACES
// ============================================

interface ClientData {
  id: string;
  name: string;
  phone: string;
  address?: ClientAddress;
}

interface ClientDetailsForm extends Omit<BookAppointmentPayload, 'slotId' | 'clientAddress'> {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  details?: string;
}

interface BookingPageProps {
  isAdminMode?: boolean;
  preSelectedClient?: ClientData; // Este cliente é obrigatório no modo admin
  onSuccess?: (appointmentId: string) => void;
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const formatSlotTime = (isoString: string): string => {
  return dayjs.utc(isoString).format('HH:mm');
};

const formatDateToYMD_UTC = (date: dayjs.Dayjs | Date | null): string => {
  if (!date) return '';
  return dayjs(date).utc().format('YYYY-MM-DD');
};

// ============================================
// HOOKS REMOVIDOS
// ============================================

// useClientSearch foi removido.

// ============================================
// HOOK CUSTOMIZADO PARA DISPONIBILIDADE
// ============================================

const useAvailability = () => {
  const [availableDatesSet, setAvailableDatesSet] = useState<Set<string>>(new Set());
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [daysError, setDaysError] = useState<string | null>(null);
  const [viewedMonth, setViewedMonth] = useState(dayjs());

  useEffect(() => {
    setIsLoadingDates(true);
    setDaysError(null);

    getAvailableDaysInMonth()
      .then((dates) => setAvailableDatesSet(new Set(dates)))
      .catch((err) => {
        console.error('Erro ao buscar dias disponíveis:', err);
        setDaysError('Não foi possível verificar os dias disponíveis.');
        setAvailableDatesSet(new Set());
      })
      .finally(() => setIsLoadingDates(false));
  }, [viewedMonth]);

  return {
    availableDatesSet,
    isLoadingDates,
    daysError,
    viewedMonth,
    setViewedMonth,
  };
};

// ============================================
// HOOK CUSTOMIZADO PARA SLOTS
// ============================================

const useSlots = (selectedDate: dayjs.Dayjs | null) => {
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      setSelectedSlotId(null);
      setSlotsError(null);
      return;
    }

    const dateStr = formatDateToYMD_UTC(selectedDate);
    if (!dateStr) return;

    setIsLoadingSlots(true);
    setSelectedSlotId(null);
    setSlotsError(null);

    getPublicSlotsByDay(dateStr)
      .then((slots) => setAvailableSlots(slots))
      .catch((err) => {
        console.error('Erro ao buscar horários:', err);
        setSlotsError('Não foi possível carregar os horários para este dia.');
        setAvailableSlots([]);
      })
      .finally(() => setIsLoadingSlots(false));
  }, [selectedDate]);

  return {
    availableSlots,
    isLoadingSlots,
    slotsError,
    setSlotsError,
    selectedSlotId,
    setSelectedSlotId,
  };
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function BookingPage({
  isAdminMode = false,
  preSelectedClient,
  onSuccess,
}: BookingPageProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Hooks customizados
  // useClientSearch foi removido
  const { availableDatesSet, isLoadingDates, daysError, viewedMonth, setViewedMonth } =
    useAvailability();
  const {
    availableSlots,
    isLoadingSlots,
    slotsError,
    setSlotsError,
    selectedSlotId,
    setSelectedSlotId,
  } = useSlots(selectedDate);

  // Lógica de "hasRegisteredClient" simplificada
  const hasRegisteredClient = useMemo(() => {
    return isAdminMode;
  }, [isAdminMode]);

  const totalSteps = hasRegisteredClient ? 2 : 3;
  const maxStep = totalSteps - 1;

  const form = useForm<ClientDetailsForm>({
    initialValues: {
      // Pré-preenche os dados se for admin, senão começa vazio
      clientName: preSelectedClient?.name || '',
      clientPhone: preSelectedClient?.phone || '',
      notes: '',
      street: preSelectedClient?.address?.street || '',
      number: preSelectedClient?.address?.number || '',
      neighborhood: preSelectedClient?.address?.neighborhood || '',
      city: 'Guarapuava',
      state: 'PR',
      zipCode: preSelectedClient?.address?.zipCode || '',
      details: preSelectedClient?.address?.details || '',
    },
    validate: {
      // Validação agora é pulada se 'hasRegisteredClient' (isAdminMode) for true
      clientName: (value) => (value?.trim() ? null : 'Nome obrigatório'),
      clientPhone: (value) =>
        value && /^\+?[\d\s()-]{8,}$/.test(value) ? null : 'Telefone inválido',
      street: (value) => (hasRegisteredClient || value?.trim() ? null : 'Rua obrigatória'),
      number: (value) => (hasRegisteredClient || value?.trim() ? null : 'Número obrigatório'),
      neighborhood: (value) => (hasRegisteredClient || value?.trim() ? null : 'Bairro obrigatório'),
      city: (value) => (hasRegisteredClient || value?.trim() ? null : 'Cidade obrigatória'),
      state: (value) =>
        hasRegisteredClient || (value && /^[A-Za-z]{2}$/.test(value)) ? null : 'Estado (2 letras)',
      zipCode: (value) =>
        hasRegisteredClient || (value && /^[0-9]{5}-?[0-9]{3}$/.test(value))
          ? null
          : 'CEP inválido',
    },
  });

  // handleClientSelect e searchClients foram removidos

  const handleZipCodeBlur = async () => {
    const zipCode = form.values.zipCode;
    if (zipCode && /^\d{5}-?\d{3}$/.test(zipCode)) {
      setIsFetchingAddress(true);
      setAddressError(null);

      try {
        const address = await fetchAddressByZipCode(zipCode);
        form.setValues({
          street: address.street,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
        });
      } catch (error: any) {
        setAddressError(error.message);
        notifications.show({
          title: 'Erro no CEP',
          message: error.message,
          color: 'red',
        });
      } finally {
        setIsFetchingAddress(false);
      }
    }
  };

  // ============================================
  // FUNÇÃO DE SUBMISSÃO (LÓGICA PRINCIPAL ATUALIZADA)
  // ============================================
  const handleBookingSubmit = async (values: ClientDetailsForm) => {
    if (!selectedSlotId) return;

    // Validação extra para modo admin
    if (isAdminMode && !preSelectedClient?.id) {
      notifications.show({
        title: 'Erro de Admin',
        message: 'O ID do cliente não foi fornecido para o agendamento.',
        color: 'red',
      });
      return;
    }

    setIsBooking(true);
    setSlotsError(null);

    let payload: Omit<
      BookAppointmentPayload,
      'notes' | 'clientPhone' | 'clientName' | 'clientAddress'
    > & { clientId?: string };

    if (isAdminMode && preSelectedClient) {
      payload = {
        slotId: selectedSlotId,
        clientId: preSelectedClient.id,
      };
    } else {
      // --- MODO PÚBLICO ---
      // Envia os dados completos do formulário.
      const clientAddress: ClientAddress = {
        street: values.street,
        number: values.number,
        neighborhood: values.neighborhood,
        city: values.city,
        state: values.state.toUpperCase(),
        zipCode: values.zipCode,
        details: values.details,
      };

      payload = {
        slotId: selectedSlotId,
        // @ts-ignore
        clientName: values.clientName,
        clientPhone: values.clientPhone,
        clientAddress: clientAddress,
        notes: values.notes,
      };
    }

    try {
      // @ts-ignore
      const result = await bookAppointment(payload);

      notifications.show({
        title: 'Agendamento Confirmado!',
        message: isAdminMode
          ? `Visita agendada para ${preSelectedClient?.name}`
          : 'Sua visita foi agendada com sucesso.',
        color: 'green',
      });

      setBookingSuccess(true);

      if (onSuccess) {
        onSuccess(result._id || '');
      } else {
        router.push(isAdminMode ? '/admin/appointments' : `/products/${values.clientPhone}`);
      }

      form.reset();
      setSelectedSlotId(null);
    } catch (err: any) {
      setSlotsError(err.message || 'Ocorreu um erro ao tentar agendar.');
      notifications.show({
        title: 'Erro no Agendamento',
        message: err.message || 'Não foi possível completar o agendamento.',
        color: 'red',
      });
    } finally {
      setIsBooking(false);
    }
  };
  // ============================================
  // FIM DA FUNÇÃO DE SUBMISSÃO
  // ============================================

  const nextStep = () => setActiveStep((current) => (current < maxStep ? current + 1 : current));
  const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

  const handleDateSelectNext = () => {
    if (!selectedDate) {
      notifications.show({ message: 'Por favor, selecione uma data.', color: 'orange' });
      return;
    }

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

    // Se for admin (hasRegisteredClient = true), finaliza direto
    if (hasRegisteredClient) {
      handleBookingSubmit(form.values);
    } else {
      nextStep();
    }
  };

  const getDayProps = useCallback(
    (date: Date): Partial<DayProps> & { style?: React.CSSProperties } => {
      const dateYMD = formatDateToYMD_UTC(date);
      const selectedDateYMD = selectedDate ? formatDateToYMD_UTC(selectedDate) : null;
      const startOfTodayYMD = formatDateToYMD_UTC(dayjs().startOf('day'));

      const props: Partial<DayProps> & { style?: React.CSSProperties } = {};
      const isAvailable = availableDatesSet.has(dateYMD);
      const isPast = dateYMD < startOfTodayYMD;

      if (isPast || (!isAvailable && dateYMD >= startOfTodayYMD)) {
        props.disabled = true;
        props.style = {
          color: 'var(--mantine-color-gray-5)',
          backgroundColor: 'transparent',
        };
      }

      if (isAvailable && !isPast) {
        props.style = {
          ...(props.style || {}),
          fontWeight: 'bold',
          color: 'var(--mantine-color-gray-9)',
        };
      }

      if (selectedDateYMD === dateYMD) {
        props.disabled = !isAvailable;
        props.style = {
          ...props.style,
          fontWeight: 'bold',
          backgroundColor: isAvailable
            ? 'var(--mantine-color-green-9)'
            : 'var(--mantine-color-gray-2)',
          color: isAvailable ? 'white' : 'var(--mantine-color-gray-5)',
        };
      }

      return props;
    },
    [availableDatesSet, selectedDate]
  );

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  if (bookingSuccess) {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder shadow="md" p="xl" radius="md" ta="center">
          <Stack align="center">
            <Title order={2} c="green.7">
              Agendamento Confirmado!
            </Title>
            <Text>
              {isAdminMode
                ? 'O cliente foi agendado com sucesso.'
                : 'Obrigado! Entraremos em contato em breve.'}
            </Text>
            <Button
              onClick={() => {
                setBookingSuccess(false);
                setActiveStep(0);
                setSelectedDate(dayjs());
                setViewedMonth(dayjs());
                form.reset();
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
            {isAdminMode ? 'Agendar Visita para Cliente' : 'Agende sua visita'}
          </Title>
          <Text ta="center" c="dimmed">
            {hasRegisteredClient
              ? 'Escolha a data e horário para a visita'
              : 'Siga os passos para escolher o melhor horário.'}
          </Text>

          {/* O formulário de busca de cliente foi REMOVIDO daqui */}

          {/* Mostra info do cliente pré-selecionado (Modo Admin) */}
          {preSelectedClient && isAdminMode && (
            <Alert color="green" title="Agendando para:">
              <Text size="sm">
                <strong>{preSelectedClient.name}</strong> - {preSelectedClient.phone}
                {preSelectedClient.address && (
                  <>
                    <br />
                    {preSelectedClient.address.street}, {preSelectedClient.address.number} -{' '}
                    {preSelectedClient.address.neighborhood}
                  </>
                )}
              </Text>
            </Alert>
          )}

          <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}>
            {/* PASSO 1: DATA */}
            <Stepper.Step
              label="Data"
              description="Escolha o dia"
              icon={<IconCalendar size={18} />}
            >
              <Paper withBorder shadow="xs" p="md" radius="md" mt="xl" pos="relative">
                <LoadingOverlay visible={isLoadingDates} overlayProps={{ radius: 'sm', blur: 1 }} />
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
                  value={selectedDate?.toDate()}
                  onChange={(date) => setSelectedDate(date ? dayjs(date) : null)}
                  minDate={new Date()}
                  allowDeselect={false}
                  onMonthChange={(monthDate: any) => setViewedMonth(dayjs(monthDate))}
                  // @ts-ignore
                  getDayProps={getDayProps}
                />

                <Group justify="flex-end" mt="md">
                  <Button
                    onClick={handleDateSelectNext}
                    disabled={
                      !selectedDate ||
                      isLoadingDates ||
                      !availableDatesSet.has(formatDateToYMD_UTC(selectedDate))
                    }
                  >
                    Próximo
                  </Button>
                </Group>
              </Paper>
            </Stepper.Step>

            {/* PASSO 2: HORÁRIO */}
            <Stepper.Step
              label="Horário"
              description="Selecione um horário"
              icon={<IconClock size={18} />}
              loading={isLoadingSlots}
            >
              <Paper withBorder shadow="xs" p="md" radius="md" mt="xl" pos="relative">
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
                        variant={selectedSlotId === slot._id ? 'filled' : 'outline'}
                        color={selectedSlotId === slot._id ? 'green' : 'blue'}
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
                    Nenhum horário disponível para{' '}
                    {selectedDate ? selectedDate.format('DD/MM/YYYY') : 'a data selecionada'}.
                  </Text>
                )}
                <Group justify="space-between" mt="md">
                  <Button variant="default" onClick={prevStep}>
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSlotSelectNext}
                    disabled={!selectedSlotId}
                    loading={hasRegisteredClient && isBooking} // Botão de "Confirmar"
                  >
                    {hasRegisteredClient ? 'Confirmar Agendamento' : 'Próximo'}
                  </Button>
                </Group>
              </Paper>
            </Stepper.Step>

            {/* PASSO 3: DADOS (Renderização condicional AGORA FUNCIONA) */}
            {!hasRegisteredClient && (
              <Stepper.Step
                label="Dados"
                description="Informe os contatos"
                icon={<IconUser size={18} />}
                loading={isBooking}
              >
                <Paper withBorder shadow="xs" p="md" radius="md" mt="xl" pos="relative">
                  {!isAdminMode && ( // isAdminMode será false aqui
                    <Alert title="Atenção" color="blue" mb="md">
                      Após confirmar o agendamento, entraremos em contato para confirmar os detalhes
                      da visita. Por enquanto estamos atendendo apenas na cidade de{' '}
                      <b>Guarapuava - Entre Rios</b>.
                    </Alert>
                  )}
                  <LoadingOverlay visible={isBooking} overlayProps={{ radius: 'sm', blur: 2 }} />

                  <form onSubmit={form.onSubmit(handleBookingSubmit)}>
                    <Stack gap="md">
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
                        value={maskPhone(form.values.clientPhone)}
                        onChange={(event) =>
                          form.setFieldValue('clientPhone', event.currentTarget.value)
                        }
                      />

                      <Title order={5} mt="sm">
                        Endereço da visita
                      </Title>

                      <Grid>
                        <Grid.Col span={{ base: 12, sm: 3 }}>
                          <TextInput
                            withAsterisk
                            label="CEP"
                            placeholder="XXXXX-XXX"
                            {...form.getInputProps('zipCode')}
                            onBlur={handleZipCodeBlur}
                            error={addressError || form.errors.zipCode}
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

                      {slotsError && !isBooking && (
                        <Alert
                          title="Erro ao Agendar"
                          color="red"
                          icon={<IconAlertCircle />}
                          mt="md"
                        >
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
            )}

            {/* PASSO COMPLETADO (visual apenas) */}
            {hasRegisteredClient && (
              <Stepper.Completed>
                <Paper withBorder shadow="xs" p="md" radius="md" mt="xl">
                  <Stack align="center" gap="md">
                    <IconCheck size={48} color="green" />
                    <Title order={3}>Agendamento Realizado!</Title>
                  </Stack>
                </Paper>
              </Stepper.Completed>
            )}
          </Stepper>
        </Stack>
      </Container>
    </DatesProvider>
  );
}
