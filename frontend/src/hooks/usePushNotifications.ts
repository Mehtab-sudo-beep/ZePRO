import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import API from '../api/api';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

// Ensure notifications show even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription>(undefined);
  const responseListener = useRef<Notifications.Subscription>(undefined);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const projectId = Constants?.expoConfig?.extra?.eas?.projectId 
        ?? Constants?.easConfig?.projectId;

      // In managed Expo workflow, the Expo push token will implicitly use FCM if configured
      token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      // Save token to backend
      try {
        await API.post('/auth/push-token', { token: token.data });
        console.log("Saved push token to backend");
      } catch (e) {
        console.error("Failed to save push token", e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    // Handle Foreground Notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Handle Notification Clicks (Foreground/Background)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const targetScreen = data?.targetScreen;
      const targetId = data?.targetId;

      if (targetScreen) {
        // App was opened via Notification Click
        // Navigate based on metadata
        if (targetScreen === 'MeetingDetails' && targetId) {
            // @ts-ignore
            navigation.navigate('MeetingDetails', { requestId: parseInt(targetId) });
        } else {
            // @ts-ignore
            navigation.navigate(targetScreen);
        }
      } else {
        // Fallback or generic history
        // @ts-ignore
        navigation.navigate('Notifications');
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken, notification };
};
