import { useState } from 'react';
import {
  Timeline as MTimeline, Title, Text, Badge, Group, Card,
  ThemeIcon, ScrollArea, UnstyledButton,
} from '@mantine/core';
import {
  IconMapPin, IconCalendar, IconCoffee, IconShoppingCart,
  IconTorii, IconUsers, IconBed, IconMusic, IconWalk,
  IconTrain, IconMoodEmpty, IconExternalLink, IconStarFilled,
  IconFlame, IconTable, IconBrandGoogleMaps,
  IconRobot,
} from '@tabler/icons-react';
import { timeline } from '../data/tripData';
import { nearbyFinds } from '../data/nearbyFinds';
import { getPlacesForDay } from '../data/savedPlaces';

const TYPE_CONFIG = {
  transport: { color: 'violet', icon: IconTrain, label: 'Transport' },
  food: { color: 'orange', icon: IconCoffee, label: 'Food' },
  group: { color: 'blue', icon: IconUsers, label: 'Group' },
  shopping: { color: 'pink', icon: IconShoppingCart, label: 'Shopping' },
  site: { color: 'green', icon: IconTorii, label: 'Site' },
  rest: { color: 'gray', icon: IconBed, label: 'Rest' },
  activity: { color: 'yellow', icon: IconMusic, label: 'Activity' },
};

const SOURCE_CONFIG = {
  sheet:      { icon: IconTable, color: 'blue', label: 'Timeline', tip: 'PB Draft Timeline' },
  activities: { icon: IconTable, color: 'teal', label: 'Excel', tip: 'Activity Menu sheet' },
  food:       { icon: IconTable, color: 'teal', label: 'Excel', tip: 'Food Menu sheet' },
  maps:       { icon: IconBrandGoogleMaps, color: 'red', label: 'Maps', tip: 'Google Maps saves' },
  tabelog:    { icon: IconStarFilled, color: 'yellow', label: 'Tabelog', tip: 'Tabelog Top Spots' },
  ai:         { icon: IconRobot, color: 'grape', label: 'AI', tip: 'AI suggested' },
};

function SourceBadge({ source }) {
  const cfg = SOURCE_CONFIG[source];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <Badge
      size="xs" variant="light" color={cfg.color} radius="sm"
      leftSection={<Icon size={10} />} style={{ flexShrink: 0 }} title={cfg.tip}
    >
      {cfg.label}
    </Badge>
  );
}

export default function TimelineSection({ onNearbyRecs }) {
  const [selected, setSelected] = useState(1);

  const day = timeline.find(d => d.day === selected);
  const tabelogList = nearbyFinds[selected] || [];
  const savedList = getPlacesForDay(selected);
  const hasNearby = tabelogList.length > 0 || savedList.length > 0;

  return (
    <>
      <Title order={2} mb={4}>Trip Timeline</Title>
      <Text c="dimmed" size="sm" mb="lg">Day-by-day itinerary</Text>

      {/* Activity type legend */}
      <Group gap="xs" mb={6}>
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <Badge key={key} size="sm" variant="dot" color={cfg.color}>{cfg.label}</Badge>
        ))}
      </Group>
      {/* Source legend */}
      <Group gap="xs" mb="md">
        <Text size="xs" c="dimmed" fw={500}>Source:</Text>
        {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Badge key={key} size="xs" variant="light" color={cfg.color} leftSection={<Icon size={10} />}>
              {cfg.label}
            </Badge>
          );
        })}
      </Group>

      {/* Day selector tabs */}
      <ScrollArea type="never" mb="lg">
        <Group gap={8} wrap="nowrap">
          {timeline.map(d => {
            const active = d.day === selected;
            return (
              <UnstyledButton
                key={d.day}
                onClick={() => setSelected(d.day)}
                style={{
                  flexShrink: 0, minWidth: 82,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 10,
                  border: `1px solid ${active ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-gray-3)'}`,
                  background: active ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-body)',
                  color: active ? 'white' : 'var(--mantine-color-text)',
                  transition: 'all 0.2s',
                  boxShadow: active ? '0 2px 8px rgba(185,28,28,0.2)' : 'none',
                }}
              >
                <Text size="10px" fw={600} tt="uppercase" opacity={active ? 0.85 : 0.5}>
                  {d.day === 0 ? 'Travel' : d.day === 15 ? 'End' : `Day ${d.day}`}
                </Text>
                <Text size="sm" fw={700} lh={1.3}>{d.date.replace('July ', '7/')}</Text>
                <Text size="10px" opacity={active ? 0.8 : 0.5} mt={2}>
                  {d.location.length > 13 ? d.location.slice(0, 13) + '...' : d.location}
                </Text>
              </UnstyledButton>
            );
          })}
        </Group>
      </ScrollArea>

      {/* Selected day detail */}
      {day && (
        <>
          <Card withBorder radius="md" p="lg" mb="md" style={{ borderLeft: '2px solid var(--mantine-color-red-6)' }}>
            <Title order={3} size="h4">
              {day.day === 0 ? 'Travel Day' : day.day === 15 ? 'Departure' : `Day ${day.day} — ${day.dayOfWeek}`}
            </Title>
            <Group gap="md" mt={4}>
              <Group gap={4}><IconCalendar size={14} color="var(--mantine-color-gray-5)" /><Text size="sm" c="dimmed">{day.date}</Text></Group>
              <Group gap={4}><IconMapPin size={14} color="var(--mantine-color-gray-5)" /><Text size="sm" c="dimmed">{day.location}</Text></Group>
              {day.schedule.length > 0 && (
                <Badge size="sm" variant="light" color="red">{day.schedule.length} activities</Badge>
              )}
            </Group>
            {day.notes && (
              <Text size="sm" c="dimmed" mt="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>{day.notes}</Text>
            )}
          </Card>

          {day.schedule.length > 0 ? (
            <MTimeline active={day.schedule.length - 1} bulletSize={28} lineWidth={2} ml="xs">
              {day.schedule.map((s, i) => {
                const cfg = TYPE_CONFIG[s.type] || { color: 'red', icon: IconWalk, label: '' };
                const Icon = cfg.icon;
                return (
                  <MTimeline.Item
                    key={`${selected}-${i}`}
                    bullet={
                      <ThemeIcon size={28} radius="xl" color={cfg.color} variant="filled">
                        <Icon size={14} />
                      </ThemeIcon>
                    }
                    title={
                      <Group gap={6} wrap="nowrap">
                        <Text size="sm" fw={600} style={s.suggested ? { fontStyle: 'italic' } : undefined}>
                          {s.activity}
                        </Text>
                        {s.suggested && (
                          <Badge size="xs" variant="light" color="grape" radius="sm" style={{ flexShrink: 0 }}>
                            suggested
                          </Badge>
                        )}
                      </Group>
                    }
                  >
                    <Group gap="xs" mt={2}>
                      <Badge size="xs" variant="light" color="gray" radius="sm">{s.time}</Badge>
                      <Badge size="xs" variant="light" color={cfg.color}>{cfg.label}</Badge>
                      {s.source && <SourceBadge source={s.source} />}
                      {s.mapUrl && (
                        <Badge
                          component="a" href={s.mapUrl} target="_blank" rel="noopener noreferrer"
                          size="xs" variant="outline" color="red" radius="sm"
                          rightSection={<IconExternalLink size={10} />}
                          style={{ cursor: 'pointer', textDecoration: 'none' }}
                        >
                          Maps
                        </Badge>
                      )}
                    </Group>
                  </MTimeline.Item>
                );
              })}
            </MTimeline>
          ) : (
            <Card withBorder radius="md" p="xl" ta="center">
              <IconMoodEmpty size={32} color="#9ca3af" style={{ margin: '0 auto' }} />
              <Text c="dimmed" size="sm" mt="xs">No detailed schedule yet for this day.</Text>
              <Text c="dimmed" size="xs" mt={4}>Check Food & Activities for ideas!</Text>
            </Card>
          )}

          {/* Nearby Recs — navigate to dedicated view */}
          {hasNearby && onNearbyRecs && (
            <Card
              withBorder radius="md" p="md" mt="lg"
              style={{ cursor: 'pointer', borderColor: '#fed7aa', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ea580c'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(234,88,12,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#fed7aa'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              onClick={() => onNearbyRecs(selected)}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <ThemeIcon size={36} radius="md" variant="light" color="orange">
                    <IconFlame size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">Nearby Recs</Text>
                    <Text size="xs" c="dimmed">
                      {tabelogList.length} Tabelog · {savedList.length} saved — {day.notes || day.location}
                    </Text>
                  </div>
                </Group>
                <Group gap={6}>
                  <Badge size="sm" variant="light" color="orange">{savedList.length + tabelogList.length}</Badge>
                  <Text c="dimmed" size="lg">›</Text>
                </Group>
              </Group>
            </Card>
          )}
        </>
      )}
    </>
  );
}
