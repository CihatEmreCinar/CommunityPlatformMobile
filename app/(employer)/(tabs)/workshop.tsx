import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Icon } from '../../../components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { workshopService } from '../../../services/workshopService';
import { Workshop } from '../../../types/workshop';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';
import { useFloatingTabBarClearance } from '../../../components/layout/FloatingTabBar';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  published: 'Yayında',
  cancelled: 'İptal Edildi',
  completed: 'Tamamlandı',
};

// Durum = renk kodu: taslak amber, yayında teal, iptal coral, tamamlandı mor.
const STATUS_PALETTE: Record<string, typeof Pastel.teal> = {
  draft: Pastel.amber,
  published: Pastel.teal,
  cancelled: Pastel.coral,
  completed: Pastel.purple,
};

export default function MyWorkshopsScreen() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status?: string }>();
  const tabBarClearance = useFloatingTabBarClearance();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadWorkshops = useCallback(async () => {
    try {
      setWorkshops(await workshopService.getMyWorkshops(status));
    } catch (error) {
      if (__DEV__) console.log('Atölyeler yüklenemedi', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [status]);

  useFocusEffect(useCallback(() => { loadWorkshops(); }, [loadWorkshops]));

  function onRefresh() {
    setIsRefreshing(true);
    loadWorkshops();
  }

  async function handlePublish(workshop: Workshop) {
    setUpdatingId(workshop.id);
    try {
      await workshopService.changeStatus(workshop.id, 'published');
      await loadWorkshops();
      Alert.alert('Başarılı', 'Atölye yayına alındı.');
    } catch (error: any) {
      Alert.alert('Hata', error?.response?.data?.message || 'Yayınlama başarısız.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleUnpublish(workshop: Workshop) {
    setUpdatingId(workshop.id);
    try {
      await workshopService.changeStatus(workshop.id, 'draft');
      await loadWorkshops();
    } catch (error: any) {
      Alert.alert('Hata', error?.response?.data?.message || 'İşlem başarısız.');
    } finally {
      setUpdatingId(null);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingBottom: tabBarClearance }]}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Geri">
            <Icon name="arrowBack" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Atölyelerim</Text>
          <TouchableOpacity onPress={() => router.push('/(employer)/workshop/create')} style={styles.addButton} accessibilityRole="button" accessibilityLabel="Yeni atölye oluştur">
            <Icon name="addAction" size={20} color={Colors.onPrimary} />
          </TouchableOpacity>
        </View>

        {workshops.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="eventNote" size={38} color={Colors.outline} />
            <Text style={styles.emptyTitle}>Henüz atölyen yok</Text>
            <Text style={styles.emptyText}>İlk atölyeni oluşturarak başla</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {workshops.map((workshop) => {
              const palette = STATUS_PALETTE[workshop.status] ?? Pastel.teal;
              return (
                <TouchableOpacity
                  key={workshop.id}
                  style={[styles.card, { backgroundColor: palette.tint }]}
                  onPress={() => router.push(`/(employer)/workshop/${workshop.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleWrap}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{workshop.title}</Text>
                      <Text style={[styles.cardPrice, { color: palette.text }]}>{workshop.price} ₺</Text>
                    </View>
                    <View style={styles.cardHeaderRight}>
                      <TouchableOpacity
                        style={[styles.editIconButton, { backgroundColor: palette.tintStrong }]}
                        onPress={() => router.push(`/(employer)/workshop/edit/${workshop.id}` as any)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Icon name="edit" size={15} color={palette.text} />
                      </TouchableOpacity>
                      <View style={[styles.statusBadge, { backgroundColor: palette.tintStrong }]}>
                        <View style={[styles.statusDot, { backgroundColor: palette.text }]} />
                        <Text style={[styles.statusText, { color: palette.text }]}>
                          {STATUS_LABELS[workshop.status] || workshop.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Icon name="groups" size={13} color={Colors.onSurfaceVariant} />
                      <Text style={styles.metaText}>{workshop.enrolledCount}/{workshop.capacity} kişi</Text>
                    </View>
                    {workshop.avgRating > 0 && (
                      <View style={styles.metaItem}>
                        <Icon name="star" size={13} color={Colors.amber} />
                        <Text style={styles.metaText}>{workshop.avgRating.toFixed(1)}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardActions}>
                    {workshop.status === 'draft' && (
                      <TouchableOpacity style={styles.publishButton} onPress={() => handlePublish(workshop)} disabled={updatingId === workshop.id}>
                        {updatingId === workshop.id ? (
                          <ActivityIndicator size="small" color={Colors.onPrimary} />
                        ) : (
                          <>
                            <Icon name="publish" size={15} color={Colors.onPrimary} />
                            <Text style={styles.publishButtonText}>Yayınla</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    {workshop.status === 'published' && (
                      <TouchableOpacity style={styles.unpublishButton} onPress={() => handleUnpublish(workshop)} disabled={updatingId === workshop.id}>
                        {updatingId === workshop.id ? (
                          <ActivityIndicator size="small" color={Colors.onSurfaceVariant} />
                        ) : (
                          <Text style={styles.unpublishButtonText}>Taslağa Al</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  container: { paddingHorizontal: Spacing.containerMargin, paddingTop: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  backButton: { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...Typography.serifTitleLg, color: Colors.onSurface },
  addButton: { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.xs },
  emptyTitle: { ...Typography.serifTitle, color: Colors.onSurface, marginTop: Spacing.sm },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  list: { gap: Spacing.sm },
  card: { borderRadius: Radius.xxl, padding: Spacing.md, gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitleWrap: { flex: 1, marginRight: Spacing.sm },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  editIconButton: { width: 28, height: 28, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { ...Typography.labelMd, fontSize: 15, color: Colors.onSurface },
  cardPrice: { ...Typography.bodyMd, fontWeight: '700', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...Typography.labelSm, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', gap: Spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  cardActions: { flexDirection: 'row', gap: Spacing.sm },
  publishButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  publishButtonText: { ...Typography.labelMd, color: Colors.onPrimary },
  unpublishButton: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.md, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  unpublishButtonText: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
});
