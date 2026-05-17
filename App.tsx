import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/ToastConfig';

export default function App() {
  useEffect(() => {
    // Handle notifications received while app is in foreground
    const sub1 = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification taps
    const sub2 = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0D1B2A" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}
