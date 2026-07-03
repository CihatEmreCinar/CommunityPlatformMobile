import { Stack } from 'expo-router';

export default function EmployerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="workshop/create" />
      <Stack.Screen name="workshop/[id]" />
      <Stack.Screen name="post/[id]" />
      <Stack.Screen name="post/create" />
      <Stack.Screen name="enrollments" />
    </Stack>
  );
}   