import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { EmployerPublicProfileScreen } from '../../../components/profile/EmployerPublicProfileScreen';

export default function EmployerViewEmployerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EmployerPublicProfileScreen employerId={id} />;
}
