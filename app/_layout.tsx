import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { OfflineBanner } from '../components/OfflineBanner';
import { initErrorReporting } from '../services/errorReporting';

// Fontlar yüklenene kadar native splash ekranı açık kalsın — aksi halde
// JS bundle çalışır çalışmaz splash kapanır ve fontsuz/boş bir an görünür.
SplashScreen.preventAutoHideAsync();

// EXPO_PUBLIC_SENTRY_DSN tanımlı değilse no-op (bkz. services/errorReporting.ts).
initErrorReporting();

function RootNavigator() {
  const { user } = useAuth();
  // Kullanıcı login olduktan SONRA bir kez push bildirim izni/token kaydı yapılır.
  usePushNotifications(!!user);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(employer)" />
      <Stack.Screen name="(employee)" />
      <Stack.Screen name="(cafe)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

export default function RootLayout() {
  // Serif başlık fontu (Lora) — Pastel kart tasarım sisteminin tipografi katmanı.
  const [fontsLoaded] = useFonts({
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Native splash ekranı hâlâ görünür durumda (preventAutoHideAsync sayesinde) — burada ayrıca bir placeholder render etmeye gerek yok.
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
          <OfflineBanner />
        </SafeAreaProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
