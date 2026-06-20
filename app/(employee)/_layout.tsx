import { Stack } from 'expo-router';

export default function EmployeeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="workshop/[id]" />
      <Stack.Screen name="employer/[id]" />
    </Stack>
  );
}