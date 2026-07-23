import React, { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { SpaceListingForm } from '../../../components/cafe/SpaceListingForm';
import { Colors, Typography, Spacing } from '../../../constants/theme';
import { spaceListingService } from '../../../services/spaceListingService';

export default function CreateSpaceListingScreen() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(request: any, photoUris: string[]) {
    setIsSaving(true);
    try {
      const created = await spaceListingService.create(request);
      for (const uri of photoUris) {
        await spaceListingService.uploadPhoto(created.id, uri);
      }
      Alert.alert('Başarılı', 'İlan oluşturuldu.', [{ text: 'Tamam', onPress: () => router.replace('/(cafe)/(tabs)/listings') }]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'İlan oluşturulamadı.';
      Alert.alert('Hata', message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenContainer edges={['top', 'bottom']} scroll={false}>
      <Text style={styles.headerTitle}>Yeni İlan</Text>
      <SpaceListingForm onSubmit={handleSubmit} submitting={isSaving} submitLabel="Oluştur" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerTitle: { ...Typography.serifTitleLg, color: Colors.onSurface, marginTop: Spacing.sm, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
});
