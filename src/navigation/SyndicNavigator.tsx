import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { LayoutDashboard, Megaphone, Settings, CalendarDays, Users, Vote, User } from 'lucide-react-native';

// Screens
import { SyndicDashboardScreen } from '../screens/syndic/DashboardScreen';
import { NoticesListScreen } from '../screens/shared/notices/NoticesListScreen';
import { CreateEditNoticeScreen } from '../screens/shared/notices/CreateEditNoticeScreen';
import { UsersListScreen } from '../screens/syndic/UsersListScreen';
import { CreateEditUserScreen } from '../screens/syndic/CreateEditUserScreen';
import { ManagementScreen } from '../screens/syndic/ManagementScreen';
import { SpacesListScreen } from '../screens/shared/spaces/SpacesListScreen';
import { CreateEditSpaceScreen } from '../screens/shared/spaces/CreateEditSpaceScreen';
import { BlocksListScreen } from '../screens/syndic/structure/BlocksListScreen';
import { CreateEditBlockScreen } from '../screens/syndic/structure/CreateEditBlockScreen';
import { ApartmentsListScreen } from '../screens/syndic/structure/ApartmentsListScreen';
import { CreateEditApartmentScreen } from '../screens/syndic/structure/CreateEditApartmentScreen';
import { ReservationsListScreen } from '../screens/shared/reservations/ReservationsListScreen';
import { CreateReservationScreen } from '../screens/shared/reservations/CreateReservationScreen';
import { VisitorsListScreen } from '../screens/shared/visitors/VisitorsListScreen';
import { VisitorDetailScreen } from '../screens/shared/visitors/VisitorDetailScreen';
import { CreateEditVisitorScreen } from '../screens/shared/visitors/CreateEditVisitorScreen';
import { VotingsListScreen } from '../screens/shared/votings/VotingsListScreen';
import { CreateVotingScreen } from '../screens/shared/votings/CreateVotingScreen';
import { ProfileScreen } from '../screens/shared/profile/ProfileScreen';
import { AdminLogsScreen } from '../screens/syndic/AdminLogsScreen';
import { EventsListScreen } from '../screens/shared/events/EventsListScreen';
import { CreateEditEventScreen } from '../screens/shared/events/CreateEditEventScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.accent,
  headerTitleStyle: { fontWeight: Typography.semiBold as any, color: Colors.textPrimary },
  contentStyle: { backgroundColor: Colors.background },
};

// ─── Nested stacks ────────────────────────────────────────────────────────────

const NoticesStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="NoticesList" component={NoticesListScreen}
      options={{ title: 'Avisos' }} />
    <Stack.Screen name="CreateEditNotice" component={CreateEditNoticeScreen}
      options={{ title: 'Aviso' }} />
  </Stack.Navigator>
);

const ManagementStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ManagementMenu" component={ManagementScreen}
      options={{ title: 'Gestão' }} />
    <Stack.Screen name="ResidentsList" component={UsersListScreen}
      options={{ title: 'Moradores' }}
      initialParams={{ role: 'resident' }} />
    <Stack.Screen name="CreateEditUser" component={CreateEditUserScreen}
      options={{ title: 'Usuário' }} />
    <Stack.Screen name="GatekeepersList" component={UsersListScreen}
      options={{ title: 'Porteiros' }} />
    <Stack.Screen name="SpacesList" component={SpacesListScreen}
      options={{ title: 'Espaços' }} />
    <Stack.Screen name="CreateEditSpace" component={CreateEditSpaceScreen}
      options={{ title: 'Espaço' }} />
    <Stack.Screen name="EventsList" component={EventsListScreen}
      options={{ title: 'Eventos' }} />
    <Stack.Screen name="CreateEditEvent" component={CreateEditEventScreen}
      options={{ title: 'Evento' }} />
    <Stack.Screen name="BlocksList" component={BlocksListScreen}
      options={{ title: 'Blocos' }} />
    <Stack.Screen name="CreateEditBlock" component={CreateEditBlockScreen}
      options={{ title: 'Bloco' }} />
    <Stack.Screen name="ApartmentsList" component={ApartmentsListScreen}
      options={{ title: 'Unidades' }} />
    <Stack.Screen name="CreateEditApartment" component={CreateEditApartmentScreen}
      options={{ title: 'Unidade' }} />
    <Stack.Screen name="AdminLogs" component={AdminLogsScreen}
      options={{ title: 'Histórico de ações' }} />
  </Stack.Navigator>
);

const ReservationsStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ReservationsList" component={ReservationsListScreen}
      options={{ title: 'Reservas' }} />
    <Stack.Screen name="CreateReservation" component={CreateReservationScreen}
      options={{ title: 'Nova Reserva' }} />
  </Stack.Navigator>
);

const VisitorsStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="VisitorsList" component={VisitorsListScreen}
      options={{ title: 'Visitantes' }} />
    <Stack.Screen name="VisitorDetail" component={VisitorDetailScreen}
      options={{ title: 'Visitante' }} />
    <Stack.Screen name="CreateEditVisitor" component={CreateEditVisitorScreen}
      options={{ title: 'Visitante' }} />
  </Stack.Navigator>
);

const VotingsStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="VotingsList" component={VotingsListScreen}
      options={{ title: 'Votações' }} />
    <Stack.Screen name="CreateVoting" component={CreateVotingScreen}
      options={{ title: 'Nova Votação' }} />
  </Stack.Navigator>
);

// ─── Tab Navigator ────────────────────────────────────────────────────────────
export const SyndicNavigator: React.FC = () => (
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
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, React.ElementType> = {
          Dashboard: LayoutDashboard,
          Avisos: Megaphone,
          Gestão: Settings,
          Reservas: CalendarDays,
          Visitantes: Users,
          Votações: Vote,
          Perfil: User,
        };
        const IconComponent = icons[route.name] || LayoutDashboard;
        return <IconComponent size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={SyndicDashboardScreen}
      options={{ title: 'Dashboard', headerShown: false }} />
    <Tab.Screen name="Avisos" component={NoticesStack}
      listeners={({ navigation }) => ({
        tabPress: (e) => { e.preventDefault(); navigation.navigate('Avisos', { screen: 'NoticesList' }); }
      })} />
    <Tab.Screen name="Gestão" component={ManagementStack}
      listeners={({ navigation }) => ({
        tabPress: (e) => { e.preventDefault(); navigation.navigate('Gestão', { screen: 'ManagementMenu' }); }
      })} />
    <Tab.Screen name="Reservas" component={ReservationsStack}
      listeners={({ navigation }) => ({
        tabPress: (e) => { e.preventDefault(); navigation.navigate('Reservas', { screen: 'ReservationsList' }); }
      })} />
    <Tab.Screen name="Visitantes" component={VisitorsStack}
      listeners={({ navigation }) => ({
        tabPress: (e) => { e.preventDefault(); navigation.navigate('Visitantes', { screen: 'VisitorsList' }); }
      })} />
    <Tab.Screen name="Votações" component={VotingsStack}
      listeners={({ navigation }) => ({
        tabPress: (e) => { e.preventDefault(); navigation.navigate('Votações', { screen: 'VotingsList' }); }
      })} />
    <Tab.Screen name="Perfil" component={ProfileScreen}
      options={{ headerShown: true, title: 'Meu Perfil',
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.accent,
        headerTitleStyle: { color: Colors.textPrimary } }} />
  </Tab.Navigator>
);
