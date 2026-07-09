import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

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
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </SafeAreaProvider>
    </AuthProvider>

  );
}   