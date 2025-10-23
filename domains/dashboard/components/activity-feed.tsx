// Você provavelmente já tem o dayjs no seu projeto Mantine
import dayjs from 'dayjs';
import Link from 'next/link';
import { IconCalendarEvent, IconHeart } from '@tabler/icons-react';
import { Card, ScrollArea, Stack, Text, ThemeIcon, Timeline, Title } from '@mantine/core';

import 'dayjs/locale/pt-br';

import relativeTime from 'dayjs/plugin/relativeTime';
import { ActivityFeedItem } from '../dashboard-service';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

interface ActivityFeedProps {
  feed: ActivityFeedItem[];
}

export function ActivityFeed({ feed }: ActivityFeedProps) {
  return (
    <Card withBorder radius="md" p="lg" h="100%">
      <Title order={4} mb="lg">
        Feed de Atividades
      </Title>
      {feed.length === 0 ? (
        <Text c="dimmed">Nenhuma atividade recente.</Text>
      ) : (
        <ScrollArea h={400}>
          {' '}
          {/* Garante altura fixa */}
          <Timeline active={feed.length} bulletSize={24} lineWidth={2}>
            {feed.map((item, index) => (
              <Timeline.Item
                key={index}
                title={item.type === 'APPOINTMENT' ? 'Novo Agendamento' : 'Produto Curtido'}
                bullet={
                  item.type === 'APPOINTMENT' ? (
                    <ThemeIcon size="xs" variant="light" radius="xl" color="blue">
                      <IconCalendarEvent size={14} />
                    </ThemeIcon>
                  ) : (
                    <ThemeIcon size="xs" variant="light" radius="xl" color="pink">
                      <IconHeart size={14} />
                    </ThemeIcon>
                  )
                }
              >
                <Text size="sm">
                  <Text
                    span
                    fw={700}
                    component={Link}
                    href={`/backoffice/clients/edit/${item.clientId}`}
                  >
                    {item.clientName}
                  </Text>
                  {item.type === 'APPOINTMENT'
                    ? ' fez um agendamento.'
                    : ` curtiu "${item.productName}".`}
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  {dayjs(item.date).fromNow()}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </ScrollArea>
      )}
    </Card>
  );
}
