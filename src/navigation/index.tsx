import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LayoutDashboard, ArrowLeftRight, CalendarClock, PieChart, Settings as SettingsIcon } from 'lucide-react-native';

import { Dashboard } from '../screens/Dashboard';
import { Transactions } from '../screens/Transactions';
import { FixedExpenses } from '../screens/FixedExpenses';
import { Reports } from '../screens/Reports';
import { Settings } from '../screens/Settings';

const Tab = createBottomTabNavigator();

export function AppRoutes() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#E5E5EA',
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
