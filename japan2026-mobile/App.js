import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import Papa from 'papaparse';

import TimelineScreen from './src/screens/TimelineScreen';
import FoodScreen from './src/screens/FoodScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import PlanningScreen from './src/screens/PlanningScreen';
import GroupScreen from './src/screens/GroupScreen';
import NearbyRecsScreen from './src/screens/NearbyRecsScreen';
import MapScreen from './src/screens/MapScreen';
import { SHEET_ID, initialFood, initialActivities, timeline } from './src/data/tripData';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Timeline: { active: 'time', inactive: 'time-outline' },
  Map: { active: 'navigate-circle', inactive: 'navigate-circle-outline' },
  Food: { active: 'restaurant', inactive: 'restaurant-outline' },
  Activities: { active: 'compass', inactive: 'compass-outline' },
  Planning: { active: 'checkbox', inactive: 'checkbox-outline' },
  Group: { active: 'people', inactive: 'people-outline' },
};

function HeroHeader({ onSync, syncing }) {
  return (
    <View style={styles.hero}>
      <StatusBar style="light" />
      <View style={styles.heroInner}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>SUMMER 2026</Text>
        </View>
        <Text style={styles.heroJp}>日本</Text>
        <Text style={styles.heroEn}>Japan</Text>
        <Text style={styles.heroSub}>July 11 – July 25 · 15 Days</Text>
        <Text style={styles.heroRoute}>Tokyo → Osaka → Kyoto → Tokyo</Text>

        <View style={styles.statsRow}>
          {[['10', 'Travelers'], ['90+', 'Restaurants'], ['60+', 'Activities']].map(([n, l]) => (
            <View key={l} style={styles.stat}>
              <Text style={styles.statNum}>{n}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={onSync} style={styles.syncBtn} activeOpacity={0.7} disabled={syncing}>
          {syncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="refresh" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.syncText}>Sync from Google Sheets</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function App() {
  const [food, setFood] = useState(initialFood);
  const [activities, setActivities] = useState(initialActivities);
  const [syncing, setSyncing] = useState(false);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const sheets = [
        { gidParam: 'gid=0', target: 'activities' },
        { gidParam: 'sheet=Food%20Menu', target: 'food' },
      ];
      for (const s of sheets) {
        try {
          const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&${s.gidParam}`;
          const res = await fetch(url);
          if (!res.ok) continue;
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
        } catch (e) { console.warn(e); }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  }, []);

  function TabsScreen() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: () => <HeroHeader onSync={sync} syncing={syncing} />,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            return <Ionicons name={focused ? icons.active : icons.inactive} size={22} color={color} />;
          },
          tabBarActiveTintColor: '#b91c1c',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        })}
      >
        <Tab.Screen name="Timeline" component={TimelineScreen} />
        <Tab.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Food">
          {() => <FoodScreen data={food} />}
        </Tab.Screen>
        <Tab.Screen name="Activities">
          {() => <ActivitiesScreen data={activities} />}
        </Tab.Screen>
        <Tab.Screen name="Planning" component={PlanningScreen} />
        <Tab.Screen name="Group" component={GroupScreen} />
      </Tab.Navigator>
    );
  }

  const linking = Platform.OS === 'web' ? undefined : { prefixes: [] };

  return (
    <NavigationContainer linking={linking}>
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
              headerStyle: { backgroundColor: '#fff' },
              headerTintColor: colors.primary,
              headerTitleStyle: { fontWeight: '600', fontSize: 16 },
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
  hero: {
    backgroundColor: '#1a1a2e',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heroInner: { alignItems: 'center' },
  heroBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#f5e6c8',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  heroJp: {
    fontSize: 48,
    fontWeight: '100',
    color: '#fff',
    letterSpacing: 8,
  },
  heroEn: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginTop: -2,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
  },
  heroRoute: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 32,
  },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '700', color: '#fff' },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  syncText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
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
