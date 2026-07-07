import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { spaceListingService, type SpaceListing } from '../../../services/spaceListingService';

export default function EmployerSpaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<SpaceListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.log('employer space detail: missing id', id);
      setLoading(false);
      return;
    }
    const resolvedId = Array.isArray(id) ? id[0] : String(id);
    if (!resolvedId || resolvedId === 'undefined') {
      console.log('employer space detail: invalid id', id);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        console.log('employer fetching listing', resolvedId);
        const data = await spaceListingService.getById(resolvedId);
        setListing(data);
      } catch (error) {
        console.log('Mekan detay yüklenemedi', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
        <View style={styles.centered}>
          <Text>İlan bulunamadı.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']} header={<Text style={styles.title}>{listing.title}</Text>}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photoGallery}>
          {listing.photoUrls.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
              {listing.photoUrls.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.photoItem} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialIcons name="photo-library" size={32} color={Colors.outline} />
              <Text style={styles.photoPlaceholderText}>Fotoğraf yok</Text>
            </View>
          )}
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, listing.isActive ? styles.statusActive : styles.statusInactive]}>
            <Text style={styles.statusText}>{listing.isActive ? 'Aktif' : 'Pasif'}</Text>
          </View>
          {listing.status ? <Text style={styles.statusSubtext}>{listing.status}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Açıklama</Text>
          <Text style={styles.value}>{listing.description || 'Açıklama yok.'}</Text>
        </View>

        <View style={styles.rowCard}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Kapasite</Text>
            <Text style={styles.value}>{listing.capacity} kişi</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Saatlik</Text>
            <Text style={styles.value}>{listing.hourlyPrice} ₺</Text>
          </View>
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

        <View style={styles.card}>
          <Text style={styles.label}>Kafe</Text>
          <Text style={styles.value}>{listing.cafeName || 'Bilinmiyor'}</Text>
          {listing.cafeCity ? <Text style={styles.subValue}>{listing.cafeCity}</Text> : null}
        </View>

        <TouchableOpacity style={styles.disabledButton} activeOpacity={0.8} disabled>
          <Text style={styles.disabledButtonText}>Rezervasyon isteği yakında</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h3, color: Colors.onSurface },
  content: { padding: Spacing.md, gap: Spacing.md },
  photoGallery: { minHeight: 180, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Colors.surfaceContainerLowest },
  photoRow: { gap: Spacing.sm, padding: Spacing.sm },
  photoItem: { width: 240, height: 160, borderRadius: Radius.lg, backgroundColor: Colors.surfaceContainer },
  photoPlaceholder: { flex: 1, minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  photoPlaceholderText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusBadge: { borderRadius: Radius.full, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  statusActive: { backgroundColor: Colors.primary + '20' },
  statusInactive: { backgroundColor: Colors.error + '20' },
  statusText: { ...Typography.labelSm, color: Colors.primary },
  statusSubtext: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.xs, ...Shadows.sm },
  rowCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm, ...Shadows.sm },
  infoColumn: { flex: 1, gap: Spacing.xs },
  label: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  value: { ...Typography.bodyMd, color: Colors.onSurface },
  subValue: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  disabledButton: { marginTop: Spacing.sm, backgroundColor: Colors.surfaceContainer, borderRadius: Radius.full, paddingVertical: Spacing.md, alignItems: 'center' },
  disabledButtonText: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
});
