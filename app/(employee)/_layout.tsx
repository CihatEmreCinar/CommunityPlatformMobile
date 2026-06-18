import { Stack } from 'expo-router';

export default function EmployeeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="workshop/[id]" />
    </Stack>
  );
}