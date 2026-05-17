import * as Notifications from 'expo-notifications';
import { ref, update } from 'firebase/database';
import { database } from '../config/firebase';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (userId: string): Promise<string | null> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Síndico Digital',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AC0D',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save token to Firebase so syndic can send push to all users
  await update(ref(database, `users/${userId}`), { pushToken: token });

  return token;
};

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  trigger?: Notifications.NotificationTriggerInput
): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: trigger ?? null,
  });
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
