import { useCallback, useState } from 'react';
import { Image, View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { spaceListingService, type SpaceListing } from '../../../services/spaceListingService';

export default function CafeListingsScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<SpaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = useCallback(async () => {
    try {
      const data = await spaceListingService.getMine();
      setListings(data);
    } catch (error) {
      console.log('İlanlar yüklenemedi', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadListings(); }, [loadListings]));

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']} header={
      <View style={styles.headerRow}>
        <Text style={styles.title}>İlanlarım</Text>
        <TouchableOpacity onPress={() => router.push('/(cafe)/listing/create')} style={styles.addButton}>
          <MaterialIcons name="add" size={22} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>
    }>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadListings(); }} colors={[Colors.primary]} />}
        contentContainerStyle={styles.content}
      >
        {listings.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-note" size={40} color={Colors.outline} />
            <Text style={styles.emptyTitle}>Henüz ilan yok</Text>
            <Text style={styles.emptyText}>İlk ilanını oluşturarak başlayabilirsin.</Text>
            <TouchableOpacity style={styles.emptyAction} onPress={() => router.push('/(cafe)/listing/create')}>
              <Text style={styles.emptyActionText}>İlan Oluştur</Text>
            </TouchableOpacity>
          </View>
        ) : listings.map((listing) => (
          <View key={listing.id} style={styles.card}>
            <TouchableOpacity style={styles.cardContent} onPress={() => router.push(`/(cafe)/listing/${listing.id}` as any)} activeOpacity={0.85}>
              <View style={styles.imagePlaceholder}>
                {listing.photoUrls[0] ? (
                  <Image source={{ uri: listing.photoUrls[0] }} style={styles.image} />
                ) : (
                  <MaterialIcons name="photo-camera" size={30} color={Colors.outline} />
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{listing.title}</Text>
                <Text style={styles.cardMeta}>{listing.capacity} kişi · {listing.hourlyPrice} ₺/saat</Text>
                {listing.city ? <Text style={styles.cardCity}>{listing.city}</Text> : null}
                <Text style={[styles.statusLabel, listing.isActive ? styles.statusActive : styles.statusInactive]}>
                  {listing.isActive ? 'Aktif' : 'Pasif'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={() => router.push(`/(cafe)/listing/${listing.id}` as any)} activeOpacity={0.85}>
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  title: { ...Typography.h3, color: Colors.onSurface },
  addButton: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  content: { padding: Spacing.md, gap: Spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.xs },
  emptyTitle: { ...Typography.h3, color: Colors.onSurface },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', gap: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceVariant, ...Shadows.sm },
  imagePlaceholder: { width: 72, height: 72, borderRadius: Radius.md, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, justifyContent: 'center', gap: 4 },
  cardTitle: { ...Typography.labelMd, color: Colors.onSurface },
  cardMeta: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  cardCity: { ...Typography.bodyMd, color: Colors.primary },
  cardContent: { flex: 1, flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  image: { width: 72, height: 72, borderRadius: Radius.md },
  statusLabel: { ...Typography.labelSm, marginTop: Spacing.xs },
  statusActive: { color: Colors.primary },
  statusInactive: { color: Colors.error },
  editButton: { justifyContent: 'center', paddingHorizontal: Spacing.sm },
  editButtonText: { ...Typography.labelMd, color: Colors.primary },
  emptyAction: { marginTop: Spacing.md, backgroundColor: Colors.primary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.full },
  emptyActionText: { ...Typography.labelMd, color: Colors.onPrimary },
});
