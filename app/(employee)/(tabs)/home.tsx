import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Icon } from '../../../components/ui/Icon';
import { AtiInsightCard } from '../../../components/home/AtiInsightCard';
import { BentoCard } from '../../../components/home/BentoCard';
import { CityPulseFeed } from '../../../components/home/CityPulseFeed';
import { GamificationCard } from '../../../components/home/GamificationCard';
import { BrandHeader } from '../../../components/dashboard/BrandHeader';
import { DashboardTicker } from '../../../components/dashboard/DashboardTicker';
import { DashboardHero } from '../../../components/dashboard/DashboardHero';
import { useAuth } from '../../../contexts/AuthContext';
import { workshopService } from '../../../services/workshopService';
import { Workshop } from '../../../types/workshop';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { useCurrentLocation } from '../../../hooks/useCurrentLocation';
import { formatCityDistrict } from '../../../utils/locationFormat';
import {
  buildCityPulseItems,
  buildTickerItems,
  calculateLevelInfo,
  pickNearestWorkshop,
  pickTrendingWorkshop,
} from '../../../utils/dailyBrief';

export default function EmployeeHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [recommended, setRecommended] = useState<Workshop[]>([]);
  const [allWorkshops, setAllWorkshops] = useState<Workshop[]>([]);
  const [nearby, setNearby] = useState<Workshop[]>([]);
  const [nearbyUsingGps, setNearbyUsingGps] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { getCurrentLocation, loading: locatingForNearby } = useCurrentLocation();

  // Daily Brief bölümlerinde "Önerileri Gör" butonu ile Recommended
  // bölümüne kaydırmak için kullanılıyor.
  const scrollRef = useRef<ScrollView>(null);
  const recommendedOffsetY = useRef(0);

  const loadNearby = useCallback(async (coords?: { latitude: number; longitude: number } | null) => {
    try {
      const data = await workshopService.getNearby(
        coords ? { latitude: coords.latitude, longitude: coords.longitude, limit: 10 } : { limit: 10 }
      );
      setNearby(data);
    } catch (error) {
      console.log('Yakındaki atölyeler yüklenemedi', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [recommendedData, allData] = await Promise.all([
        workshopService.getRecommended(),
        workshopService.getAll({ status: 'published', limit: 20 }),
      ]);
      setRecommended(recommendedData.slice(0, 5));
      setAllWorkshops(allData);

      // Konum izni daha önce verilmişse sessizce GPS koordinatını kullan;
      // verilmemişse burada izin İSTENMEZ — backend'in tercih edilen bölge →
      // aynı şehir → popüler → son eklenenler fallback zinciri devreye girer.
      // İzin isteme, "Konumuma Göre Sırala" butonuna basılınca tetiklenir.
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setNearbyUsingGps(true);
        await loadNearby({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      } else {
        await loadNearby(null);
      }
    } catch (error) {
      console.log('Atölyeler yüklenemedi', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [loadNearby]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function onRefresh() {
    setIsRefreshing(true);
    loadData();
  }

  async function handleUseGpsForNearby() {
    const coords = await getCurrentLocation();
    if (!coords) {
      Alert.alert('Konum alınamadı', 'Konum izni verilmedi veya cihaz konumu okunamadı.');
      return;
    }
    setNearbyUsingGps(true);
    await loadNearby(coords);
  }

  function scrollToRecommended() {
    scrollRef.current?.scrollTo({ y: recommendedOffsetY.current, animated: true });
  }

  // --- Daily Brief türetilmiş veriler ---
  // Not: Hepsi zaten yüklenmiş olan recommended/allWorkshops/nearby'den
  // hesaplanıyor, yeni bir servis çağrısı gerekmiyor. Ayrıntılar için
  // utils/dailyBrief.ts ve README_PATCH.md.
  const tickerItems = useMemo(
    () =>
      buildTickerItems({
        nearbyCount: nearby.length,
        recommendedCount: recommended.length,
        allWorkshops,
      }),
    [nearby.length, recommended.length, allWorkshops]
  );

  const pulseItems = useMemo(() => buildCityPulseItems(allWorkshops), [allWorkshops]);
  const urgentPulseCount = useMemo(
    () => pulseItems.filter((item) => item.variant === 'urgent').length,
    [pulseItems]
  );

  const nearestWorkshop = useMemo(() => pickNearestWorkshop(nearby), [nearby]);
  const trendingWorkshop = useMemo(
    () => pickTrendingWorkshop(allWorkshops, nearestWorkshop?.id),
    [allWorkshops, nearestWorkshop?.id]
  );

  const levelInfo = useMemo(() => calculateLevelInfo(user?.xpPoints ?? 0), [user?.xpPoints]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      {/* Status bar/kamera çentiği altında kalan marka başlığı, ticker'ın üzerinde */}
      <BrandHeader />
      <DashboardTicker messages={tickerItems} />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Hero: ATI maskotu + kişiselleştirilmiş karşılama + keşif çipleri */}
        <DashboardHero
          firstName={user?.firstName}
          chips={[
            { icon: 'star', label: `${recommended.length} Yeni Keşif` },
            { icon: 'bolt', label: `${urgentPulseCount} Popüler Etkinlik` },
          ]}
        />

        {/* Oyunlaştırma — mevcut XP kartının ilerleme çubuklu hali */}
        <GamificationCard
          levelLabel={levelInfo.levelLabel}
          xp={user?.xpPoints ?? 0}
          progressPercent={levelInfo.progressPercent}
          // streakDays / nextBadgeGoal: backend'de henüz karşılığı yok.
          // Eklendiğinde buraya bağlanacak (README_PATCH.md, Faz 4).
        />

        {/* ATI Öneri Kartı */}
        {recommended.length > 0 && (
          <AtiInsightCard
            message={`Bu hafta senin için ${recommended.length} atölye önerisi buldum.`}
            onViewRecommendations={scrollToRecommended}
            onDismiss={() => {
              // TODO: kart kapatma tercihini kalıcı yapmak istersen local state / kullanıcı tercihi ekle.
            }}
          />
        )}

        {/* Bento Grid: Yakınımdakiler + Trend */}
        {(nearestWorkshop || trendingWorkshop) && (
          <View style={styles.bentoGrid}>
            {nearestWorkshop && (
              <BentoCard
                icon="place"
                tagLabel="Yakında"
                title={nearestWorkshop.title}
                description={
                  nearestWorkshop.distanceKm != null
                    ? `${nearestWorkshop.distanceKm.toFixed(1)} km uzaklıkta`
                    : formatCityDistrict(nearestWorkshop.city, nearestWorkshop.district) || 'Yakınında'
                }
                footerLabel={`${nearestWorkshop.price} ₺`}
                footerActionLabel="Detay"
                onPress={() => router.push(`/(employee)/workshop/${nearestWorkshop.id}` as any)}
              />
            )}
            {trendingWorkshop && (
              <BentoCard
                icon="bolt"
                tagLabel="Trend"
                title={trendingWorkshop.title}
                description={
                  trendingWorkshop.capacity - trendingWorkshop.enrolledCount > 0
                    ? `${trendingWorkshop.capacity - trendingWorkshop.enrolledCount} yer kaldı`
                    : 'Dolu'
                }
                footerLabel={new Date(trendingWorkshop.startAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                })}
                footerActionLabel="Katıl"
                onPress={() => router.push(`/(employee)/workshop/${trendingWorkshop.id}` as any)}
              />
            )}
          </View>
        )}

        {/* Recommended Section */}
        {recommended.length > 0 && (
          <View onLayout={(e) => (recommendedOffsetY.current = e.nativeEvent.layout.y)}>
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
          </View>
        )}

        {/* Nearby Section */}
        {nearby.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Yakınımdakiler</Text>
              <TouchableOpacity
                style={styles.gpsButton}
                onPress={handleUseGpsForNearby}
                disabled={locatingForNearby}
                activeOpacity={0.7}
              >
                {locatingForNearby ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Icon name="myLocation" size={14} color={Colors.primary} />
                )}
                <Text style={styles.gpsButtonText}>
                  {nearbyUsingGps ? 'Konumu Güncelle' : 'Konumuma Göre Sırala'}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {nearby.map((workshop) => (
                <NearbyCard
                  key={workshop.id}
                  workshop={workshop}
                  onPress={() => router.push(`/(employee)/workshop/${workshop.id}` as any)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Şehrin Nabzı */}
        {pulseItems.length > 0 && (
          <CityPulseFeed
            items={pulseItems}
            onItemPress={(workshopId) => router.push(`/(employee)/workshop/${workshopId}` as any)}
          />
        )}

        {/* All Workshops Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tüm Atölyeler</Text>
        </View>
        <View style={styles.workshopList}>
          {allWorkshops.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="searchOff" size={32} color={Colors.outline} />
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
    </View>
  );
}

function NearbyCard({ workshop, onPress }: { workshop: Workshop; onPress: () => void }) {
  const locationLabel =
    workshop.locationType === 'online'
      ? 'Online'
      : formatCityDistrict(workshop.city, workshop.district) || workshop.venueName || workshop.address || workshop.locationDetail;

  return (
    <TouchableOpacity style={styles.recCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.recImagePlaceholder}>
        <Icon name={workshop.locationType === 'online' ? 'videocam' : 'place'} size={28} color={Colors.primary} />
      </View>
      <Text style={styles.recTitle} numberOfLines={2}>
        {workshop.title}
      </Text>
      {locationLabel ? (
        <View style={styles.nearbyLocationRow}>
          <Icon name="locationOn" size={11} color={Colors.onSurfaceVariant} />
          <Text style={styles.nearbyLocationText} numberOfLines={1}>{locationLabel}</Text>
        </View>
      ) : null}
      <View style={styles.recFooter}>
        <Text style={styles.recPrice}>{workshop.price} ₺</Text>
        {workshop.distanceKm != null ? (
          <View style={styles.recRating}>
            <Icon name="directionsWalk" size={12} color={Colors.onSurfaceVariant} />
            <Text style={styles.recRatingText}>{workshop.distanceKm.toFixed(1)} km</Text>
          </View>
        ) : (
          workshop.avgRating > 0 && (
            <View style={styles.recRating}>
              <Icon name="star" size={12} color={Colors.amber} />
              <Text style={styles.recRatingText}>{workshop.avgRating.toFixed(1)}</Text>
            </View>
          )
        )}
      </View>
    </TouchableOpacity>
  );
}

function RecommendedCard({ workshop, onPress }: { workshop: Workshop; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.recCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.recImagePlaceholder}>
        <Icon name="palette" size={28} color={Colors.primary} />
      </View>
      <Text style={styles.recTitle} numberOfLines={2}>
        {workshop.title}
      </Text>
      <View style={styles.recFooter}>
        <Text style={styles.recPrice}>{workshop.price} ₺</Text>
        {workshop.avgRating > 0 && (
          <View style={styles.recRating}>
            <Icon name="star" size={12} color={Colors.amber} />
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
  const locationLabel =
    workshop.locationType === 'online'
      ? 'Online'
      : workshop.venueName || workshop.address || workshop.locationDetail || formatCityDistrict(workshop.city, workshop.district) || '—';

  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.listImagePlaceholder}>
        <Icon name="event" size={22} color={Colors.primary} />
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
            <Icon name="calendarToday" size={12} color={Colors.outline} />
            <Text style={styles.listMetaText}>{formattedDate}</Text>
          </View>
          <View style={styles.listMetaItem}>
            <Icon
              name={workshop.locationType === 'online' ? 'videocam' : 'place'}
              size={12}
              color={Colors.outline}
            />
            <Text style={styles.listMetaText} numberOfLines={1}>
              {locationLabel}
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
  scrollArea: { flex: 1 },
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
    gap: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
  },
  gpsButtonText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '600',
  },
  nearbyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  nearbyLocationText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    flexShrink: 1,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.onSurface,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  horizontalList: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
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