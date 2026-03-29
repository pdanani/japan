import { useState, useCallback, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { MantineProvider, createTheme, Container, Notification, ActionIcon, Tooltip, Loader, Center } from '@mantine/core';
import {
  IconClock, IconToolsKitchen2, IconMap2, IconAlertTriangle, IconRefresh, IconMapPin,
  IconDots, IconArrowUp, IconMoon, IconSun,
} from '@tabler/icons-react';
import Papa from 'papaparse';
import Timeline from './components/Timeline';
import FoodMenu from './components/FoodMenu';
import Activities from './components/Activities';
import TravelGroup from './components/TravelGroup';
import NearbyRecs from './components/NearbyRecs';

const MapViewComponent = lazy(() => import('./components/MapView'));
import { SHEET_ID, initialFood, initialActivities } from './data/tripData';
import './App.css';

const PRIMARY_TABS = [
  { key: 'timeline', label: 'Timeline', icon: IconClock, primary: true },
  { key: 'map', label: 'Map', icon: IconMapPin, primary: true },
];

const OVERFLOW_TABS = [
  { key: 'food', label: 'Food', icon: IconToolsKitchen2 },
  { key: 'activities', label: 'Activities', icon: IconMap2 },
  { key: 'group', label: 'Allergies', icon: IconAlertTriangle },
];

const ALL_TABS = [...PRIMARY_TABS, ...OVERFLOW_TABS];

export default function App() {
  const [food, setFood] = useState(initialFood);
  const [activities, setActivities] = useState(initialActivities);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [moreOpen, setMoreOpen] = useState(false);
  const [nearbyDay, setNearbyDay] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('darkMode');
      if (stored !== null) return stored === 'true';
      return true; // default to dark mode
    } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('darkMode', darkMode); } catch {}
  }, [darkMode]);

  // Show scroll-to-top button after scrolling down
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close dropdown when clicking outside
  const moreRef = useRef(null);
  const moreBtnRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [moreOpen]);

  const toastTimer = useRef(null);
  const showToast = useCallback((message, color) => {
    clearTimeout(toastTimer.current);
    setToast({ message, color });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
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
      showToast(ok ? `Synced ${ok} sheet(s) successfully!` : 'Could not sync — sheet may not be public', ok ? 'green' : 'red');
    } catch (e) {
      console.error(e);
      showToast('Sync failed', 'red');
    } finally {
      setSyncing(false);
    }
  }, [showToast]);

  const mantineTheme = useMemo(() => createTheme({
    primaryColor: 'red',
    fontFamily: 'Inter, Noto Sans JP, -apple-system, sans-serif',
    headings: { fontFamily: 'Inter, Noto Sans JP, -apple-system, sans-serif' },
  }), []);

  return (
    <MantineProvider theme={mantineTheme} forceColorScheme={darkMode ? 'dark' : 'light'}>
    <div data-theme={darkMode ? 'dark' : 'light'} style={activeTab === 'map' ? { height: '100vh', overflow: 'hidden' } : undefined}>
      {/* Toolbar */}
      <header className="toolbar">
        <div className="toolbar-inner">
          {/* Brand */}
          <div className="toolbar-brand" onClick={() => setActiveTab('timeline')}>
            <span className="toolbar-jp">日本</span>
            <span className="toolbar-label">Japan 2026</span>
          </div>

          {/* Primary tabs — always visible */}
          <nav className="toolbar-tabs">
            {PRIMARY_TABS.map(({ key, label, icon: Icon, primary }) => (
              <button
                key={key}
                className={`toolbar-tab ${primary ? 'toolbar-tab-primary' : ''} ${activeTab === key ? 'active' : ''}`}
                onClick={() => { setActiveTab(key); setMoreOpen(false); }}
              >
                <Icon size={16} />
                <span className="toolbar-tab-label">{label}</span>
              </button>
            ))}

            {/* On desktop: show overflow tabs inline */}
            {OVERFLOW_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`toolbar-tab toolbar-tab-overflow ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                <Icon size={16} />
                <span className="toolbar-tab-label">{label}</span>
              </button>
            ))}

            {/* On mobile: "More" button */}
            <div className="toolbar-more-wrap" ref={moreRef}>
              <button
                ref={moreBtnRef}
                className={`toolbar-tab toolbar-more-btn ${OVERFLOW_TABS.some(t => t.key === activeTab) ? 'active' : ''}`}
                onClick={() => {
                  if (!moreOpen && moreBtnRef.current) {
                    const rect = moreBtnRef.current.getBoundingClientRect();
                    setDropdownPos({
                      top: rect.bottom + 8,
                      right: Math.max(8, window.innerWidth - rect.right),
                    });
                  }
                  setMoreOpen(prev => !prev);
                }}
              >
                <IconDots size={16} />
                <span className="toolbar-tab-label">More</span>
              </button>
              {moreOpen && (
                <div
                  className="toolbar-dropdown"
                  style={{ top: dropdownPos.top, right: dropdownPos.right }}
                >
                  {OVERFLOW_TABS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      className={`toolbar-dropdown-item ${activeTab === key ? 'active' : ''}`}
                      onClick={() => { setActiveTab(key); setMoreOpen(false); }}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                  <div className="toolbar-dropdown-divider" />
                  <button
                    className="toolbar-dropdown-item"
                    onClick={() => setDarkMode(prev => !prev)}
                  >
                    {darkMode ? <IconSun size={16} /> : <IconMoon size={16} />}
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop dark mode toggle */}
          <button
            className="toolbar-darkmode-btn"
            onClick={() => setDarkMode(prev => !prev)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

          {/* Sync */}
          <Tooltip label="Sync from Google Sheets" position="bottom">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="xl"
              loading={syncing}
              onClick={sync}
              className="toolbar-sync"
            >
              <IconRefresh size={18} color="rgba(255,255,255,0.7)" />
            </ActionIcon>
          </Tooltip>
        </div>
      </header>

      {/* Map — full bleed */}
      {activeTab === 'map' && (
        <Suspense fallback={<Center h="80vh"><Loader color="red" /></Center>}>
          <MapViewComponent />
        </Suspense>
      )}

      {/* All other tabs — inside container */}
      {activeTab !== 'map' && (
        <Container size="lg" py="xl">
          {activeTab === 'timeline' && (
            nearbyDay != null
              ? <NearbyRecs dayNumber={nearbyDay} onBack={() => { setNearbyDay(null); window.scrollTo({ top: 0 }); }} />
              : <Timeline onNearbyRecs={(day) => { setNearbyDay(day); window.scrollTo({ top: 0 }); }} />
          )}
          {activeTab === 'food' && <FoodMenu data={food} />}
          {activeTab === 'activities' && <Activities data={activities} />}
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

      {/* Scroll to top */}
      {showScrollTop && activeTab !== 'map' && (
        <button className="scroll-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
          <IconArrowUp size={20} />
        </button>
      )}
    </div>
    </MantineProvider>
  );
}
