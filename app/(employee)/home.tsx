import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { workshopService } from '../../services/workshopService';
import { Workshop } from '../../types/workshop';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';

export default function EmployeeHomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [recommended, setRecommended] = useState<Workshop[]>([]);
  const [allWorkshops, setAllWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [recommendedData, allData] = await Promise.all([
        workshopService.getRecommended(),
        workshopService.getAll({ status: 'published', limit: 20 }),
      ]);
      setRecommended(recommendedData.slice(0, 5));
      setAllWorkshops(allData);
    } catch (error) {
      console.log('Atölyeler yüklenemedi', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function onRefresh() {
    setIsRefreshing(true);
    loadData();
  }

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user?.firstName}</Text>
          <Text style={styles.subGreeting}>Bugün ne keşfetmek istersin?</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* XP Card */}
      <View style={styles.xpCard}>
        <View style={styles.xpIconWrap}>
          <MaterialIcons name="bolt" size={24} color={Colors.onPrimary} />
        </View>
        <View style={styles.xpInfo}>
          <Text style={styles.xpCardLabel}>Toplam Deneyim Puanın</Text>
          <Text style={styles.xpCardValue}>{user?.xpPoints ?? 0} XP</Text>
        </View>
      </View>

      {/* Recommended Section */}
      {recommended.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Senin İçin Önerilenler</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {recommended.map((workshop) => (
              <RecommendedCard
                key={workshop.id}
                workshop={workshop}
                onPress={() => router.push(`/(employee)/workshop/${workshop.id}` as any)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* All Workshops Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tüm Atölyeler</Text>
      </View>
      <View style={styles.workshopList}>
        {allWorkshops.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={32} color={Colors.outline} />
            <Text style={styles.emptyText}>Henüz atölye bulunamadı</Text>
          </View>
        ) : (
          allWorkshops.map((workshop) => (
            <WorkshopListItem
              key={workshop.id}
              workshop={workshop}
              onPress={() => router.push(`/(employee)/workshop/${workshop.id}` as any)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function RecommendedCard({ workshop, onPress }: { workshop: Workshop; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.recCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.recImagePlaceholder}>
        <MaterialIcons name="palette" size={28} color={Colors.primary} />
      </View>
      <Text style={styles.recTitle} numberOfLines={2}>
        {workshop.title}
      </Text>
      <View style={styles.recFooter}>
        <Text style={styles.recPrice}>{workshop.price} ₺</Text>
        {workshop.avgRating > 0 && (
          <View style={styles.recRating}>
            <MaterialIcons name="star" size={12} color={Colors.amber} />
            <Text style={styles.recRatingText}>{workshop.avgRating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function WorkshopListItem({ workshop, onPress }: { workshop: Workshop; onPress: () => void }) {
  const isFull = workshop.enrolledCount >= workshop.capacity;
  const startDate = new Date(workshop.startAt);
  const formattedDate = startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.listImagePlaceholder}>
        <MaterialIcons name="event" size={22} color={Colors.primary} />
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {workshop.title}
        </Text>
        <Text style={styles.listEmployer} numberOfLines={1}>
          {workshop.employerName}
        </Text>
        <View style={styles.listMetaRow}>
          <View style={styles.listMetaItem}>
            <MaterialIcons name="calendar-today" size={12} color={Colors.outline} />
            <Text style={styles.listMetaText}>{formattedDate}</Text>
          </View>
          <View style={styles.listMetaItem}>
            <MaterialIcons
              name={workshop.locationType === 'online' ? 'videocam' : 'place'}
              size={12}
              color={Colors.outline}
            />
            <Text style={styles.listMetaText}>
              {workshop.locationType === 'online' ? 'Online' : workshop.locationDetail}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.listRight}>
        <Text style={styles.listPrice}>{workshop.price} ₺</Text>
        {isFull ? (
          <View style={styles.fullBadge}>
            <Text style={styles.fullBadgeText}>Dolu</Text>
          </View>
        ) : (
          <Text style={styles.listSpots}>
            {workshop.capacity - workshop.enrolledCount} yer kaldı
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greeting: {
    ...Typography.h1Mobile,
    color: Colors.onSurface,
  },
  subGreeting: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  logoutButton: {
    padding: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    ...Shadows.sm,
  },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  xpIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpInfo: { flex: 1 },
  xpCardLabel: {
    ...Typography.labelSm,
    color: 'rgba(255,255,255,0.85)',
  },
  xpCardValue: {
    ...Typography.h2,
    color: Colors.onPrimary,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.onSurface,
  },
  horizontalList: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingRight: Spacing.sm,
  },
  recCard: {
    width: 160,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
    ...Shadows.sm,
  },
  recImagePlaceholder: {
    width: '100%',
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  recTitle: {
    ...Typography.labelMd,
    color: Colors.onSurface,
    minHeight: 32,
  },
  recFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  recPrice: {
    ...Typography.bodyMd,
    color: Colors.primary,
    fontWeight: '700',
  },
  recRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  recRatingText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  workshopList: {
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'center',
    ...Shadows.sm,
  },
  listImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: { flex: 1, gap: 2 },
  listTitle: {
    ...Typography.labelMd,
    fontSize: 14,
    color: Colors.onSurface,
  },
  listEmployer: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  listMetaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 2,
  },
  listMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  listMetaText: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  listRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  listPrice: {
    ...Typography.labelMd,
    fontSize: 14,
    color: Colors.primary,
  },
  listSpots: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  fullBadge: {
    backgroundColor: Colors.errorContainer,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  fullBadgeText: {
    ...Typography.labelSm,
    color: Colors.onErrorContainer,
  },
});