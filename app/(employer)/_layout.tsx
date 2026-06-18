import { Stack } from 'expo-router';

export default function EmployerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile/index" />
      <Stack.Screen name="workshop/create" />
      <Stack.Screen name="workshop/index" />
    </Stack>
  );
}