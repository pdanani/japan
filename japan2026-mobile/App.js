import React, { useState, useCallback } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import Papa from 'papaparse';

import TimelineScreen from './src/screens/TimelineScreen';
import FoodScreen from './src/screens/FoodScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import GroupScreen from './src/screens/GroupScreen';
import MapScreen from './src/screens/MapScreen';
import NearbyRecsScreen from './src/screens/NearbyRecsScreen';
import { SHEET_ID, initialFood, initialActivities, timeline as initialTimeline } from './src/data/tripData';
import { colors } from './src/theme';
import { ThemeProvider, useTheme } from './src/ThemeContext';

// Timeline CSV parser (grid format: days as columns, times as rows)
function detectActivityType(text) {
  const t = text.toLowerCase();
  if (/flight|train|monorail|shinkansen|yamanote|ginza line|bus|taxi|station|→|->/.test(t)) return 'transport';
  if (/group|everyone|all\b/.test(t)) return 'group';
  if (/nap|rest|hotel|omo3|check.?in|check.?out|pack|sleep/.test(t)) return 'rest';
  if (/coffee|ramen|sushi|tempura|bakery|lunch|dinner|breakfast|eat|food|restaurant|cafe|taiyaki|kaisendon|tonkatsu|katsu|eel|unana|udon|soba|gyoza|takoyaki|pancake|ice.?cream|sweet|dessert|snack|market|tsukiji/.test(t)) return 'food';
  if (/shop|store|camera|don.?quij|loft|beams|tower.?records|dulton|bic.?camera|sugar|kamawanu|knives|kama.?asa|honke|souvenir|mall/.test(t)) return 'shopping';
  if (/shrine|temple|park|garden|castle|museum|palace|gate|river|stroll|walk|sky.?view|godzilla|tower|bridge/.test(t)) return 'site';
  if (/jazz|concert|bar|karaoke|round1|spocha|arcade|glass.?cut|workshop|dye|class|sumo|kimono|kiriko/.test(t)) return 'activity';
  return 'activity';
}

function parseTimelineCSV(rows) {
  if (!rows || rows.length < 5) return null;
  const headerRow = rows[0], dateRow = rows[1], locationRow = rows[2], notesRow = rows[3];
  const dayColumns = [];
  for (let col = 1; col < headerRow.length; col++) {
    const h = (headerRow[col] || '').trim();
    const dayMatch = h.match(/Day\s+(\d+)/i);
    if (dayMatch) dayColumns.push({ col, day: parseInt(dayMatch[1], 10) });
    else if (/end/i.test(h)) dayColumns.push({ col, day: 15 });
  }
  if (dayColumns.length === 0) return null;
  return dayColumns.map(({ col, day }) => {
    const rawDate = (dateRow[col] || '').trim();
    const dowMatch = rawDate.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
    const dayOfWeek = dowMatch ? dowMatch[1] : '';
    const date = rawDate.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/i, '').trim() || rawDate;
    const location = (locationRow[col] || '').trim();
    const notes = (notesRow[col] || '').trim();
    const schedule = [];
    for (let r = 4; r < rows.length; r++) {
      const timeRaw = (rows[r][0] || '').trim();
      const activity = (rows[r][col] || '').trim();
      if (!activity || activity === ' ') continue;
      let time = timeRaw;
      if (/^\d{1,2}:\d{2}$/.test(time)) {
        const hour = parseInt(time.split(':')[0], 10);
        const suffix = hour >= 12 && hour < 24 ? 'PM' : 'AM';
        const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        time = `${h12}:${time.split(':')[1]} ${suffix}`;
      }
      schedule.push({ time, activity, type: detectActivityType(activity), source: 'sheet' });
    }
    return { day, date, dayOfWeek, location, notes, schedule };
  });
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Timeline: { active: 'time', inactive: 'time-outline' },
  Map: { active: 'navigate-circle', inactive: 'navigate-circle-outline' },
  Food: { active: 'restaurant', inactive: 'restaurant-outline' },
  Activities: { active: 'compass', inactive: 'compass-outline' },
  Allergies: { active: 'alert-circle', inactive: 'alert-circle-outline' },
};

function App() {
  const [food, setFood] = useState(initialFood);
  const [activities, setActivities] = useState(initialActivities);
  const [timelineData, setTimelineData] = useState(initialTimeline);
  const [syncing, setSyncing] = useState(false);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const sheets = [
        { gidParam: 'gid=0', target: 'activities' },
        { gidParam: 'sheet=Food%20Menu', target: 'food' },
        { gidParam: 'sheet=PB%20Draft%20Timeline', target: 'timeline', noHeader: true },
      ];
      for (const s of sheets) {
        try {
          const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&${s.gidParam}`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const csv = await res.text();
          if (s.target === 'timeline') {
            const { data } = Papa.parse(csv, { header: false, skipEmptyLines: false });
            const parsed = parseTimelineCSV(data);
            if (parsed && parsed.length > 0) setTimelineData(parsed);
          } else {
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
          }
        } catch (e) { console.warn(e); }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  }, []);

  function TabsScreen() {
    const { colors: themeColors, isDark } = useTheme();
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            return <Ionicons name={focused ? icons.active : icons.inactive} size={22} color={color} />;
          },
          tabBarActiveTintColor: '#b91c1c',
          tabBarInactiveTintColor: isDark ? '#71717a' : '#9ca3af',
          tabBarStyle: {
            backgroundColor: isDark ? '#1c1c1e' : '#fff',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: isDark ? '#2c2c2e' : '#e5e7eb',
            height: 85,
            paddingTop: 8,
          },
          tabBarLabelStyle: styles.tabLabel,
        })}
      >
        <Tab.Screen name="Timeline">
          {(props) => <TimelineScreen {...props} timeline={timelineData} />}
        </Tab.Screen>
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Food">
          {() => <FoodScreen data={food} />}
        </Tab.Screen>
        <Tab.Screen name="Activities">
          {() => <ActivitiesScreen data={activities} />}
        </Tab.Screen>
        <Tab.Screen name="Allergies" component={GroupScreen} />
      </Tab.Navigator>
    );
  }

  const linking = Platform.OS === 'web' ? undefined : { prefixes: [] };

  return (
    <ThemeProvider>
      <AppInner linking={linking} sync={sync} syncing={syncing} food={food} activities={activities} TabsScreen={TabsScreen} />
    </ThemeProvider>
  );
}

function AppInner({ linking, TabsScreen }) {
  const { colors: themeColors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: themeColors.bg,
      card: themeColors.card,
      text: themeColors.text,
      border: themeColors.border,
      primary: themeColors.primary,
    },
  };

  return (
    <NavigationContainer linking={linking} theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={TabsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NearbyRecs"
          component={NearbyRecsScreen}
          options={({ route }) => {
            const day = timeline.find(d => d.day === route.params?.dayNumber);
            return {
              title: day ? `Day ${day.day} — Nearby Recs` : 'Nearby Recs',
              headerStyle: { backgroundColor: themeColors.card },
              headerTintColor: themeColors.text,
              headerTitleStyle: { fontWeight: '600', fontSize: 16, color: themeColors.text },
              headerShadowVisible: false,
              headerBackTitle: 'Timeline',
            };
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    height: 85,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default App;
registerRootComponent(App);
