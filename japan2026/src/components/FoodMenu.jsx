import { useState, useMemo } from 'react';
import {
  TextInput, Title, Text, SimpleGrid, Card, Badge, Group, Anchor,
  SegmentedControl, Chip, Divider, Stack, Tooltip, ActionIcon, Collapse,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconMapPin, IconUser, IconExternalLink, IconFilter, IconX } from '@tabler/icons-react';
import { getCatColor, splitNames } from '../utils';

export default function FoodMenu({ data }) {
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('All');
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [filtersOpen, { toggle: toggleFilters }] = useDisclosure(true);

  const locations = useMemo(() => ['All', ...new Set(data.map(f => f.location).filter(Boolean))].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)), [data]);
  const people = useMemo(() => [...new Set(data.flatMap(f => splitNames(f.name)))].sort(), [data]);

  const filtered = useMemo(() => {
    let items = data;
    if (locFilter !== 'All') items = items.filter(f => f.location === locFilter);
    if (selectedPeople.length > 0) items = items.filter(f => splitNames(f.name).some(n => selectedPeople.includes(n)));
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(f =>
        f.details.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) ||
        (f.neighborhood || '').toLowerCase().includes(q) || (f.notes || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, locFilter, selectedPeople, search]);

  const hasActiveFilters = locFilter !== 'All' || selectedPeople.length > 0 || search;

  return (
    <>
      <Group justify="space-between" align="flex-end" mb="md">
        <div>
          <Title order={2}>Food Menu</Title>
          <Text c="dimmed" size="sm">
            {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} across Japan
          </Text>
        </div>
        <Group gap="xs">
          {hasActiveFilters && (
            <Tooltip label="Clear all filters">
              <ActionIcon variant="subtle" color="gray" onClick={() => { setLocFilter('All'); setSelectedPeople([]); setSearch(''); }}>
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
        <Card withBorder radius="md" p="md" mb="lg">
          <Stack gap="sm">
            <TextInput
              placeholder="Search restaurants, categories, neighborhoods..."
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
                fullWidth
                color="red"
              />
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
        <Card withBorder radius="md" p="xl" ta="center">
          <Text c="dimmed">No restaurants match your filters.</Text>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {filtered.map((f, i) => (
            <Card key={i} shadow="sm" padding="md" radius="md" withBorder
              className="card-hoverable"
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                <Text fw={600} size="sm" style={{ flex: 1, lineHeight: 1.4 }}>{f.details}</Text>
                <Badge size="sm" variant="light" color={getCatColor(f.category)} radius="sm">{f.category}</Badge>
              </Group>

              <Group gap={6} mt={4}>
                {f.location && <Badge size="xs" variant="light" color="blue" radius="sm">{f.location}</Badge>}
                {f.neighborhood && <Badge size="xs" variant="light" color="teal" radius="sm">{f.neighborhood}</Badge>}
                {splitNames(f.name).map(n => (
                  <Badge key={n} size="xs" variant="light" color="violet" radius="sm">{n}</Badge>
                ))}
              </Group>

              {(f.notes || f.interested) && <Divider my="xs" />}
              {f.notes && <Text size="xs" c="dimmed" lineClamp={3}>{f.notes}</Text>}
              {f.interested && (
                <Text size="xs" c="dimmed" mt={4}>
                  <Text span size="xs" fw={500} c="violet">Also interested:</Text> {f.interested}
                </Text>
              )}
              {f.link && (
                <Anchor href={f.link} target="_blank" size="xs" mt="sm" fw={500}
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
