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

export const usePushNotifications = (user: any) => {
  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
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

      token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      // Save token to backend ONLY if user is logged in
      if (user) {
        try {
          await API.post('/auth/push-token', { token: token.data });
          console.log("Saved push token to backend for user:", user.email);
        } catch (e) {
          console.error("Failed to save push token", e);
        }
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  useEffect(() => {
    // Register token whenever user state changes (e.g. login)
    if (user) {
      registerForPushNotificationsAsync().then((token) => {
        setExpoPushToken(token);
      });
    }

    // Always listen for notifications if the hook is active
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const targetScreen = data?.targetScreen;
      const targetId = data?.targetId;

      if (targetScreen) {
        if (targetScreen === 'MeetingDetails' && targetId) {
            // @ts-ignore
            navigation.navigate('MeetingDetails', { requestId: parseInt(targetId) });
        } else {
            // @ts-ignore
            navigation.navigate(targetScreen);
        }
      } else {
        // @ts-ignore
        navigation.navigate('Notifications');
      }
    });

    return () => {
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [user]);

  return { expoPushToken, notification };
};
