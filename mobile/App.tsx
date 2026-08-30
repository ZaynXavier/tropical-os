import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { FinanceScreen } from './src/screens/FinanceScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { COLORS } from './src/theme/colors';
import {
  MapPin,
  Calendar,
  CreditCard,
  User,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0B0F19',
              borderBottomColor: '#2D374E',
              borderBottomWidth: 1,
              shadowColor: 'transparent',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '900',
              fontSize: 16,
            },
            tabBarStyle: {
              backgroundColor: '#101522',
              borderTopColor: '#2D374E',
              borderTopWidth: 1,
              height: 62,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen
            name="Presensi"
            component={HomeScreen}
            options={{
              title: 'Presensi & GPS',
              tabBarLabel: 'Presensi',
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <MapPin size={size - 2} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Jadwal"
            component={ScheduleScreen}
            options={{
              title: 'Jadwal Shift Mingguan',
              tabBarLabel: 'Jadwal Shift',
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <Calendar size={size - 2} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Finansial"
            component={FinanceScreen}
            options={{
              title: 'Slip Gaji & Kasbon',
              tabBarLabel: 'Gaji & Kasbon',
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <CreditCard size={size - 2} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Profil"
            component={ProfileScreen}
            options={{
              title: 'Profil Karyawan',
              tabBarLabel: 'Profil',
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <User size={size - 2} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
