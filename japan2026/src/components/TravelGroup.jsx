import { Title, Text, SimpleGrid, Card, Avatar, Badge, Group, Stack, Tooltip, Divider } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconMail } from '@tabler/icons-react';
import { travelers } from '../data/tripData';

const COLORS = [
  'red', 'orange', 'yellow', 'green', 'teal',
  'cyan', 'blue', 'violet', 'grape', 'pink',
];

function getInitials(name) {
  return name.split(/[\s/]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function TravelGroup() {
  return (
    <>
      <Title order={2} mb={4}>Travel Group</Title>
      <Text c="dimmed" size="sm" mb="xs">{travelers.length} travelers heading to Japan</Text>
      <Group gap="xs" mb="lg">
        <Badge size="sm" variant="light" color="teal" leftSection={<IconCheck size={12} />}>
          {travelers.filter(t => t.rsvp === 'yes').length} confirmed
        </Badge>
        <Badge size="sm" variant="light" color="red" leftSection={<IconAlertTriangle size={12} />}>
          {travelers.filter(t => t.allergies).length} with allergies
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {travelers.map((t, i) => (
          <Card key={i} shadow="sm" padding="lg" radius="md" withBorder
            style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <Group wrap="nowrap" gap="md">
              <Avatar color={COLORS[i % COLORS.length]} radius="xl" size={56}>
                {getInitials(t.name)}
              </Avatar>
              <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={700} size="md">{t.name}</Text>
                <Group gap={4}>
                  <IconMail size={13} color="#9ca3af" />
                  <Text size="xs" c="dimmed" truncate>{t.email}</Text>
                </Group>
                <Group gap={6} mt={4}>
                  <Badge size="sm" variant="filled" color="teal" radius="sm" leftSection={<IconCheck size={10} />}>
                    Confirmed
                  </Badge>
                </Group>
                {t.allergies && (
                  <>
                    <Divider mt={8} mb={4} />
                    <Badge size="sm" variant="light" color="red" radius="sm"
                      leftSection={<IconAlertTriangle size={10} />}
                      fullWidth
                      styles={{ root: { justifyContent: 'flex-start' } }}
                    >
                      {t.allergies}
                    </Badge>
                  </>
                )}
              </Stack>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
