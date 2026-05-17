import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Camera, Users, Home } from 'lucide-react-native';

import { ScanQRScreen } from '../screens/gatekeeper/ScanQRScreen';
import { VisitorsListScreen } from '../screens/shared/visitors/VisitorsListScreen';
import { VisitorDetailScreen } from '../screens/shared/visitors/VisitorDetailScreen';
import { CreateEditVisitorScreen } from '../screens/shared/visitors/CreateEditVisitorScreen';
import { UsersListScreen } from '../screens/syndic/UsersListScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackOpts = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.accent,
  headerTitleStyle: { fontWeight: Typography.semiBold as any, color: Colors.textPrimary },
  contentStyle: { backgroundColor: Colors.background },
};

const VisitorsStack = () => (
  <Stack.Navigator screenOptions={stackOpts}>
    <Stack.Screen name="VisitorsList" component={VisitorsListScreen} options={{ title: 'Visitantes' }} />
    <Stack.Screen name="VisitorDetail" component={VisitorDetailScreen} options={{ title: 'Detalhe' }} />
    <Stack.Screen name="CreateEditVisitor" component={CreateEditVisitorScreen} options={{ title: 'Visitante' }} />
  </Stack.Navigator>
);

export const GatekeeperNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Colors.tabBackground,
        borderTopColor: Colors.border,
        height: 64,
        paddingBottom: 10,
      },
      tabBarActiveTintColor: Colors.tabActive,
      tabBarInactiveTintColor: Colors.tabInactive,
      tabBarLabelStyle: { fontSize: Typography.xs, fontWeight: Typography.medium },
      tabBarIcon: ({ color }) => {
        const icons: Record<string, React.ElementType> = {
          'Ler QR': Camera,
          'Visitantes': Users,
          'Moradores': Home,
        };
        const IconComponent = icons[route.name] || Camera;
        return <IconComponent size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Ler QR" component={ScanQRScreen}
      options={{ headerShown: true, title: 'Scanner QR Code',
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.accent,
        headerTitleStyle: { color: Colors.textPrimary } }} />
    <Tab.Screen name="Visitantes" component={VisitorsStack} />
    <Tab.Screen name="Moradores" component={UsersListScreen}
      initialParams={{ role: 'resident' }}
      options={{ headerShown: true, title: 'Moradores',
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.accent,
        headerTitleStyle: { color: Colors.textPrimary } }} />
  </Tab.Navigator>
);
