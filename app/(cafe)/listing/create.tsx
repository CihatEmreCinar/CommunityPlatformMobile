import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '../../../components/ui/Icon';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { SpaceListingForm } from '../../../components/cafe/SpaceListingForm';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
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
    <ScreenContainer edges={['top', 'bottom']}>
      <Text style={styles.headerTitle}>Yeni İlan</Text>
      <SpaceListingForm onSubmit={handleSubmit} submitting={isSaving} submitLabel="Oluştur" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerTitle: { ...Typography.h3, color: Colors.onSurface, marginBottom: Spacing.md, paddingHorizontal: Spacing.md },
  content: { padding: Spacing.md, gap: Spacing.md },
  fieldGroup: { gap: Spacing.xs },
  row: { flexDirection: 'row', gap: Spacing.sm },
  rowItem: { flex: 1 },
  label: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  input: { backgroundColor: Colors.surfaceBright, borderWidth: 1, borderColor: Colors.surfaceVariant, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, color: Colors.onSurface },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  photoButton: { borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  photoText: { ...Typography.labelMd, color: Colors.primary },
});
