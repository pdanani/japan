import { useState, useMemo } from 'react';
import {
  Title, Text, Card, Badge, Group, SimpleGrid, Anchor, Divider,
  TextInput, SegmentedControl, Chip, Switch, Stack, ActionIcon, Slider,
  ThemeIcon, Button, Tooltip, Loader,
} from '@mantine/core';
import {
  IconStarFilled, IconMapPin, IconExternalLink, IconArrowLeft,
  IconFlame, IconCurrentLocation,
} from '@tabler/icons-react';
import { nearbyFinds } from '../data/nearbyFinds';
import { getPlacesForDay } from '../data/savedPlaces';
import { timeline } from '../data/tripData';
import { AREA_COORDS } from '../data/coords';
import { parsePrice, getCatColor, haversine, formatDist, extractCuisineTags, filterTabelogList, groupCuisineTags } from '../utils';

const PLACE_TYPE_COLORS = { food: 'orange', shopping: 'pink', site: 'green', activity: 'yellow' };

function getCoordForItem(item) {
  if (item.station) {
    if (AREA_COORDS[item.station]) return AREA_COORDS[item.station];
    for (const [key, coord] of Object.entries(AREA_COORDS)) {
      if (item.station.toLowerCase().includes(key.toLowerCase())) return coord;
    }
  }
  if (item.area && AREA_COORDS[item.area]) return AREA_COORDS[item.area];
  if (item.city && AREA_COORDS[item.city]) return AREA_COORDS[item.city];
  return null;
}

export default function NearbyRecs({ dayNumber, onBack }) {
  const day = timeline.find(d => d.day === dayNumber);
  const tabelogList = nearbyFinds[dayNumber] || [];
  const savedList = getPlacesForDay(dayNumber);

  const [activeTab, setActiveTab] = useState(tabelogList.length > 0 ? 'tabelog' : 'saves');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState('all');
  const [japaneseOnly, setJapaneseOnly] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState([]);
  const [cuisineLayout, setCuisineLayout] = useState('grouped');
  const [typeFilter, setTypeFilter] = useState([]);
  const [areaFilter, setAreaFilter] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [sortNearest, setSortNearest] = useState(false);
  const [maxDistance, setMaxDistance] = useState(100);

  const fromSlider = (s) => {
    if (s >= 90) return Infinity;
    if (s <= 70) return s / 70;
    return 1.0 + (s - 70) / 20;
  };

  const distLabel = (s) => {
    if (s >= 90) return 'Any';
    const mi = fromSlider(s);
    return `${mi.toFixed(1)} mi`;
  };

  const requestLocation = () => {
    if (userLoc) {
      setSortNearest(prev => {
        if (prev) setMaxDistance(100);
        return !prev;
      });
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc([pos.coords.latitude, pos.coords.longitude]);
        setSortNearest(true);
        setLocLoading(false);
      },
      () => setLocLoading(false),
      { enableHighAccuracy: true }
    );
  };

  const addDistance = (items) => {
    if (!sortNearest || !userLoc) return items;
    const maxMi = fromSlider(maxDistance);
    return [...items].map(item => {
      const c = getCoordForItem(item);
      const distKm = c ? haversine(userLoc[0], userLoc[1], c[0], c[1]) : 9999;
      return { ...item, _dist: distKm };
    }).filter(item => item._dist * 0.621371 <= maxMi)
      .sort((a, b) => a._dist - b._dist);
  };

  const cuisineTags = useMemo(() => {
    return extractCuisineTags(tabelogList, japaneseOnly);
  }, [tabelogList, japaneseOnly]);
  const cuisineSections = useMemo(() => groupCuisineTags(cuisineTags), [cuisineTags]);

  const placeTypes = useMemo(() => [...new Set(savedList.map(p => p.type).filter(Boolean))].sort(), [savedList]);
  const savedAreas = useMemo(() => [...new Set(savedList.map(p => p.area || p.city || 'Other').filter(Boolean))].sort(), [savedList]);

  const filteredTabelog = useMemo(() => {
    return filterTabelogList(tabelogList, { maxPrice, minRating, cuisineFilter, japaneseOnly });
  }, [tabelogList, maxPrice, minRating, cuisineFilter, japaneseOnly]);

  const filteredSaves = useMemo(() => {
    let items = savedList;
    if (typeFilter.length > 0) items = items.filter(p => typeFilter.includes(p.type));
    if (areaFilter.length > 0) items = items.filter(p => areaFilter.includes(p.area || p.city || 'Other'));
    return items;
  }, [savedList, typeFilter, areaFilter]);

  const sortedTabelog = useMemo(() => addDistance(filteredTabelog), [filteredTabelog, sortNearest, userLoc, maxDistance]);
  const sortedSaves = useMemo(() => addDistance(filteredSaves), [filteredSaves, sortNearest, userLoc, maxDistance]);

  const groupedTabelog = useMemo(() => {
    if (sortNearest && userLoc) return [['Nearest first', sortedTabelog]];
    const g = {};
    sortedTabelog.forEach(r => { const k = r.station || 'Other'; if (!g[k]) g[k] = []; g[k].push(r); });
    return Object.entries(g);
  }, [sortedTabelog, sortNearest, userLoc]);

  const groupedSaves = useMemo(() => {
    if (sortNearest && userLoc) return [['Nearest first', sortedSaves]];
    const g = {};
    sortedSaves.forEach(p => { const k = p.area || p.city || 'Other'; if (!g[k]) g[k] = []; g[k].push(p); });
    return Object.entries(g);
  }, [sortedSaves, sortNearest, userLoc]);

  const hasActiveFilters = maxPrice < 15000 || minRating !== 'all' || cuisineFilter.length > 0 || japaneseOnly;

  const resetFilters = () => { setMaxPrice(15000); setMinRating('all'); setCuisineFilter([]); setJapaneseOnly(false); setMaxDistance(100); };

  return (
    <>
      {/* Header */}
      <Group justify="space-between" align="center" mb="md">
        <Group gap="sm">
          <ActionIcon variant="subtle" color="gray" size="lg" radius="xl" onClick={onBack}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <div>
            <Group gap="xs">
              <IconFlame size={20} color="#e85d04" />
              <Title order={3} size="h4">Nearby Recs</Title>
              <Badge size="sm" variant="light" color="orange">
                {tabelogList.length + savedList.length} spots
              </Badge>
            </Group>
            {day && (
              <Text size="xs" c="dimmed" mt={2}>
                Day {day.day} — {day.date} · {day.notes || day.location}
              </Text>
            )}
          </div>
        </Group>
        <Tooltip label={sortNearest ? 'Switch to grouped view' : 'Sort by your location'}>
          <ActionIcon
            variant={sortNearest ? 'filled' : 'light'}
            color={sortNearest ? 'blue' : 'gray'}
            size="lg"
            radius="xl"
            onClick={requestLocation}
            loading={locLoading}
          >
            <IconCurrentLocation size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
      {sortNearest && userLoc && (
        <Badge size="sm" variant="light" color="green" radius="sm" mb="sm">
          Sorted by distance
        </Badge>
      )}

      {/* Tab switcher */}
      <SegmentedControl
        value={activeTab}
        onChange={setActiveTab}
        fullWidth
        size="sm"
        radius="xl"
        color="orange"
        mb="md"
        data={[
          ...(tabelogList.length > 0 ? [{ label: `Tabelog Top Spots (${tabelogList.length})`, value: 'tabelog' }] : []),
          ...(savedList.length > 0 ? [{ label: `Your Saves (${savedList.length})`, value: 'saves' }] : []),
        ]}
      />

      {/* ===== TABELOG TAB ===== */}
      {activeTab === 'tabelog' && (
        <>
          <Card withBorder radius="md" p="md" mb="lg">
            <Stack gap="sm">
              {/* Price */}
              <Group gap={6} wrap="nowrap">
                <Text size="xs" fw={500} c="dimmed" style={{ flexShrink: 0 }}>Price:</Text>
                <div style={{ flex: 1, padding: '0 4px 16px 4px' }}>
                  <Slider
                    value={maxPrice} onChange={setMaxPrice}
                    min={1000} max={15000} step={1000}
                    label={(v) => v >= 15000 ? 'Any' : `¥${(v / 1000).toFixed(0)}k`}
                    color="orange" size="xs"
                    marks={[{ value: 1000, label: '¥1k' }, { value: 6000, label: '¥6k' }, { value: 15000, label: 'Any' }]}
                  />
                </div>
              </Group>

              {/* Rating */}
              <Group gap={6} wrap="nowrap">
                <Text size="xs" fw={500} c="dimmed" style={{ flexShrink: 0 }}>Rating:</Text>
                <SegmentedControl
                  size="xs" radius="xl" color="red"
                  value={minRating} onChange={setMinRating}
                  data={[
                    { label: 'All', value: 'all' },
                    { label: '3.9+', value: '3.9' },
                    { label: '3.8+', value: '3.8' },
                    { label: '3.7+', value: '3.7' },
                    { label: '3.6+', value: '3.6' },
                  ]}
                />
                {hasActiveFilters && (
                  <Button variant="subtle" color="gray" size="compact-xs" onClick={resetFilters}>Reset</Button>
                )}
              </Group>

              {/* Japanese only */}
              <Switch
                size="xs" label="Japanese food only"
                checked={japaneseOnly}
                onChange={(e) => { setJapaneseOnly(e.currentTarget.checked); setCuisineFilter([]); }}
                color="red"
                styles={{ label: { fontSize: 12, color: '#9ca3af', paddingLeft: 6 } }}
              />

              <SegmentedControl
                value={cuisineLayout}
                onChange={setCuisineLayout}
                size="xs"
                radius="xl"
                color="orange"
                data={[
                  { label: 'Grouped', value: 'grouped' },
                  { label: 'Flat', value: 'flat' },
                ]}
              />

              {/* Cuisine chips */}
              {cuisineLayout === 'flat' ? (
                <Group gap={4}>
                  {cuisineTags.map(([key, label]) => (
                    <Badge
                      key={key} size="xs" radius="xl" style={{ cursor: 'pointer' }}
                      variant={cuisineFilter.includes(key) ? 'filled' : 'outline'}
                      color={cuisineFilter.includes(key) ? 'orange' : 'gray'}
                      onClick={() => setCuisineFilter(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key])}
                    >
                      {label}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Stack gap="xs">
                  {cuisineSections.map((section) => (
                    <div key={section.title}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>{section.title}</Text>
                      <Group gap={4}>
                        {section.items.map(([key, label]) => (
                          <Badge
                            key={key} size="xs" radius="xl" style={{ cursor: 'pointer' }}
                            variant={cuisineFilter.includes(key) ? 'filled' : 'outline'}
                            color={cuisineFilter.includes(key) ? 'orange' : 'gray'}
                            onClick={() => setCuisineFilter(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key])}
                          >
                            {label}
                          </Badge>
                        ))}
                      </Group>
                    </div>
                  ))}
                </Stack>
              )}

              {/* Distance slider — only when sorting by location */}
              {sortNearest && userLoc && (
                <div>
                  <Group gap={6} wrap="nowrap">
                    <Text size="xs" fw={500} c="dimmed" style={{ flexShrink: 0 }}>Distance:</Text>
                    <Text size="xs" fw={600} c="green" style={{ flexShrink: 0 }}>
                      {distLabel(maxDistance)}
                    </Text>
                  </Group>
                  <div style={{ padding: '0 4px 16px 4px' }}>
                    <Slider
                      value={maxDistance} onChange={setMaxDistance}
                      min={0} max={100} step={1}
                      label={distLabel}
                      color="green" size="sm"
                      marks={[
                        { value: 14, label: '0.2' },
                        { value: 35, label: '0.5' },
                        { value: 70, label: '1mi' },
                        { value: 95, label: 'Any' },
                      ]}
                    />
                  </div>
                </div>
              )}
            </Stack>
          </Card>

          {/* Results */}
          <Group justify="space-between" mb="sm">
            <Text size="sm" c="dimmed" fw={500}>
              {filteredTabelog.length} restaurant{filteredTabelog.length !== 1 ? 's' : ''}
              {hasActiveFilters ? ' (filtered)' : ''}
            </Text>
            {hasActiveFilters && (
              <Button variant="light" color="orange" size="compact-xs" radius="xl" onClick={resetFilters}>
                Reset
              </Button>
            )}
          </Group>

          {filteredTabelog.length === 0 ? (
            <Card withBorder radius="md" p="xl" ta="center">
              <Text c="dimmed">No restaurants match these filters.</Text>
              <Button variant="subtle" color="orange" size="xs" mt="sm" onClick={resetFilters}>Reset filters</Button>
            </Card>
          ) : (
            groupedTabelog.map(([station, items]) => (
              <div key={station} style={{ marginBottom: 16 }}>
                <Group gap={6} mb={8}>
                  <IconMapPin size={14} color="#6b7280" />
                  <Text size="sm" fw={600} c="dimmed">{station}</Text>
                  <Badge size="xs" variant="light" color="gray">{items.length}</Badge>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  {items.map(r => (
                    <Card key={r.rank} withBorder radius="sm" padding="sm" style={{ borderLeft: '2px solid var(--mantine-color-orange-5)' }}>
                      <Group justify="space-between" wrap="nowrap" gap="xs">
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <Group gap={6} wrap="nowrap">
                            <Badge size="xs" variant="filled" color="orange" radius="sm">#{r.rank}</Badge>
                            <Text size="sm" fw={600} truncate>{r.name}</Text>
                          </Group>
                          <Group gap={4}>
                            <IconStarFilled size={12} color="#f59f00" />
                            <Text size="xs" fw={600} c="yellow.8">{r.rating}</Text>
                            <Text size="xs" c="dimmed">·</Text>
                            <Text size="xs" c="dimmed" truncate>{r.cuisine}</Text>
                          </Group>
                          <Group gap="xs">
                            <Badge size="xs" variant="light" color="gray" radius="sm">{r.price}</Badge>
                            {r.dinnerPrice && <Badge size="xs" variant="light" color="red" radius="sm">Dinner: {r.dinnerPrice}</Badge>}
                            <Badge size="xs" variant="light" color="blue" radius="sm">{r.station}</Badge>
                            {r._dist != null && <Badge size="xs" variant="light" color="green" radius="sm">{formatDist(r._dist)}</Badge>}
                          </Group>
                        </Stack>
                        {r.mapUrl && (
                          <Anchor href={r.mapUrl} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                            <ThemeIcon size={28} variant="light" color="red" radius="xl">
                              <IconMapPin size={14} />
                            </ThemeIcon>
                          </Anchor>
                        )}
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              </div>
            ))
          )}
        </>
      )}

      {/* ===== SAVES TAB ===== */}
      {activeTab === 'saves' && (
        <>
          <Card withBorder radius="md" p="md" mb="lg">
            <Stack gap="sm">
              <div>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={6}>Type</Text>
                <Chip.Group multiple value={typeFilter} onChange={setTypeFilter}>
                  <Group gap={6}>
                    {placeTypes.map(t => (
                      <Chip key={t} value={t} size="xs" variant="outline" color={PLACE_TYPE_COLORS[t] || 'gray'} radius="xl">{t}</Chip>
                    ))}
                  </Group>
                </Chip.Group>
              </div>
              <div>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={6}>Area</Text>
                <Chip.Group multiple value={areaFilter} onChange={setAreaFilter}>
                  <Group gap={6}>
                    {savedAreas.map(a => (
                      <Chip key={a} value={a} size="xs" variant="outline" color="blue" radius="xl">{a}</Chip>
                    ))}
                  </Group>
                </Chip.Group>
              </div>
            </Stack>
          </Card>

          <Group justify="space-between" mb="sm">
            <Text size="sm" c="dimmed" fw={500}>
              {filteredSaves.length} saved place{filteredSaves.length !== 1 ? 's' : ''}
            </Text>
            {(typeFilter.length > 0 || areaFilter.length > 0) && (
              <Button variant="light" color="blue" size="compact-xs" radius="xl" onClick={() => { setTypeFilter([]); setAreaFilter([]); }}>
                Reset
              </Button>
            )}
          </Group>

          {filteredSaves.length === 0 ? (
            <Card withBorder radius="md" p="xl" ta="center">
              <Text c="dimmed">No saved places match your filters.</Text>
            </Card>
          ) : (
            groupedSaves.map(([area, items]) => (
              <div key={area} style={{ marginBottom: 16 }}>
                <Group gap={6} mb={8}>
                  <IconMapPin size={14} color="#6b7280" />
                  <Text size="sm" fw={600} c="dimmed">{area}</Text>
                  <Badge size="xs" variant="light" color="gray">{items.length}</Badge>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  {items.map((p, i) => {
                    const color = PLACE_TYPE_COLORS[p.type] || 'gray';
                    return (
                      <Card key={i} withBorder radius="sm" padding="sm"
                        style={{ borderLeft: `2px solid var(--mantine-color-${color}-5, #868e96)` }}>
                        <Group justify="space-between" wrap="nowrap" gap="xs">
                          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                            <Group gap={6} wrap="nowrap">
                              <Badge size="xs" variant="light" color={color} radius="sm">{p.type}</Badge>
                              <Text size="sm" fw={600} truncate>{p.name}</Text>
                            </Group>
                            {(p.area || p.note || p._dist != null) && (
                              <Group gap={4}>
                                {p.area && <Badge size="xs" variant="light" color="blue" radius="sm">{p.area}</Badge>}
                                {p._dist != null && <Badge size="xs" variant="light" color="green" radius="sm">{formatDist(p._dist)}</Badge>}
                                {p.note && <Text size="xs" c="dimmed" truncate>{p.note}</Text>}
                              </Group>
                            )}
                          </Stack>
                          <Anchor href={p.mapUrl} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                            <ThemeIcon size={28} variant="light" color="red" radius="xl">
                              <IconMapPin size={14} />
                            </ThemeIcon>
                          </Anchor>
                        </Group>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              </div>
            ))
          )}
        </>
      )}
    </>
  );
}
