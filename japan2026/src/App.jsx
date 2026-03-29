import { useState, useCallback } from 'react';
import { Container, Tabs, Notification } from '@mantine/core';
import {
  IconClock, IconToolsKitchen2, IconMap2, IconChecklist, IconAlertTriangle, IconRefresh, IconMapPin,
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
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedDay, setSelectedDay] = useState(1);

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
    <div style={activeTab === 'map' ? { height: '100vh', overflow: 'hidden' } : undefined}>
      {activeTab !== 'map' && <Hero onSync={sync} syncing={syncing} />}

      <nav className="sticky-nav">
        <Tabs value={activeTab} onChange={setActiveTab} variant="unstyled" style={{ maxWidth: 960, margin: '0 auto' }}>
          <Tabs.List className="nav-inner">
            <Tabs.Tab value="timeline" className="nav-btn" leftSection={<IconClock size={16} />}>Timeline</Tabs.Tab>
            <Tabs.Tab value="map" className="nav-btn" leftSection={<IconMapPin size={16} />}>Map</Tabs.Tab>
            <Tabs.Tab value="food" className="nav-btn" leftSection={<IconToolsKitchen2 size={16} />}>Food</Tabs.Tab>
            <Tabs.Tab value="activities" className="nav-btn" leftSection={<IconMap2 size={16} />}>Activities</Tabs.Tab>
            <Tabs.Tab value="planning" className="nav-btn" leftSection={<IconChecklist size={16} />}>Planning</Tabs.Tab>
            <Tabs.Tab value="group" className="nav-btn" leftSection={<IconAlertTriangle size={16} />}>Allergies</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </nav>

      {/* Map — full bleed, no hero, no container */}
      {activeTab === 'map' && (
        <MapViewComponent
          initialDay={selectedDay}
          onViewList={(day) => { setSelectedDay(day); setActiveTab('timeline'); }}
        />
      )}

      {/* All other tabs — inside container */}
      {activeTab !== 'map' && (
        <Container size="lg" py="xl">
          {activeTab === 'timeline' && (
            <Timeline
              selectedDay={selectedDay}
              onViewMap={(day) => { setSelectedDay(day); setActiveTab('map'); }}
            />
          )}
          {activeTab === 'food' && <FoodMenu data={food} />}
          {activeTab === 'activities' && <Activities data={activities} />}
          {activeTab === 'planning' && <Planning />}
          {activeTab === 'group' && <TravelGroup />}
        </Container>
      )}

      {toast && (
        <Notification
          color={toast.color}
          onClose={() => setToast(null)}
          style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, minWidth: 300 }}
        >
          {toast.message}
        </Notification>
      )}
    </div>
  );
}
