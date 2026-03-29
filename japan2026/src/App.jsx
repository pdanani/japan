import { useState, useCallback } from 'react';
import { Container, Tabs, Notification, Box } from '@mantine/core';
import {
  IconClock, IconToolsKitchen2, IconMap2, IconChecklist, IconUsers, IconRefresh, IconMapPin,
} from '@tabler/icons-react';
import Papa from 'papaparse';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import MapViewComponent from './components/MapView';
import FoodMenu from './components/FoodMenu';
import Activities from './components/Activities';
import Planning from './components/Planning';
import TravelGroup from './components/TravelGroup';
import { SHEET_ID, initialFood, initialActivities } from './data/tripData';
import './App.css';

export default function App() {
  const [food, setFood] = useState(initialFood);
  const [activities, setActivities] = useState(initialActivities);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, color) => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const sheets = [
        { gidParam: 'gid=0', target: 'activities' },
        { gidParam: 'sheet=Food%20Menu', target: 'food' },
      ];
      let ok = 0;
      for (const s of sheets) {
        try {
          const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&${s.gidParam}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(res.status);
          const csv = await res.text();
          const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
          if (!data?.length) continue;
          if (s.target === 'food') {
            setFood(data.filter(r => r.Details?.trim()).map(r => ({
              name: (r.Name || '').trim(),
              category: (r.Category || '').trim(),
              details: (r.Details || '').trim(),
              location: (r.Location || '').trim(),
              neighborhood: (r.Neighborhood || '').trim(),
              notes: (r['Notes, etc'] || '').trim(),
              link: (r.Link || '').trim(),
              interested: (r['Others Interested'] || '').trim(),
            })));
          } else {
            setActivities(data.filter(r => r.Details?.trim()).map(r => ({
              name: (r.Name || '').trim(),
              category: (r.Category || '').trim(),
              details: (r.Details || '').trim(),
              location: (r.Location || '').trim(),
              notes: (r['Notes, etc'] || '').trim(),
              link: (r.Link || '').trim(),
              interested: (r['Others Interested'] || '').trim(),
            })));
          }
          ok++;
        } catch (e) { console.warn(e); }
      }
      showToast(ok ? `Synced ${ok} sheet(s) successfully!` : 'Could not sync \u2014 sheet may not be public', ok ? 'green' : 'red');
    } catch (e) {
      console.error(e);
      showToast('Sync failed', 'red');
    } finally {
      setSyncing(false);
    }
  }, [showToast]);

  return (
    <>
      <Hero onSync={sync} syncing={syncing} />

      <nav className="sticky-nav">
        <Tabs defaultValue="timeline" variant="unstyled" style={{ maxWidth: 960, margin: '0 auto' }}>
          <Tabs.List className="nav-inner">
            <Tabs.Tab value="timeline" className="nav-btn" leftSection={<IconClock size={16} />}>Timeline</Tabs.Tab>
            <Tabs.Tab value="map" className="nav-btn" leftSection={<IconMapPin size={16} />}>Map</Tabs.Tab>
            <Tabs.Tab value="food" className="nav-btn" leftSection={<IconToolsKitchen2 size={16} />}>Food</Tabs.Tab>
            <Tabs.Tab value="activities" className="nav-btn" leftSection={<IconMap2 size={16} />}>Activities</Tabs.Tab>
            <Tabs.Tab value="planning" className="nav-btn" leftSection={<IconChecklist size={16} />}>Planning</Tabs.Tab>
            <Tabs.Tab value="group" className="nav-btn" leftSection={<IconUsers size={16} />}>Group</Tabs.Tab>
          </Tabs.List>

          {/* Map tab — full width, outside Container */}
          <Tabs.Panel value="map">
            <Box style={{ width: '100vw', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
              <MapViewComponent />
            </Box>
          </Tabs.Panel>

          <Container size="lg" py="xl">
            <Tabs.Panel value="timeline"><Timeline /></Tabs.Panel>
            <Tabs.Panel value="food"><FoodMenu data={food} /></Tabs.Panel>
            <Tabs.Panel value="activities"><Activities data={activities} /></Tabs.Panel>
            <Tabs.Panel value="planning"><Planning /></Tabs.Panel>
            <Tabs.Panel value="group"><TravelGroup /></Tabs.Panel>
          </Container>
        </Tabs>
      </nav>

      <footer>
        Japan 2026 Trip Planner &middot; Data synced from{' '}
        <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`} target="_blank" rel="noopener">Google Sheets</a>
      </footer>

      {toast && (
        <Notification
          color={toast.color}
          onClose={() => setToast(null)}
          style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, minWidth: 300 }}
        >
          {toast.message}
        </Notification>
      )}
    </>
  );
}
