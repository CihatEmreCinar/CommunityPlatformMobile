import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/theme';
import { ROLES } from '../../constants/roles';

export default function EmployerLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    if (user.role === ROLES.CAFE) {
      router.replace('/(cafe)/dashboard');
    } else if (user.role === ROLES.EMPLOYEE) {
      router.replace('/(employee)/home');
    } else if (user.role !== ROLES.EMPLOYER) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== ROLES.EMPLOYER) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="workshop/create" />
      <Stack.Screen name="workshop/[id]" />
      <Stack.Screen name="post/[id]" />
      <Stack.Screen name="post/create" />
      <Stack.Screen name="employer/[id]" />
      <Stack.Screen name="cafe/[id]" />
      <Stack.Screen name="enrollments" />
      <Stack.Screen name="search" />
      <Stack.Screen name="space/[id]" />
    </Stack>
  );
}