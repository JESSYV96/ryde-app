import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/shared/ui/theme';

const TabsLayout = () => {
  const { t: tHome } = useTranslation('home');
  const { t: tFleet } = useTranslation('fleet');
  const { t: tSettings } = useTranslation('settings');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: tHome('tabName'),
          tabBarIcon: ({ color, size }) => (
            <SymbolView name={{ android: 'home_filled', ios: 'house.fill' }} tintColor={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: tFleet('tabName'),
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ android: 'directions_car_filled', ios: 'car.fill' }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: tSettings('tabName'),
          tabBarIcon: ({ color, size }) => (
            <SymbolView name={{ android: 'settings', ios: 'gearshape.fill' }} tintColor={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
