import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Megaphone, CalendarDays, Vote, Menu } from 'lucide-react-native';

import { NoticesListScreen } from '../screens/shared/notices/NoticesListScreen';
import { ReservationsListScreen } from '../screens/shared/reservations/ReservationsListScreen';
import { CreateReservationScreen } from '../screens/shared/reservations/CreateReservationScreen';
import { VotingsListScreen } from '../screens/shared/votings/VotingsListScreen';
import { CreateVotingScreen } from '../screens/shared/votings/CreateVotingScreen';
import { CondominiumMapScreen } from '../screens/shared/map/CondominiumMapScreen';
import { ProfileScreen } from '../screens/shared/profile/ProfileScreen';
import { ResidentMoreScreen } from '../screens/shared/more/ResidentMoreScreen';
import { EventsListScreen } from '../screens/shared/events/EventsListScreen';
import { VisitorsListScreen } from '../screens/shared/visitors/VisitorsListScreen';
import { VisitorDetailScreen } from '../screens/shared/visitors/VisitorDetailScreen';
import { CreateEditVisitorScreen } from '../screens/shared/visitors/CreateEditVisitorScreen';
import { CreateVisitScreen } from '../screens/shared/visitors/CreateVisitScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackOpts = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.accent,
  headerTitleStyle: { fontWeight: Typography.semiBold as any, color: Colors.textPrimary },
  contentStyle: { backgroundColor: Colors.background },
};

const ReservationsStack = () => (
  <Stack.Navigator screenOptions={stackOpts}>
    <Stack.Screen name="ReservationsList" component={ReservationsListScreen} options={{ title: 'Reservas' }} />
    <Stack.Screen name="CreateReservation" component={CreateReservationScreen} options={{ title: 'Nova Reserva' }} />
  </Stack.Navigator>
);

const VotingsStack = () => (
  <Stack.Navigator screenOptions={stackOpts}>
    <Stack.Screen name="VotingsList" component={VotingsListScreen} options={{ title: 'Votações' }} />
    <Stack.Screen name="CreateVoting" component={CreateVotingScreen} options={{ title: 'Nova Votação' }} />
  </Stack.Navigator>
);

const MoreStack = () => (
  <Stack.Navigator screenOptions={stackOpts}>
    <Stack.Screen name="ResidentMoreHome" component={ResidentMoreScreen} options={{ title: 'Mais' }} />
    <Stack.Screen name="EventsList" component={EventsListScreen} options={{ title: 'Eventos' }} />
    <Stack.Screen name="CondominiumMap" component={CondominiumMapScreen} options={{ title: 'Mapa' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
    <Stack.Screen name="VisitorsList" component={VisitorsListScreen} options={{ title: 'Meus Visitantes' }} />
    <Stack.Screen name="VisitorDetail" component={VisitorDetailScreen} options={{ title: 'Visitante' }} />
    <Stack.Screen name="CreateEditVisitor" component={CreateEditVisitorScreen} options={{ title: 'Visitante' }} />
    <Stack.Screen name="CreateVisit" component={CreateVisitScreen} options={{ title: 'Nova Visita' }} />
  </Stack.Navigator>
);

export const ResidentNavigator: React.FC = () => (
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
          Avisos: Megaphone,
          Reservas: CalendarDays,
          Votações: Vote,
          Mais: Menu,
        };
        const IconComponent = icons[route.name] || Megaphone;
        return <IconComponent size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="Avisos"
      component={NoticesListScreen}
      options={{
        headerShown: true,
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.accent,
        headerTitleStyle: { color: Colors.textPrimary },
      }}
    />
    <Tab.Screen name="Reservas" component={ReservationsStack} />
    <Tab.Screen name="Votações" component={VotingsStack} />
    <Tab.Screen name="Mais" component={MoreStack} />
  </Tab.Navigator>
);
