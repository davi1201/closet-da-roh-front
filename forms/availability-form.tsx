'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import { IconAlertCircle, IconClock, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Calendar, DatesProvider, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import 'dayjs/locale/pt-br';

import {
  CreateAvailabilityPayload,
  createAvailabilitySlots,
} from '@/domains/availability/availability-service';

dayjs.locale('pt-br');
dayjs.extend(utc);

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface AvailabilityFormValues {
  timeRanges: TimeRange[];
  selectedDates: Date[];
}

export default function AdminAvailabilityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlotsPreview, setGeneratedSlotsPreview] = useState<CreateAvailabilityPayload[]>(
    []
  );
  const [selectedCalendarDates, setSelectedCalendarDates] = useState<string[]>([]);

  const form = useForm<AvailabilityFormValues>({
    initialValues: {
      timeRanges: [{ startTime: '09:00', endTime: '12:00' }],
      selectedDates: [],
    },
    validate: {
      timeRanges: (ranges) => {
        if (!ranges || ranges.length === 0) return 'Adicione pelo menos um bloco de horário.';
        for (const range of ranges) {
          if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(range.startTime))
            return 'Hora de início inválida em um dos blocos.';
          if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(range.endTime))
            return 'Hora de término inválida em um dos blocos.';
          const startM =
            parseInt(range.startTime.split(':')[0]) * 60 + parseInt(range.startTime.split(':')[1]);
          const endM =
            parseInt(range.endTime.split(':')[0]) * 60 + parseInt(range.endTime.split(':')[1]);
          if (endM <= startM)
            return 'Hora de término deve ser após a hora de início em todos os blocos.';
        }
        return null;
      },
      selectedDates: (value) => (value.length === 0 ? 'Selecione pelo menos uma data' : null),
    },
  });

  const handleCalendarSelect = (date: Date) => {
    const dateISOString = dayjs(date).toISOString();
    setSelectedCalendarDates((current) => {
      const isSelected = current.some((s) => dayjs(date).isSame(s, 'date'));
      let newSelected: string[];
      if (isSelected) {
        newSelected = current.filter((d) => !dayjs(d).isSame(date, 'date'));
      } else {
        newSelected = [...current, dateISOString];
      }
      form.setFieldValue(
        'selectedDates',
        newSelected.map((d) => dayjs(d).toDate())
      );
      return newSelected;
    });
  };

  const generateSlots = (): CreateAvailabilityPayload[] => {
    const { timeRanges, selectedDates } = form.values;
    const slots: CreateAvailabilityPayload[] = [];
    setError(null);

    const validationResult = form.validate();
    if (validationResult.hasErrors) {
      setError('Verifique os campos obrigatórios e formatos.');
      setGeneratedSlotsPreview([]);
      return [];
    }

    selectedDates.forEach((date) => {
      const dayUTC = dayjs.utc(date).startOf('day');

      timeRanges.forEach((range) => {
        const startHour = parseInt(range.startTime.split(':')[0], 10);
        const startMinute = parseInt(range.startTime.split(':')[1], 10);
        const endHour = parseInt(range.endTime.split(':')[0], 10);
        const endMinute = parseInt(range.endTime.split(':')[1], 10);

        if (endHour * 60 + endMinute <= startHour * 60 + startMinute) {
          setError(`Bloco inválido: ${range.startTime}-${range.endTime}`);
          return;
        }

        const slotStartDateTimeUTC = dayUTC.hour(startHour).minute(startMinute);
        const slotEndDateTimeUTC = dayUTC.hour(endHour).minute(endMinute);

        slots.push({
          startTime: slotStartDateTimeUTC.toISOString(),
          endTime: slotEndDateTimeUTC.toISOString(),
        });
      });
    });

    slots.sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());
    setGeneratedSlotsPreview(slots);
    return slots;
  };

  const handleSubmit = async () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    const slotsToCreate = generateSlots();

    console.log(slotsToCreate);

    return;

    if (error) return;
    if (slotsToCreate.length === 0) {
      notifications.show({ color: 'orange', title: 'Atenção', message: 'Nenhum horário gerado.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await createAvailabilitySlots(slotsToCreate);
      notifications.show({
        title: 'Sucesso!',
        message: `${slotsToCreate.length} horários criados.`,
        color: 'green',
      });
      form.reset();
      setSelectedCalendarDates([]);
      setGeneratedSlotsPreview([]);
    } catch (err: any) {
      setError(err.message || 'Não foi possível salvar os horários.');
      notifications.show({
        title: 'Erro',
        message: err.message || 'Erro inesperado.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values]);

  const timeRangeFields = form.values.timeRanges.map((_, index) => (
    <Group key={index} grow align="flex-end" mb="xs">
      <TimeInput
        label={index === 0 ? 'Horário de Início' : undefined}
        {...form.getInputProps(`timeRanges.${index}.startTime`)}
        leftSection={<IconClock size={16} />}
      />
      <TimeInput
        label={index === 0 ? 'Horário de Término' : undefined}
        {...form.getInputProps(`timeRanges.${index}.endTime`)}
        leftSection={<IconClock size={16} />}
      />
      <ActionIcon
        color="red"
        variant="light"
        onClick={() => form.removeListItem('timeRanges', index)}
        disabled={form.values.timeRanges.length <= 1}
        title="Remover bloco de horário"
        style={{ alignSelf: 'flex-end', marginBottom: '4px' }}
      >
        <IconTrash size={18} />
      </ActionIcon>
    </Group>
  ));

  return (
    <DatesProvider settings={{ locale: 'pt-br', firstDayOfWeek: 0 }}>
      <Paper withBorder shadow="md" p="lg" radius="md" pos="relative">
        <LoadingOverlay visible={isLoading} overlayProps={{ radius: 'sm', blur: 2 }} />
        <Title order={3} mb="lg">
          Cadastrar Horários Disponíveis
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <Paper withBorder p="md" radius="sm">
              <Text fw={500} mb="sm">
                1. Defina os blocos de horário disponíveis:
              </Text>
              {timeRangeFields}
              <Button
                variant="light"
                size="xs"
                mt="xs"
                leftSection={<IconPlus size={14} />}
                onClick={() => form.insertListItem('timeRanges', { startTime: '', endTime: '' })}
              >
                Adicionar outro bloco de horário
              </Button>
              {form.errors.timeRanges && (
                <Text c="red" size="xs" mt="xs">
                  {form.errors.timeRanges}
                </Text>
              )}
            </Paper>

            <Paper withBorder p="md" radius="sm">
              <Text fw={500} mb="sm">
                2. Selecione os dias para aplicar estes horários:
              </Text>
              <Calendar
                getDayProps={(date) => ({
                  selected: selectedCalendarDates.some((s) => dayjs(date).isSame(s, 'date')),
                  //@ts-ignore
                  onClick: () => handleCalendarSelect(date),
                })}
                minDate={dayjs().startOf('day').toDate()}
              />
              {form.errors.selectedDates && (
                <Text c="red" size="xs" mt="xs">
                  {form.errors.selectedDates}
                </Text>
              )}
            </Paper>

            {generatedSlotsPreview.length > 0 && (
              <Paper withBorder p="md" radius="sm">
                <Text fw={500} size="sm" mb="xs">
                  Horários que serão criados ({generatedSlotsPreview.length}):
                </Text>
                <SimpleGrid cols={{ base: 3, xs: 4, sm: 5 }} spacing="xs">
                  {generatedSlotsPreview.slice(0, 15).map((slot, i) => (
                    <Text
                      size="md"
                      key={i}
                      p={8}
                      style={{
                        border: '1px solid var(--mantine-color-gray-3)',
                        borderRadius: '4px',
                        textAlign: 'center',
                      }}
                    >
                      {dayjs.utc(slot.startTime).format('DD/MM HH:mm')} -{' '}
                      {dayjs.utc(slot.endTime).format('HH:mm')}
                    </Text>
                  ))}
                  {generatedSlotsPreview.length > 15 && <Text size="xs">...</Text>}
                </SimpleGrid>
              </Paper>
            )}

            {error && (
              <Alert title="Erro" color="red" icon={<IconAlertCircle />}>
                {error}
              </Alert>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                type="submit"
                leftSection={<IconPlus size={18} />}
                loading={isLoading}
                disabled={
                  form.values.selectedDates.length === 0 || Object.keys(form.errors).length > 0
                }
              >
                Adicionar{' '}
                {generatedSlotsPreview.length > 0
                  ? `${generatedSlotsPreview.length} Horários`
                  : 'Horários'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </DatesProvider>
  );
}
