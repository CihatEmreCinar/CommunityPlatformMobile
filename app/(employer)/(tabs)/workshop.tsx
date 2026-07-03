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
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { workshopService } from '../../../services/workshopService';
import { Workshop } from '../../../types/workshop';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  published: 'Yayında',
  cancelled: 'İptal Edildi',
  completed: 'Tamamlandı',
};

const STATUS_COLORS: Record<string, string> = {
  draft: Colors.amber,
  published: Colors.primary,
  cancelled: Colors.error,
  completed: Colors.secondary,
};

export default function MyWorkshopsScreen() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status?: string }>();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadWorkshops = useCallback(async () => {
    try {
      const data = await workshopService.getMyWorkshops(status);
      setWorkshops(data);
    } catch (error) {
      console.log('Atölyeler yüklenemedi', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [status]);

  useFocusEffect(
    useCallback(() => {
      loadWorkshops();
    }, [loadWorkshops])
  );

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
      const message = error?.response?.data?.message || 'Yayınlama başarısız.';
      Alert.alert('Hata', message);
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
      const message = error?.response?.data?.message || 'İşlem başarısız.';
      Alert.alert('Hata', message);
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
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Atölyelerim</Text>
        <TouchableOpacity
          onPress={() => router.push('/(employer)/workshop/create')}
          style={styles.addButton}
        >
          <MaterialIcons name="add" size={22} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {workshops.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-note" size={40} color={Colors.outline} />
          <Text style={styles.emptyTitle}>Henüz atölyen yok</Text>
          <Text style={styles.emptyText}>İlk atölyeni oluşturarak başla</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {workshops.map((workshop) => (
            <TouchableOpacity
              key={workshop.id}
              style={styles.card}
              onPress={() => router.push(`/(employer)/workshop/${workshop.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {workshop.title}
                  </Text>
                  <Text style={styles.cardPrice}>{workshop.price} ₺</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[workshop.status] + '1A' },
                  ]}
                >
                  <View
                    style={[styles.statusDot, { backgroundColor: STATUS_COLORS[workshop.status] }]}
                  />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[workshop.status] }]}>
                    {STATUS_LABELS[workshop.status] || workshop.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="groups" size={14} color={Colors.outline} />
                  <Text style={styles.metaText}>
                    {workshop.enrolledCount}/{workshop.capacity} kişi
                  </Text>
                </View>
                {workshop.avgRating > 0 && (
                  <View style={styles.metaItem}>
                    <MaterialIcons name="star" size={14} color={Colors.amber} />
                    <Text style={styles.metaText}>{workshop.avgRating.toFixed(1)}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardActions}>
                {workshop.status === 'draft' && (
                  <TouchableOpacity
                    style={styles.publishButton}
                    onPress={() => handlePublish(workshop)}
                    disabled={updatingId === workshop.id}
                  >
                    {updatingId === workshop.id ? (
                      <ActivityIndicator size="small" color={Colors.onPrimary} />
                    ) : (
                      <>
                        <MaterialIcons name="publish" size={16} color={Colors.onPrimary} />
                        <Text style={styles.publishButtonText}>Yayınla</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {workshop.status === 'published' && (
                  <TouchableOpacity
                    style={styles.unpublishButton}
                    onPress={() => handleUnpublish(workshop)}
                    disabled={updatingId === workshop.id}
                  >
                    {updatingId === workshop.id ? (
                      <ActivityIndicator size="small" color={Colors.onSurfaceVariant} />
                    ) : (
                      <Text style={styles.unpublishButtonText}>Taslağa Al</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>    </SafeAreaView>  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.onSurface,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.onSurface,
    marginTop: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  list: {
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleWrap: { flex: 1, marginRight: Spacing.sm },
  cardTitle: {
    ...Typography.labelMd,
    fontSize: 15,
    color: Colors.onSurface,
  },
  cardPrice: {
    ...Typography.bodyMd,
    color: Colors.primary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.labelSm,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  publishButtonText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
  },
  unpublishButton: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  unpublishButtonText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
});