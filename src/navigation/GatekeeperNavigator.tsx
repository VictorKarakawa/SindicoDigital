import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Camera, Users, Home } from 'lucide-react-native';

import { ScanQRScreen } from '../screens/gatekeeper/ScanQRScreen';
import { VisitorsListScreen } from '../screens/shared/visitors/VisitorsListScreen';
import { VisitsListScreen } from '../screens/shared/visitors/VisitsListScreen';
import { VisitorDetailScreen } from '../screens/shared/visitors/VisitorDetailScreen';
import { CreateEditVisitorScreen } from '../screens/shared/visitors/CreateEditVisitorScreen';
import { CreateVisitScreen } from '../screens/shared/visitors/CreateVisitScreen';
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
    <Stack.Screen name="VisitsList" component={VisitsListScreen} options={{ title: 'Visitas Ativas' }} />
    <Stack.Screen name="VisitorsList" component={VisitorsListScreen} options={{ title: 'Visitantes Cadastrados' }} />
    <Stack.Screen name="VisitorDetail" component={VisitorDetailScreen} options={{ title: 'Detalhe do Visitante' }} />
    <Stack.Screen name="CreateEditVisitor" component={CreateEditVisitorScreen} options={{ title: 'Perfil Visitante' }} />
    <Stack.Screen name="CreateVisit" component={CreateVisitScreen} options={{ title: 'Nova Visita' }} />
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
