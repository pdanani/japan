import { useState, useMemo } from 'react';
import {
  TextInput, Title, Text, SimpleGrid, Card, Badge, Group, Anchor,
  SegmentedControl, Chip, Stack, Tooltip, ActionIcon, Collapse, Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconMapPin, IconUser, IconExternalLink, IconFilter, IconX } from '@tabler/icons-react';

const CAT_COLORS = {
  shopping: 'pink', cameras: 'pink',
  site: 'green', sites: 'green',
  activity: 'violet', 'day trip': 'indigo', overnight: 'indigo',
  music: 'grape', drinks: 'grape',
};

function getCatColor(cat) {
  const c = cat.toLowerCase();
  for (const [key, color] of Object.entries(CAT_COLORS)) {
    if (c.includes(key)) return color;
  }
  return 'gray';
}

// Split compound names like "Pawan/Adrian" or "Adrian / Angel" into individual names
function splitNames(name) {
  if (!name) return [];
  return name.split(/\s*[/,]\s*/).map(n => n.trim()).filter(Boolean);
}

export default function Activities({ data }) {
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [filtersOpen, { toggle: toggleFilters }] = useDisclosure(true);

  const locations = useMemo(() => ['All', ...[...new Set(data.map(a => a.location).filter(Boolean))].sort()], [data]);
  const categories = useMemo(() => [...new Set(data.map(a => a.category).filter(Boolean))].sort(), [data]);
  const people = useMemo(() => [...new Set(data.flatMap(a => splitNames(a.name)))].sort(), [data]);

  const filtered = useMemo(() => {
    let items = data;
    if (locFilter !== 'All') items = items.filter(a => a.location === locFilter);
    if (selectedCategories.length > 0) items = items.filter(a => selectedCategories.includes(a.category));
    if (selectedPeople.length > 0) items = items.filter(a => splitNames(a.name).some(n => selectedPeople.includes(n)));
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(a =>
        a.details.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) ||
        (a.notes || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, locFilter, selectedCategories, selectedPeople, search]);

  const hasActiveFilters = locFilter !== 'All' || selectedCategories.length > 0 || selectedPeople.length > 0 || search;

  return (
    <>
      <Group justify="space-between" align="flex-end" mb="md">
        <div>
          <Title order={2}>Activities</Title>
          <Text c="dimmed" size="sm">
            {filtered.length} thing{filtered.length !== 1 ? 's' : ''} to see, do, and explore
          </Text>
        </div>
        <Group gap="xs">
          {hasActiveFilters && (
            <Tooltip label="Clear all filters">
              <ActionIcon variant="subtle" color="gray" onClick={() => { setLocFilter('All'); setSelectedCategories([]); setSelectedPeople([]); setSearch(''); }}>
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          <ActionIcon variant="light" color={filtersOpen ? 'red' : 'gray'} onClick={toggleFilters} size="lg" radius="md">
            <IconFilter size={18} />
          </ActionIcon>
        </Group>
      </Group>

      <Collapse in={filtersOpen}>
        <Card withBorder radius="md" p="md" mb="lg" bg="gray.0">
          <Stack gap="sm">
            <TextInput
              placeholder="Search activities, sites, shops..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={e => setSearch(e.currentTarget.value)}
              radius="md"
            />

            <div>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={6}>City</Text>
              <SegmentedControl
                value={locFilter}
                onChange={setLocFilter}
                data={locations}
                size="xs"
                radius="xl"
                color="red"
              />
            </div>

            <div>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={6}>Type</Text>
              <Chip.Group multiple value={selectedCategories} onChange={setSelectedCategories}>
                <Group gap={6}>
                  {categories.map(c => (
                    <Chip key={c} value={c} size="xs" variant="outline" color={getCatColor(c)} radius="xl">{c}</Chip>
                  ))}
                </Group>
              </Chip.Group>
            </div>

            <div>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={6}>Suggested by</Text>
              <Chip.Group multiple value={selectedPeople} onChange={setSelectedPeople}>
                <Group gap={6}>
                  {people.map(p => (
                    <Chip key={p} value={p} size="xs" variant="outline" color="violet" radius="xl">{p}</Chip>
                  ))}
                </Group>
              </Chip.Group>
            </div>
          </Stack>
        </Card>
      </Collapse>

      {filtered.length === 0 ? (
        <Card withBorder radius="md" p="xl" ta="center" bg="gray.0">
          <Text c="dimmed">No activities match your filters.</Text>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {filtered.map((a, i) => (
            <Card key={i} shadow="sm" padding="md" radius="md" withBorder
              style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                <Text fw={600} size="sm" style={{ flex: 1, lineHeight: 1.4 }}>{a.details}</Text>
                <Badge size="sm" variant="light" color={getCatColor(a.category)} radius="sm">{a.category}</Badge>
              </Group>

              <Group gap={6} mt={4}>
                {a.location && <Badge size="xs" variant="light" color="blue" radius="sm">{a.location}</Badge>}
                {splitNames(a.name).map(n => (
                  <Badge key={n} size="xs" variant="light" color="violet" radius="sm">{n}</Badge>
                ))}
              </Group>

              {(a.notes || a.interested) && <Divider my="xs" />}
              {a.notes && <Text size="xs" c="dimmed" lineClamp={3}>{a.notes}</Text>}
              {a.interested && (
                <Text size="xs" c="dimmed" mt={4}>
                  <Text span size="xs" fw={500} c="violet">Also interested:</Text> {a.interested}
                </Text>
              )}
              {a.link && (
                <Anchor href={a.link} target="_blank" size="xs" mt="sm" fw={500}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  View details <IconExternalLink size={12} />
                </Anchor>
              )}
            </Card>
          ))}
        </SimpleGrid>
      )}
    </>
  );
}
