import { useState, useMemo } from 'react';
import {
  TextInput, Title, Text, SimpleGrid, Card, Badge, Group, Anchor, Switch,
  SegmentedControl, Chip, Divider, Stack, Tooltip, ActionIcon, Collapse, Slider, ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSearch, IconMapPin, IconUser, IconExternalLink, IconFilter, IconX,
  IconStarFilled, IconToolsKitchen2,
} from '@tabler/icons-react';
import { getCatColor, splitNames, parsePrice, NON_JAPANESE, filterTabelogList, extractCuisineTags } from '../utils';
import { tabelogAll } from '../data/tabelogAll';

const INITIAL_SHOW = 50;

export default function FoodMenu({ data }) {
  const [tab, setTab] = useState('tabelog');

  // === Our Picks state ===
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('All');
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [filtersOpen, { toggle: toggleFilters }] = useDisclosure(true);

  // === Tabelog state ===
  const [tSearch, setTSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState('all');
  const [japaneseOnly, setJapaneseOnly] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState([]);
  const [stationFilter, setStationFilter] = useState('');
  const [showAll, setShowAll] = useState(false);

  // === Our Picks logic ===
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

  // === Tabelog logic ===
  const cuisineTags = useMemo(() => extractCuisineTags(tabelogAll, japaneseOnly), [japaneseOnly]);

  const tabelogFiltered = useMemo(() => {
    let items = filterTabelogList(tabelogAll, { maxPrice, minRating, cuisineFilter, japaneseOnly });
    if (tSearch) {
      const q = tSearch.toLowerCase();
      items = items.filter(r =>
        r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q) ||
        r.station.toLowerCase().includes(q)
      );
    }
    if (stationFilter) {
      const q = stationFilter.toLowerCase();
      items = items.filter(r => r.station.toLowerCase().includes(q));
    }
    return items;
  }, [maxPrice, minRating, cuisineFilter, japaneseOnly, tSearch, stationFilter]);

  const tHasFilters = maxPrice < 15000 || minRating !== 'all' || cuisineFilter.length > 0 || japaneseOnly || tSearch || stationFilter;
  const tResetAll = () => { setMaxPrice(15000); setMinRating('all'); setCuisineFilter([]); setJapaneseOnly(false); setTSearch(''); setStationFilter(''); setShowAll(false); };

  const visibleTabelog = showAll ? tabelogFiltered : tabelogFiltered.slice(0, INITIAL_SHOW);

  return (
    <>
      <Group justify="space-between" align="flex-end" mb="md">
        <div>
          <Title order={2}>Food Menu</Title>
          <Text c="dimmed" size="sm">
            {tab === 'tabelog'
              ? `${tabelogFiltered.length} Tabelog-rated restaurants`
              : `${filtered.length} restaurant${filtered.length !== 1 ? 's' : ''} from our picks`
            }
          </Text>
        </div>
      </Group>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        fullWidth
        size="sm"
        radius="xl"
        color="red"
        mb="lg"
        data={[
          { label: `⭐ Tabelog Top 1200`, value: 'tabelog' },
          { label: `🍽 Our Picks (${data.length})`, value: 'picks' },
        ]}
      />

      {/* ========== TABELOG TAB ========== */}
      {tab === 'tabelog' && (
        <>
          <Card withBorder radius="md" p="md" mb="lg">
            <Stack gap="sm">
              <TextInput
                placeholder="Search name, cuisine, or station..."
                leftSection={<IconSearch size={16} />}
                value={tSearch}
                onChange={e => { setTSearch(e.currentTarget.value); setShowAll(false); }}
                radius="md"
              />

              <Group gap={6} wrap="nowrap">
                <Text size="xs" fw={500} c="dimmed" style={{ flexShrink: 0 }}>Price:</Text>
                <div style={{ flex: 1, padding: '0 4px 16px 4px' }}>
                  <Slider
                    value={maxPrice}
                    onChange={(v) => { setMaxPrice(v); setShowAll(false); }}
                    min={1000} max={15000} step={1000}
                    label={(v) => v >= 15000 ? 'Any' : `¥${(v / 1000).toFixed(0)}k`}
                    color="orange" size="xs"
                    marks={[{ value: 1000, label: '¥1k' }, { value: 6000, label: '¥6k' }, { value: 15000, label: 'Any' }]}
                  />
                </div>
              </Group>

              <Group gap={6} wrap="nowrap">
                <Text size="xs" fw={500} c="dimmed" style={{ flexShrink: 0 }}>Rating:</Text>
                <SegmentedControl
                  size="xs" radius="xl" color="yellow"
                  value={minRating}
                  onChange={(v) => { setMinRating(v); setShowAll(false); }}
                  data={[
                    { label: 'All', value: 'all' },
                    { label: '4.0+', value: '4.0' },
                    { label: '3.9+', value: '3.9' },
                    { label: '3.8+', value: '3.8' },
                    { label: '3.7+', value: '3.7' },
                  ]}
                />
                {tHasFilters && (
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={tResetAll}>
                    <IconX size={14} />
                  </ActionIcon>
                )}
              </Group>

              <Switch
                size="xs"
                label="Japanese food only"
                checked={japaneseOnly}
                onChange={(e) => { setJapaneseOnly(e.currentTarget.checked); setCuisineFilter([]); setShowAll(false); }}
                color="red"
                styles={{ label: { fontSize: 12, color: 'var(--mantine-color-dimmed)', paddingLeft: 6 } }}
              />

              <ScrollArea type="never">
                <Group gap={4} wrap="nowrap">
                  {cuisineTags.map(([key, label]) => (
                    <Badge
                      key={key}
                      size="xs"
                      variant={cuisineFilter.includes(key) ? 'filled' : 'outline'}
                      color={cuisineFilter.includes(key) ? 'orange' : 'gray'}
                      radius="xl"
                      style={{ cursor: 'pointer', flexShrink: 0 }}
                      onClick={() => {
                        setCuisineFilter(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);
                        setShowAll(false);
                      }}
                    >
                      {label}
                    </Badge>
                  ))}
                </Group>
              </ScrollArea>
            </Stack>
          </Card>

          {tabelogFiltered.length === 0 ? (
            <Card withBorder radius="md" p="xl" ta="center">
              <Text c="dimmed">No restaurants match these filters. Try adjusting price or rating.</Text>
            </Card>
          ) : (
            <>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {visibleTabelog.map((r, i) => (
                  <Card key={`${r.name}-${i}`} shadow="sm" padding="md" radius="md" withBorder
                    className="card-hoverable"
                    style={{ borderLeft: '2px solid var(--mantine-color-orange-5)' }}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                      <Group gap={6} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        <Badge size="xs" variant="filled" color="orange" radius="sm" style={{ flexShrink: 0 }}>
                          #{i + 1}
                        </Badge>
                        <Text fw={600} size="sm" truncate>{r.name}</Text>
                      </Group>
                      <Group gap={4} style={{ flexShrink: 0 }}>
                        <IconStarFilled size={12} color="#f59f00" />
                        <Text size="xs" fw={700} c="yellow.8">{r.rating}</Text>
                      </Group>
                    </Group>

                    <Text size="xs" c="dimmed" truncate>{r.cuisine}</Text>

                    <Group gap={6} mt={8}>
                      <Badge size="xs" variant="light" color="gray" radius="sm">{r.price}</Badge>
                      <Badge size="xs" variant="light" color="blue" radius="sm">{r.station}</Badge>
                    </Group>

                    {r.lat && r.lng && (
                      <Anchor
                        href={`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`}
                        target="_blank" size="xs" mt="sm" fw={500}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        View on map <IconExternalLink size={12} />
                      </Anchor>
                    )}
                  </Card>
                ))}
              </SimpleGrid>

              {!showAll && tabelogFiltered.length > INITIAL_SHOW && (
                <Group justify="center" mt="md">
                  <Badge
                    size="lg" variant="light" color="orange" radius="md"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowAll(true)}
                  >
                    Show all {tabelogFiltered.length} restaurants
                  </Badge>
                </Group>
              )}
            </>
          )}
        </>
      )}

      {/* ========== OUR PICKS TAB ========== */}
      {tab === 'picks' && (
        <>
          <Group justify="flex-end" mb="sm">
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
                    value={locFilter} onChange={setLocFilter}
                    data={locations} size="xs" radius="xl" fullWidth color="red"
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
                <Card key={i} shadow="sm" padding="md" radius="md" withBorder className="card-hoverable">
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
      )}
    </>
  );
}
