import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AuthNavigator } from './AuthNavigator';
import { SyndicNavigator } from './SyndicNavigator';
import { ResidentNavigator } from './ResidentNavigator';
import { GatekeeperNavigator } from './GatekeeperNavigator';
import { PendingResidentScreen } from '../screens/resident/PendingResidentScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando..." />;
  }

  const getNavigator = () => {
    if (!user || !userProfile) return <Stack.Screen name="Auth" component={AuthNavigator} />;
    switch (userProfile.role) {
      case 'syndic':     return <Stack.Screen name="Syndic"     component={SyndicNavigator} />;
      case 'resident':
        if (userProfile.status === 'pending' || userProfile.status === 'rejected') {
          return <Stack.Screen name="PendingResident" component={PendingResidentScreen} />;
        }
        return <Stack.Screen name="Resident"   component={ResidentNavigator} />;
      case 'gatekeeper': return <Stack.Screen name="Gatekeeper" component={GatekeeperNavigator} />;
      default:           return <Stack.Screen name="Auth"       component={AuthNavigator} />;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {getNavigator()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
