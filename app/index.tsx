import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      if (user.role === 'employer') {
        router.replace('/(employer)/dashboard');
      } else if (user.role === 'employee') {
        router.replace('/(employee)/home');
      } else if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}