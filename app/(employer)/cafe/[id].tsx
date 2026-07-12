import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { CafePublicProfileScreen } from '../../../components/profile/CafePublicProfileScreen';

export default function EmployerViewCafeProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CafePublicProfileScreen cafeId={id} />;
}
