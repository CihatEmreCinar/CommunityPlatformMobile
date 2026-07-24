import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deviceTokenService } from '../services/deviceTokenService';

const CACHED_TOKEN_KEY = 'cached_expo_push_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Login sonrası bir kez çağrılır (app/_layout.tsx).
 * İzin ister, Expo push token alır, backend'e kaydeder.
 * Token AsyncStorage'da cache'lenir — sadece değiştiyse tekrar register eder.
 */
export function usePushNotifications(enabled: boolean) {
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasRunRef.current) return;
    hasRunRef.current = true;

    registerForPushNotificationsAsync().catch((error) => {
      if (__DEV__) console.log('Push bildirim kaydı başarısız', error);
    });
  }, [enabled]);
}

async function registerForPushNotificationsAsync() {
  // Emülatör/simülatörde gerçek push token alınamaz (Expo kısıtlaması).
  if (!Device.isDevice) {
    if (__DEV__) console.log('Push bildirimleri sadece fiziksel cihazlarda çalışır (emulator/simulator atlandı).');
    return;
  }

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) console.log('Push bildirim izni verilmedi.');
    return;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  const expoPushToken = tokenResponse.data;

  const cachedToken = await AsyncStorage.getItem(CACHED_TOKEN_KEY);
  if (cachedToken === expoPushToken) {
    // Token değişmedi, tekrar register etmeye gerek yok.
    return;
  }

  await deviceTokenService.register(expoPushToken, Platform.OS as 'ios' | 'android');
  await AsyncStorage.setItem(CACHED_TOKEN_KEY, expoPushToken);
}
