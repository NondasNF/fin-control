import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LayoutDashboard, ArrowLeftRight, CalendarClock, PieChart, Settings as SettingsIcon } from 'lucide-react-native';
import { useData } from '../context/DataContext';
import { navigationRef, flushPendingNavigation } from './navigationRef';
import { setupNotificationRouting } from '../services/notificationRouting';

import { Dashboard } from '../screens/Dashboard';
import { Transactions } from '../screens/Transactions';
import { FixedExpenses } from '../screens/FixedExpenses';
import { Reports } from '../screens/Reports';
import { Settings } from '../screens/Settings';

const Tab = createBottomTabNavigator();

export function AppRoutes() {
  const { theme, isDark } = useData();

  useEffect(() => setupNotificationRouting(), []);

  const MyTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.card }}>
      <NavigationContainer ref={navigationRef} onReady={flushPendingNavigation} theme={MyTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.subtext,
            tabBarStyle: {
              backgroundColor: theme.card,
              borderTopWidth: 1,
              borderTopColor: theme.border,
              height: 60,
              paddingBottom: 8,
            }
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={Dashboard}
            options={{
              tabBarIcon: ({ color, size }) => (
                <LayoutDashboard color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Transações"
            component={Transactions}
            options={{
              tabBarIcon: ({ color, size }) => (
                <ArrowLeftRight color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Gastos Fixos"
            component={FixedExpenses}
            options={{
              tabBarIcon: ({ color, size }) => (
                <CalendarClock color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Relatórios"
            component={Reports}
            options={{
              tabBarIcon: ({ color, size }) => (
                <PieChart color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Ajustes"
            component={Settings}
            options={{
              tabBarIcon: ({ color, size }) => (
                <SettingsIcon color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
