import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { SpaceListingForm } from '../../../components/cafe/SpaceListingForm';
import { spaceListingService, type SpaceListing, type SpaceListingRequest } from '../../../services/spaceListingService';

export default function SpaceListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<SpaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadListing = useCallback(async () => {
    if (!id) {
      console.log('fetching listing: missing id', id);
      return;
    }
    const resolvedId = Array.isArray(id) ? id[0] : String(id);
    if (!resolvedId || resolvedId === 'undefined') {
      console.log('fetching listing: invalid id', id);
      return;
    }
    try {
      setLoading(true);
      console.log('fetching listing', resolvedId);
      const data = await spaceListingService.getById(resolvedId);
      setListing(data);
    } catch (error) {
      console.log('İlan detay yüklenemedi', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadListing(); }, [loadListing]);

  async function handleDelete() {
    if (!id || !listing) return;
    Alert.alert('Sil', 'Bu ilanı silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await spaceListingService.delete(id);
            router.back();
          } catch (error: any) {
            const message = error?.response?.data?.message || 'Silme işlemi başarısız.';
            Alert.alert('Hata', message);
          }
        },
      },
    ]);
  }

  async function handleUpdate(request: SpaceListingRequest, newPhotos: string[]) {
    if (!id || !listing) return;
    setSubmitting(true);
    try {
      const updated = await spaceListingService.update(id, request);
      for (const uri of newPhotos) {
        await spaceListingService.uploadPhoto(id, uri);
      }
      setListing(updated);
      setEditing(false);
      Alert.alert('Güncellendi', 'İlan başarıyla güncellendi.');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'İlan güncellenemedi.';
      Alert.alert('Hata', message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!listing) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.centered}><Text>İlan bulunamadı.</Text></View>
      </ScreenContainer>
    );
  }

  if (editing) {
    return (
      <ScreenContainer
        edges={['top', 'bottom']}
        header={
          <View style={styles.headerRow}>
            <Text style={styles.title}>İlanı Düzenle</Text>
            <TouchableOpacity onPress={() => setEditing(false)}>
              <MaterialIcons name="close" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>
        }
      >
        <SpaceListingForm
          initialData={listing}
          existingPhotoUrls={listing.photoUrls}
          onSubmit={handleUpdate}
          submitting={submitting}
          submitLabel="Güncelle"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      edges={['top', 'bottom']}
      header={
        <View style={styles.headerRow}>
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.iconButton}>
              <MaterialIcons name="edit" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <MaterialIcons name="delete" size={22} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Açıklama</Text>
          <Text style={styles.value}>{listing.description || 'Açıklama yok.'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Kapasite</Text>
          <Text style={styles.value}>{listing.capacity} kişi</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Saatlik fiyat</Text>
          <Text style={styles.value}>{listing.hourlyPrice} ₺</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Şehir</Text>
          <Text style={styles.value}>{listing.city || 'Belirtilmemiş'}</Text>
        </View>
        {listing.amenities.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.label}>Olanaklar</Text>
            <Text style={styles.value}>{listing.amenities.join(', ')}</Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  iconButton: { padding: Spacing.xs },
  title: { ...Typography.h3, color: Colors.onSurface },
  content: { padding: Spacing.md, gap: Spacing.md },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.xs, ...Shadows.sm },
  label: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  value: { ...Typography.bodyMd, color: Colors.onSurface },
});
