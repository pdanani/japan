import {
  Title, Text, Card, Grid, Progress, Checkbox, Anchor, ThemeIcon,
  Stack, Group, RingProgress, Paper, Badge, Divider,
} from '@mantine/core';
import { IconLink, IconNote, IconCheck, IconClock, IconCircle } from '@tabler/icons-react';
import { tasks, links, notes } from '../data/tripData';

export default function Planning() {
  const done = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const todo = tasks.length - done - pending;
  const pct = Math.round((done / tasks.length) * 100);

  return (
    <>
      <Title order={2} mb={4}>Planning</Title>
      <Text c="dimmed" size="sm" mb="lg">Checklist, links, and notes</Text>

      {/* Stats row */}
      <Group mb="xl" gap="md">
        <Card withBorder radius="md" p="md" style={{ flex: 1 }}>
          <Group>
            <RingProgress
              size={64} thickness={6} roundCaps
              sections={[
                { value: pct, color: 'teal' },
                { value: (pending / tasks.length) * 100, color: 'yellow' },
              ]}
              label={<Text ta="center" fw={700} size="sm">{pct}%</Text>}
            />
            <div>
              <Text fw={600} size="sm">Progress</Text>
              <Group gap="xs" mt={4}>
                <Badge size="xs" color="teal" variant="light">{done} done</Badge>
                <Badge size="xs" color="yellow" variant="light">{pending} pending</Badge>
                <Badge size="xs" color="gray" variant="light">{todo} to do</Badge>
              </Group>
            </div>
          </Group>
        </Card>
      </Group>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Title order={4} mb="sm">Checklist</Title>
          <Stack gap={4}>
            {tasks.map((t, i) => (
              <Card key={i} padding="xs" px="sm" radius="sm" withBorder
                bg={t.status === 'done' ? 'teal.0' : t.status === 'pending' ? 'yellow.0' : 'white'}
                style={{ borderLeft: `3px solid ${t.status === 'done' ? '#059669' : t.status === 'pending' ? '#eab308' : '#e5e7eb'}` }}
              >
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon
                    size={22} radius="xl" variant="light"
                    color={t.status === 'done' ? 'teal' : t.status === 'pending' ? 'yellow' : 'gray'}
                  >
                    {t.status === 'done' ? <IconCheck size={13} /> : t.status === 'pending' ? <IconClock size={13} /> : <IconCircle size={13} />}
                  </ThemeIcon>
                  <Text size="sm"
                    td={t.status === 'done' ? 'line-through' : ''}
                    c={t.status === 'done' ? 'dimmed' : ''}
                    style={{ flex: 1 }}
                  >
                    {t.task}
                  </Text>
                </Group>
              </Card>
            ))}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Title order={4} mb="sm">Useful Links</Title>
          <Stack gap={8}>
            {links.map((l, i) => (
              <Anchor key={i} href={l.url} target="_blank" underline="never">
                <Card padding="sm" radius="md" withBorder
                  style={{ transition: 'all 0.15s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#b91c1c'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon variant="light" color="red" size="md" radius="md">
                      <IconLink size={16} />
                    </ThemeIcon>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>{l.label}</Text>
                      {l.desc && <Text size="xs" c="dimmed">{l.desc}</Text>}
                    </div>
                  </Group>
                </Card>
              </Anchor>
            ))}
          </Stack>

          <Divider my="xl" />

          <Title order={4} mb="sm">Notes</Title>
          <Stack gap={8}>
            {notes.map((n, i) => (
              <Card key={i} padding="sm" radius="md"
                style={{ background: '#fef3c7', borderLeft: '3px solid #c9a96e' }}>
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon variant="transparent" color="yellow.8" size="sm">
                    <IconNote size={16} />
                  </ThemeIcon>
                  <Text size="sm" c="yellow.9" style={{ flex: 1 }}>{n}</Text>
                </Group>
              </Card>
            ))}
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
