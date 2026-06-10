import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/database/initializeDatabase';
import { AppRoutes } from './src/navigation';
import { DataProvider } from './src/context/DataContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider databaseName="fincontrol.db" onInit={initializeDatabase}>
          <DataProvider>
            <AppRoutes />
            <StatusBar style="auto" />
          </DataProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
