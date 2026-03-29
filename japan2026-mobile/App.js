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
import PlanningScreen from './src/screens/PlanningScreen';
import GroupScreen from './src/screens/GroupScreen';
import MapScreen from './src/screens/MapScreen';
import NearbyRecsScreen from './src/screens/NearbyRecsScreen';
import { SHEET_ID, initialFood, initialActivities, timeline } from './src/data/tripData';
import { colors } from './src/theme';
import { ThemeProvider, useTheme } from './src/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Timeline: { active: 'time', inactive: 'time-outline' },
  Map: { active: 'navigate-circle', inactive: 'navigate-circle-outline' },
  Food: { active: 'restaurant', inactive: 'restaurant-outline' },
  Activities: { active: 'compass', inactive: 'compass-outline' },
  Planning: { active: 'checkbox', inactive: 'checkbox-outline' },
  Allergies: { active: 'alert-circle', inactive: 'alert-circle-outline' },
};

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
        <Tab.Screen name="Timeline" component={TimelineScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Food">
          {() => <FoodScreen data={food} />}
        </Tab.Screen>
        <Tab.Screen name="Activities">
          {() => <ActivitiesScreen data={activities} />}
        </Tab.Screen>
        <Tab.Screen name="Planning" component={PlanningScreen} />
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
