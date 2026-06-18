import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';

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

      switch (user.role) {
        case 'employer':
          router.replace('/(employer)/dashboard');
          break;
        case 'employee':
          router.replace('/(employee)/home');
          break;
        case 'admin':
          router.replace('/(admin)/dashboard');
          break;
        default:
          router.replace('/(auth)/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});