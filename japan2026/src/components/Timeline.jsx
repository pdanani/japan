import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  Timeline as MTimeline, Title, Text, Badge, Group, Card, Button, Switch,
  ThemeIcon, ScrollArea, UnstyledButton, Accordion, SimpleGrid,
  Anchor, Stack, Tabs, ActionIcon, Tooltip, SegmentedControl, Slider,
} from '@mantine/core';
import {
  IconMapPin, IconCalendar, IconCoffee, IconShoppingCart,
  IconTorii, IconUsers, IconBed, IconMusic, IconWalk,
  IconTrain, IconMoodEmpty, IconExternalLink, IconStarFilled,
  IconFlame, IconTable, IconBrandGoogleMaps,
  IconRobot, IconToolsKitchen2, IconChecklist, IconCurrentLocation,
  IconMap2,
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

// source: where the suggestion came from
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
      size="xs"
      variant="light"
      color={cfg.color}
      radius="sm"
      leftSection={<Icon size={10} />}
      style={{ flexShrink: 0 }}
      title={cfg.tip}
    >
      {cfg.label}
    </Badge>
  );
}

const PLACE_TYPE_COLORS = {
  food: 'orange',
  shopping: 'pink',
  site: 'green',
  activity: 'yellow',
};

function TabelogCard({ r, dist }) {
  return (
    <Card withBorder radius="sm" padding="sm" style={{ borderLeft: '3px solid #e85d04', position: 'relative' }}>
      {dist != null && (
        <Badge size="xs" variant="light" color="green" radius="sm"
          style={{ position: 'absolute', top: 6, right: 6 }}
        >
          {dist < 0.1 ? `${Math.round(dist * 5280)} ft` : `${dist.toFixed(1)} mi`}
        </Badge>
      )}
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={6} wrap="nowrap">
            <Badge size="xs" variant="filled" color="orange" radius="sm" style={{ flexShrink: 0 }}>
              #{r.rank}
            </Badge>
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
  );
}

function SavedPlaceCard({ p, dist }) {
  const color = PLACE_TYPE_COLORS[p.type] || 'gray';
  return (
    <Card withBorder radius="sm" padding="sm" style={{ borderLeft: `3px solid var(--mantine-color-${color}-5, #868e96)`, position: 'relative' }}>
      {dist != null && (
        <Badge size="xs" variant="light" color="green" radius="sm"
          style={{ position: 'absolute', top: 6, right: 6 }}
        >
          {dist < 0.1 ? `${Math.round(dist * 5280)} ft` : `${dist.toFixed(1)} mi`}
        </Badge>
      )}
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={6} wrap="nowrap">
            <Badge size="xs" variant="light" color={color} radius="sm" style={{ flexShrink: 0 }}>
              {p.type}
            </Badge>
            <Text size="sm" fw={600} truncate>{p.name}</Text>
          </Group>
          {(p.note || p.area) && (
            <Group gap={4}>
              {p.area && <Badge size="xs" variant="light" color="blue" radius="sm">{p.area}</Badge>}
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
}

// Known district center coords for distance sorting
const AREA_COORDS = {
  Akasaka: [35.6762, 139.7370], Shibuya: [35.6580, 139.7016], Harajuku: [35.6702, 139.7027],
  Omotesando: [35.6654, 139.7122], Aoyama: [35.6654, 139.7122], Yoyogi: [35.6712, 139.6951],
  Asakusa: [35.7148, 139.7967], Kappabashi: [35.7120, 139.7880], Tawaramachi: [35.7100, 139.7900],
  Gotokuji: [35.6527, 139.6444], Shinjuku: [35.6896, 139.7006], Daikanyama: [35.6488, 139.7034],
  Nakameguro: [35.6440, 139.6988], Ebisu: [35.6467, 139.7100], Ginza: [35.6717, 139.7649],
  Nihombashi: [35.6838, 139.7744], Yurakucho: [35.6748, 139.7631], Kagurazaka: [35.7026, 139.7410],
  Kanda: [35.6933, 139.7706], Tsukiji: [35.6654, 139.7707], Akihabara: [35.6984, 139.7731],
  Dotonbori: [34.6687, 135.5013], Umeda: [34.7055, 135.4983],
  Tokyo: [35.6762, 139.6503], Osaka: [34.6937, 135.5023], Kyoto: [35.0116, 135.7681],
  Kinosaki: [35.6265, 134.8118], Hakone: [35.2326, 139.1070],
};

function getCoordForPlace(p) {
  if (p.area && AREA_COORDS[p.area]) return AREA_COORDS[p.area];
  if (p.city && AREA_COORDS[p.city]) return AREA_COORDS[p.city];
  if (p.station) {
    for (const [key, coord] of Object.entries(AREA_COORDS)) {
      if (p.station.toLowerCase().includes(key.toLowerCase())) return coord;
    }
  }
  return null;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function TimelineSection({ selectedDay, onViewMap }) {
  const [selected, setSelected] = useState(selectedDay || 1);

  // Sync with parent when selectedDay changes (e.g. navigating back from map)
  useEffect(() => {
    if (selectedDay != null && selectedDay !== selected) {
      setSelected(selectedDay);
    }
  }, [selectedDay]);

  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [sortNearest, setSortNearest] = useState(false);
  const [showAllSaves, setShowAllSaves] = useState(false);
  const [showAllTabelog, setShowAllTabelog] = useState(false);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [appliedPrice, setAppliedPrice] = useState(15000);
  const [minRating, setMinRating] = useState('all');
  const [maxDistance, setMaxDistance] = useState(100);
  const [appliedDist, setAppliedDist] = useState(100);

  // Debounced filter application — slider moves instantly, filtering waits 300ms
  const priceTimer = useRef(null);
  const distTimer = useRef(null);
  const onPriceChange = (v) => {
    setMaxPrice(v);
    clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => { lockScroll(); setAppliedPrice(v); setShowAllTabelog(false); }, 300);
  };
  const onDistChange = (sliderVal) => {
    setMaxDistance(sliderVal);
    clearTimeout(distTimer.current);
    distTimer.current = setTimeout(() => { lockScroll(); setAppliedDist(sliderVal); }, 300);
  };

  // Convert slider value (0-100) to miles for filtering
  const fromSliderToMiles = (s) => {
    if (s >= 100) return 3.0;
    if (s <= 70) return s / 70;
    return 1.0 + (s - 70) / 20;
  };
  const [cuisineFilter, setCuisineFilter] = useState([]);
  const [japaneseOnly, setJapaneseOnly] = useState(false);
  const [recTab, setRecTab] = useState('tabelog');
  const [accordionOpen, setAccordionOpen] = useState(null);
  const INITIAL_SHOW = 10;

  // Scroll-lock: save scrollY before state changes, restore in useLayoutEffect (before paint)
  const scrollLock = useRef(null);
  const lockScroll = () => { scrollLock.current = window.scrollY; };
  useLayoutEffect(() => {
    if (scrollLock.current !== null) {
      window.scrollTo(0, scrollLock.current);
      scrollLock.current = null;
    }
  });

  const day = timeline.find(d => d.day === selected);
  const tabelogList = nearbyFinds[selected] || [];
  const savedList = getPlacesForDay(selected);
  const hasNearby = tabelogList.length > 0 || savedList.length > 0;

  const requestLocation = () => {
    if (userLoc) {
      setSortNearest(!sortNearest);
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

  // Returns sorted items with .dist (in miles) attached, filtered by maxDistance
  const sortByDistance = (items, getCoord) => {
    if (!sortNearest || !userLoc) return items;
    const KM_TO_MI = 0.621371;
    return [...items].map(item => {
      const c = getCoord(item);
      const distKm = c ? haversine(userLoc[0], userLoc[1], c[0], c[1]) : 9999;
      return { ...item, _dist: distKm * KM_TO_MI };
    }).filter(item => appliedDist >= 100 || item._dist <= fromSliderToMiles(appliedDist))
      .sort((a, b) => a._dist - b._dist);
  };

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
                onClick={() => { setSelected(d.day); setAccordionOpen(null); setShowAllSaves(false); setShowAllTabelog(false); setMaxPrice(15000); setAppliedPrice(15000); setMinRating('all'); setMaxDistance(100); setAppliedDist(100); setCuisineFilter([]); setJapaneseOnly(false); }}
                style={{
                  flexShrink: 0,
                  minWidth: 82,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${active ? '#b91c1c' : '#e5e7eb'}`,
                  background: active ? '#b91c1c' : 'white',
                  color: active ? 'white' : '#1f2937',
                  transition: 'all 0.2s',
                  boxShadow: active ? '0 4px 14px rgba(185,28,28,0.3)' : '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <Text size="10px" fw={600} tt="uppercase" opacity={active ? 0.85 : 0.5}>
                  {d.day === 0 ? 'Travel' : d.day === 15 ? 'End' : `Day ${d.day}`}
                </Text>
                <Text size="sm" fw={700} lh={1.3}>{d.date.replace('July ', '7/')}</Text>
                <Text size="10px" opacity={active ? 0.8 : 0.5} mt={2}>
                  {d.location.length > 13 ? d.location.slice(0, 13) + '…' : d.location}
                </Text>
              </UnstyledButton>
            );
          })}
        </Group>
      </ScrollArea>

      {/* Selected day detail */}
      {day && (
        <>
          <Card withBorder radius="md" p="lg" mb="md" style={{ borderLeft: '4px solid #b91c1c' }}>
            <Title order={3} size="h4">
              {day.day === 0 ? 'Travel Day' : day.day === 15 ? 'Departure' : `Day ${day.day} — ${day.dayOfWeek}`}
            </Title>
            <Group gap="md" mt={4}>
              <Group gap={4}><IconCalendar size={14} color="#6b7280" /><Text size="sm" c="dimmed">{day.date}</Text></Group>
              <Group gap={4}><IconMapPin size={14} color="#6b7280" /><Text size="sm" c="dimmed">{day.location}</Text></Group>
              {day.schedule.length > 0 && (
                <Badge size="sm" variant="light" color="red">{day.schedule.length} activities</Badge>
              )}
            </Group>
            {day.notes && (
              <Text size="sm" c="dimmed" mt="sm" pt="sm" style={{ borderTop: '1px solid #e5e7eb' }}>{day.notes}</Text>
            )}
          </Card>

          {onViewMap && (
            <Button
              variant="subtle"
              color="gray"
              size="compact-xs"
              radius="xl"
              leftSection={<IconMap2 size={14} />}
              onClick={() => onViewMap(selected)}
              mb="md"
              style={{ fontWeight: 500 }}
            >
              View on Map
            </Button>
          )}

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
                          component="a"
                          href={s.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="xs"
                          variant="outline"
                          color="red"
                          radius="sm"
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
            <Card withBorder radius="md" p="xl" ta="center" bg="gray.0">
              <IconMoodEmpty size={32} color="#9ca3af" style={{ margin: '0 auto' }} />
              <Text c="dimmed" size="sm" mt="xs">No detailed schedule yet for this day.</Text>
              <Text c="dimmed" size="xs" mt={4}>Check Food & Activities for ideas!</Text>
            </Card>
          )}

          {/* Nearby Recommendations — Two tabs: Your Saves + Tabelog */}
          {hasNearby && (
            <Accordion variant="contained" radius="md" mt="lg" value={accordionOpen} onChange={setAccordionOpen}>
              <Accordion.Item value="nearby">
                <Accordion.Control icon={<IconFlame size={20} color="#e85d04" />}>
                  <Group gap="xs">
                    <Text fw={600} size="sm">Nearby Recs</Text>
                    <Badge size="xs" variant="light" color="orange">
                      {savedList.length + tabelogList.length} spots
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Grouped by district — {day.notes || day.location}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  {/* Sort by nearest + distance filter */}
                  <Group justify="flex-end" mb="sm" wrap="wrap" gap="sm">
                    {sortNearest && userLoc && (
                      <Badge size="xs" variant="light" color="green" radius="sm">
                        Sorted by distance
                      </Badge>
                    )}
                    {sortNearest && userLoc && (
                      <Group gap="xs" wrap="nowrap" style={{ flex: 1, maxWidth: 280 }}>
                        <Text size="xs" fw={500} c="dimmed" style={{ flexShrink: 0 }}>Radius:</Text>
                        {(() => {
                          // Non-linear slider: 0-70% of track = 0-1mi, 70-90% = 1-2mi, 90-100% = 2mi+/Any
                          const toSlider = (mi) => {
                            if (mi >= 3.0) return 100;
                            if (mi <= 1.0) return mi * 70;
                            return 70 + (mi - 1.0) * 20;
                          };
                          const fromSlider = (s) => {
                            if (s >= 100) return 3.0;
                            if (s <= 70) return s / 70;
                            return 1.0 + (s - 70) / 20;
                          };
                          return (
                            <Slider
                              value={maxDistance}
                              onChange={onDistChange}
                              min={0}
                              max={100}
                              step={1}
                              label={(s) => {
                                const mi = fromSlider(s);
                                return mi >= 3.0 ? 'Any' : `${mi.toFixed(1)} mi`;
                              }}
                              color="green"
                              size="sm"
                              style={{ flex: 1 }}
                              marks={[
                                { value: toSlider(0.2), label: '.2' },
                                { value: toSlider(0.5), label: '.5' },
                                { value: toSlider(1.0), label: '1mi' },
                                { value: 100, label: 'Any' },
                              ]}
                            />
                          );
                        })()}
                      </Group>
                    )}
                    <Tooltip label={sortNearest ? 'Switch to grouped view' : 'Sort by your current location'}>
                      <ActionIcon
                        variant={sortNearest ? 'filled' : 'subtle'}
                        color={sortNearest ? 'blue' : 'gray'}
                        onClick={requestLocation}
                        loading={locLoading}
                        size="md"
                        radius="md"
                      >
                        <IconCurrentLocation size={16} color={sortNearest ? undefined : '#228be6'} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>

                  <SegmentedControl
                    value={recTab}
                    onChange={setRecTab}
                    fullWidth
                    size="xs"
                    radius="xl"
                    color="orange"
                    mb="sm"
                    data={[
                      ...(tabelogList.length > 0 ? [{ label: `Tabelog Top Spots (${tabelogList.length})`, value: 'tabelog' }] : []),
                      ...(savedList.length > 0 ? [{ label: `Your Saves (${savedList.length})`, value: 'saves' }] : []),
                    ]}
                  />
                  <Tabs value={recTab} onChange={setRecTab} variant="unstyled" keepMounted={false}>
                    <Tabs.List style={{ display: 'none' }}></Tabs.List>

                    {savedList.length > 0 && (
                      <Tabs.Panel value="saves">
                        {(() => {
                          const list = sortNearest && userLoc
                            ? sortByDistance(savedList, getCoordForPlace)
                            : savedList;
                          const visible = showAllSaves ? list : list.slice(0, INITIAL_SHOW);
                          const hidden = list.length - INITIAL_SHOW;

                          if (sortNearest && userLoc) {
                            return (
                              <>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                  {visible.map((p, i) => (
                                    <SavedPlaceCard key={i} p={p} dist={p._dist < 9000 ? p._dist : null} />
                                  ))}
                                </SimpleGrid>
                                {!showAllSaves && hidden > 0 && (
                                  <Button variant="subtle" color="gray" fullWidth mt="sm" size="xs"
                                    onClick={() => { lockScroll(); setShowAllSaves(true); }}>
                                    Show {hidden} more places
                                  </Button>
                                )}
                              </>
                            );
                          }

                          // Grouped view
                          const grouped = {};
                          visible.forEach(p => {
                            const key = p.area || p.city || 'Other';
                            if (!grouped[key]) grouped[key] = [];
                            grouped[key].push(p);
                          });
                          return (
                            <>
                              {Object.entries(grouped).map(([area, items]) => (
                                <div key={area} style={{ marginBottom: 16 }}>
                                  <Group gap={6} mb={8}>
                                    <IconMapPin size={14} color="#6b7280" />
                                    <Text size="sm" fw={600} c="dimmed">{area}</Text>
                                    <Badge size="xs" variant="light" color="gray">{items.length}</Badge>
                                  </Group>
                                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                    {items.map((p, i) => <SavedPlaceCard key={i} p={p} />)}
                                  </SimpleGrid>
                                </div>
                              ))}
                              {!showAllSaves && hidden > 0 && (
                                <Button variant="subtle" color="gray" fullWidth mt="sm" size="xs"
                                  onClick={() => { lockScroll(); setShowAllSaves(true); }}>
                                  Show {hidden} more places
                                </Button>
                              )}
                            </>
                          );
                        })()}
                      </Tabs.Panel>
                    )}

                    {tabelogList.length > 0 && (
                      <Tabs.Panel value="tabelog">
                        {/* Filters */}
                        <Stack gap="sm" mb="md">
                          {/* Price slider */}
                          <Group gap={6} wrap="nowrap">
                            <Text size="xs" fw={500} c="dimmed" style={{ flexShrink: 0 }}>Price:</Text>
                            <div style={{ flex: 1, padding: '0 4px 16px 4px' }}>
                              <Slider
                                value={maxPrice}
                                onChange={onPriceChange}
                                min={1000}
                                max={15000}
                                step={1000}
                                label={(v) => v >= 15000 ? 'Any' : `¥${(v / 1000).toFixed(0)}k`}
                                color="orange"
                                size="xs"
                                marks={[{ value: 1000, label: '¥1k' }, { value: 6000, label: '¥6k' }, { value: 15000, label: 'Any' }]}
                              />
                            </div>
                          </Group>

                          {/* Rating + Reset */}
                          <Group gap={6} wrap="nowrap">
                            <Text size="xs" fw={500} c="dimmed" style={{ flexShrink: 0 }}>Rating:</Text>
                            <SegmentedControl
                              size="xs"
                              radius="xl"
                              color="yellow"
                              value={minRating}
                              onChange={(v) => { lockScroll(); setMinRating(v); setShowAllTabelog(false); }}
                              data={[
                                { label: 'All', value: 'all' },
                                { label: '3.9+', value: '3.9' },
                                { label: '3.8+', value: '3.8' },
                                { label: '3.7+', value: '3.7' },
                                { label: '3.6+', value: '3.6' },
                              ]}
                            />
                            {(appliedPrice < 15000 || minRating !== 'all' || cuisineFilter.length > 0 || japaneseOnly) && (
                              <Button
                                variant="subtle"
                                color="gray"
                                size="compact-xs"
                                style={{ flexShrink: 0 }}
                                onClick={() => { lockScroll(); setMaxPrice(15000); setAppliedPrice(15000); setMinRating('all'); setMaxDistance(100); setAppliedDist(100); setCuisineFilter([]); setJapaneseOnly(false); setShowAllTabelog(false); }}
                              >
                                Reset
                              </Button>
                            )}
                          </Group>

                          {/* Japanese food only */}
                          <Switch
                            size="xs"
                            label="Japanese food only"
                            checked={japaneseOnly}
                            onChange={(e) => { lockScroll(); setJapaneseOnly(e.currentTarget.checked); setCuisineFilter([]); setShowAllTabelog(false); }}
                            color="red"
                            styles={{ label: { fontSize: 12, color: '#9ca3af', paddingLeft: 6 } }}
                          />
                          <ScrollArea type="never">
                            <Group gap={4} wrap="nowrap">
                              {(() => {
                                const nonJapaneseCuisines = ['italian', 'french', 'indian', 'chinese', 'sichuan', 'korean', 'thai', 'vietnamese', 'spanish', 'american', 'peruvian', 'nepalese', 'sri lankan', 'bistro', 'pizza', 'pasta', 'steak'];
                                const cats = new Map();
                                tabelogList.forEach(r => {
                                  (r.cuisine || '').split(/[,/]/).forEach(c => {
                                    const t = c.trim();
                                    if (t && t.length > 1) {
                                      const key = t.toLowerCase();
                                      // Hide non-Japanese tags when toggle is on
                                      if (japaneseOnly && nonJapaneseCuisines.some(nj => key.includes(nj))) return;
                                      if (!cats.has(key)) cats.set(key, t);
                                    }
                                  });
                                });
                                return [...cats.entries()]
                                  .sort((a, b) => a[1].localeCompare(b[1]))
                                  .map(([key, label]) => (
                                    <Badge
                                      key={key}
                                      size="xs"
                                      variant={cuisineFilter.includes(key) ? 'filled' : 'outline'}
                                      color={cuisineFilter.includes(key) ? 'orange' : 'gray'}
                                      radius="xl"
                                      style={{ cursor: 'pointer', flexShrink: 0 }}
                                      onClick={() => {
                                        lockScroll();
                                        setCuisineFilter(prev =>
                                          prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
                                        );
                                        setShowAllTabelog(false);
                                      }}
                                    >
                                      {label}
                                    </Badge>
                                  ));
                              })()}
                            </Group>
                          </ScrollArea>
                        </Stack>

                        {(() => {
                          const tabelogCoord = (r) => {
                            if (!r.station) return null;
                            for (const [key, coord] of Object.entries(AREA_COORDS)) {
                              if (r.station.toLowerCase().includes(key.toLowerCase())) return coord;
                            }
                            return null;
                          };

                          // Parse price string to numeric for filtering
                          const parsePrice = (p) => {
                            if (!p) return 0;
                            const m = p.match(/[\d,]+/);
                            return m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
                          };

                          let filtered = tabelogList;

                          // Apply price filter (debounced)
                          if (appliedPrice < 15000) {
                            filtered = filtered.filter(r => {
                              const p = parsePrice(r.price);
                              return p <= appliedPrice;
                            });
                          }

                          // Apply rating filter
                          if (minRating !== 'all') {
                            const min = parseFloat(minRating);
                            filtered = filtered.filter(r => r.rating >= min);
                          }

                          // Apply cuisine filter
                          if (cuisineFilter.length > 0) {
                            filtered = filtered.filter(r => {
                              const cats = (r.cuisine || '').toLowerCase();
                              return cuisineFilter.some(c => cats.includes(c));
                            });
                          }

                          // Japanese only filter
                          if (japaneseOnly) {
                            const nonJapanese = ['italian', 'french', 'indian', 'chinese', 'sichuan', 'korean', 'thai', 'vietnamese', 'spanish', 'american', 'peruvian', 'nepalese', 'sri lankan', 'bistro', 'pizza', 'pasta', 'steak'];
                            filtered = filtered.filter(r => {
                              const cats = (r.cuisine || '').toLowerCase();
                              return !nonJapanese.some(nj => cats.includes(nj));
                            });
                          }

                          const list = sortNearest && userLoc
                            ? sortByDistance(filtered, tabelogCoord)
                            : filtered;
                          const visible = showAllTabelog ? list : list.slice(0, INITIAL_SHOW);
                          const hidden = list.length - INITIAL_SHOW;

                          if (list.length === 0) {
                            return (
                              <Text size="sm" c="dimmed" ta="center" py="md">
                                No restaurants match these filters. Try adjusting price or rating.
                              </Text>
                            );
                          }

                          if (sortNearest && userLoc) {
                            return (
                              <>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                  {visible.map((r) => (
                                    <TabelogCard key={r.rank} r={r} dist={r._dist < 9000 ? r._dist : null} />
                                  ))}
                                </SimpleGrid>
                                {!showAllTabelog && hidden > 0 && (
                                  <Button variant="subtle" color="orange" fullWidth mt="sm" size="xs"
                                    onClick={() => { lockScroll(); setShowAllTabelog(true); }}>
                                    Show {hidden} more restaurants
                                  </Button>
                                )}
                              </>
                            );
                          }

                          // Grouped view
                          const grouped = {};
                          visible.forEach(r => {
                            const key = r.station || 'Other';
                            if (!grouped[key]) grouped[key] = [];
                            grouped[key].push(r);
                          });
                          return (
                            <>
                              {Object.entries(grouped).map(([station, items]) => (
                                <div key={station} style={{ marginBottom: 16 }}>
                                  <Group gap={6} mb={8}>
                                    <IconMapPin size={14} color="#6b7280" />
                                    <Text size="sm" fw={600} c="dimmed">{station}</Text>
                                    <Badge size="xs" variant="light" color="gray">{items.length}</Badge>
                                  </Group>
                                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                    {items.map((r) => <TabelogCard key={r.rank} r={r} />)}
                                  </SimpleGrid>
                                </div>
                              ))}
                              {!showAllTabelog && hidden > 0 && (
                                <Button variant="subtle" color="orange" fullWidth mt="sm" size="xs"
                                  onClick={() => { lockScroll(); setShowAllTabelog(true); }}>
                                  Show {hidden} more restaurants
                                </Button>
                              )}
                            </>
                          );
                        })()}
                      </Tabs.Panel>
                    )}
                  </Tabs>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          )}
        </>
      )}
    </>
  );
}
