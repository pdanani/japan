import { Title, Text, Card, Badge, Group, Stack, Avatar, Divider } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { travelers } from '../data/tripData';

const ALLERGY_COLORS = ['red', 'orange', 'grape', 'pink'];

function getInitials(name) {
  return name.split(/[\s/]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function TravelGroup() {
  const withAllergies = travelers.filter(t => t.allergies);
  const withoutAllergies = travelers.filter(t => !t.allergies);

  return (
    <>
      <Title order={2} mb={4}>Allergies</Title>
      <Text c="dimmed" size="sm" mb="lg">
        {withAllergies.length} of {travelers.length} travelers have allergies — keep these in mind when choosing restaurants!
      </Text>

      <Stack gap="md" mb="xl">
        {withAllergies.map((t, i) => (
          <Card key={i} shadow="sm" padding="lg" radius="md" withBorder
            style={{ borderLeft: `4px solid var(--mantine-color-red-5)` }}
          >
            <Group wrap="nowrap" gap="md">
              <Avatar color={ALLERGY_COLORS[i % ALLERGY_COLORS.length]} radius="xl" size={48}>
                {getInitials(t.name)}
              </Avatar>
              <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={700} size="md">{t.name}</Text>
                <Badge
                  size="lg"
                  variant="light"
                  color="red"
                  radius="sm"
                  leftSection={<IconAlertTriangle size={14} />}
                  styles={{ root: { justifyContent: 'flex-start', height: 'auto', padding: '6px 10px' } }}
                >
                  {t.allergies}
                </Badge>
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>

      <Divider mb="md" />
      <Text c="dimmed" size="xs">
        No allergies: {withoutAllergies.map(t => t.name).join(', ')}
      </Text>
    </>
  );
}
