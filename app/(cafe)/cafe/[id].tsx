import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { CafePublicProfileScreen } from '../../../components/profile/CafePublicProfileScreen';

export default function CafeViewCafeProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CafePublicProfileScreen cafeId={id} />;
}
