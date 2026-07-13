import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { workshopService } from '../../../services/workshopService';
import { categoryService } from '../../../services/categoryService';
import { Workshop, WorkshopSearchResult } from '../../../types/workshop';
import { Category } from '../../../types/category';

type LocationFilter = 'all' | 'online' | 'in-person';

const EMPTY_RESULT: WorkshopSearchResult = { workshops: [], page: 1, pageSize: 10, total: 0, totalPages: 0, hasNextPage: false };

export default function EmployeeSearchTabScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [searchResult, setSearchResult] = useState<WorkshopSearchResult>(EMPTY_RESULT);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch((error) => console.log('Kategoriler yüklenemedi', error));
  }, []);

  async function executeSearch(page = 1, append = false) {
    setLoading(true);
    try {
      const filters = {
        q: q.trim() || undefined,
        city: city.trim() || undefined,
        categoryId,
        locationType: locationFilter === 'all' ? undefined : locationFilter,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page,
        pageSize: 10,
      };

      const result = await workshopService.search(filters);
      setSearchResult(result);
      setWorkshops((prev) => (append ? [...prev, ...result.workshops] : result.workshops));
      setSearched(true);
    } catch (error) {
      console.log('Atölye arama hatası', error);
    } finally {
      setLoading(false);
    }
  }

  const canLoadMore = !loading && searchResult.hasNextPage;

  return (
    <ScreenContainer edges={['top', 'bottom']} header={<Text style={styles.title}>Atölye Bul</Text>} scroll={false}>
      <View style={styles.content}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Ara</Text>
          <TextInput
            style={styles.input}
            placeholder="Atölye adı, konu..."
            placeholderTextColor={Colors.outlineVariant}
            value={q}
            onChangeText={setQ}
          />
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Şehir</Text>
          <TextInput
            style={styles.input}
            placeholder="İstanbul"
            placeholderTextColor={Colors.outlineVariant}
            value={city}
            onChangeText={setCity}
          />
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Fiyat Aralığı</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="number-pad"
              placeholder="Min"
              placeholderTextColor={Colors.outlineVariant}
            />
            <Text style={styles.priceSeparator}>–</Text>
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="number-pad"
              placeholder="Max"
              placeholderTextColor={Colors.outlineVariant}
            />
          </View>
        </View>

        <View style={styles.segmentRow}>
          {(['all', 'online', 'in-person'] as LocationFilter[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.segmentItem, locationFilter === option && styles.segmentItemActive]}
              onPress={() => setLocationFilter(option)}
              activeOpacity={0.85}
            >
              <Text style={[styles.segmentText, locationFilter === option && styles.segmentTextActive]}>
                {option === 'all' ? 'Tümü' : option === 'online' ? 'Online' : 'Yüz Yüze'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {categories.length > 0 && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Kategoriler</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <TouchableOpacity
                style={[styles.chip, categoryId === undefined && styles.chipActive]}
                onPress={() => setCategoryId(undefined)}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, categoryId === undefined && styles.chipTextActive]}>
                  Tüm Kategoriler
                </Text>
              </TouchableOpacity>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.chip, categoryId === category.id && styles.chipActive]}
                  onPress={() => setCategoryId(category.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.chipText, categoryId === category.id && styles.chipTextActive]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.searchSection}>
          <TouchableOpacity style={styles.searchButton} onPress={() => executeSearch(1, false)} activeOpacity={0.85}>
            <MaterialIcons name="search" size={20} color={Colors.onPrimary} />
            <Text style={styles.searchButtonText}>Ara</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator style={{ marginTop: Spacing.md }} size="large" color={Colors.primary} /> : null}

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {searched && !loading && workshops.length > 0 ? (
            <Text style={styles.resultInfo}>
              {searchResult.total} sonuç bulundu · Sayfa {searchResult.page}
            </Text>
          ) : null}

          {workshops.map((workshop) => {
            const isFull = workshop.enrolledCount >= workshop.capacity;
            const startDate = new Date(workshop.startAt);
            const formattedDate = startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

            return (
              <TouchableOpacity
                key={workshop.id}
                style={styles.card}
                onPress={() => router.push(`/(employee)/workshop/${workshop.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={styles.imagePlaceholder}>
                  <MaterialIcons name="event" size={24} color={Colors.primary} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{workshop.title}</Text>
                  <Text style={styles.cardMeta}>{workshop.employerName} · {formattedDate}</Text>
                  <Text style={styles.cardText}>{workshop.price} ₺</Text>
                </View>
                {isFull ? (
                  <View style={styles.fullBadge}>
                    <Text style={styles.fullBadgeText}>Dolu</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}

          {!loading && !searched ? <Text style={styles.emptyText}>Arama yapmak için filtreleri girip "Ara"ya dokunun.</Text> : null}
          {!loading && searched && workshops.length === 0 ? <Text style={styles.emptyText}>Sonuç bulunamadı.</Text> : null}

          {canLoadMore ? (
            <TouchableOpacity style={styles.loadMoreButton} onPress={() => executeSearch(searchResult.page + 1, true)} activeOpacity={0.85}>
              <Text style={styles.loadMoreText}>Daha fazla yükle</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...Typography.h3, color: Colors.onSurface },
  content: { flex: 1, padding: Spacing.md, gap: Spacing.sm },

  filterGroup: { gap: Spacing.xs },
  filterLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  input: {
    backgroundColor: Colors.surfaceBright,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
  },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  priceInput: { flex: 1 },
  priceSeparator: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },

  segmentRow: { flexDirection: 'row', gap: Spacing.xs },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.surfaceVariant, backgroundColor: Colors.surfaceBright },
  segmentItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  segmentText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  segmentTextActive: { color: Colors.onPrimary },

  // Yatay kaydırmalı kategori chip satırı — sabit height + alignSelf:'flex-start'
  // sayesinde Yoga'nın ilk elemanı gerip satırı bozması engellenir.
  chipRow: {
    alignItems: 'center',
    paddingRight: Spacing.md,
    gap: Spacing.xs,
  },
  chip: {
    alignSelf: 'flex-start',
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceBright,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.onPrimary },

  searchSection: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
  },
  searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: Spacing.sm },
  searchButtonText: { ...Typography.labelMd, color: Colors.onPrimary },

  list: { flex: 1 },
  listContent: { gap: Spacing.md, paddingBottom: Spacing.lg },
  resultInfo: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, padding: Spacing.md, ...Shadows.sm },
  imagePlaceholder: { width: 56, height: 56, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { ...Typography.labelMd, color: Colors.onSurface },
  cardMeta: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  cardText: { ...Typography.bodyMd, color: Colors.primary },
  fullBadge: { backgroundColor: Colors.errorContainer, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  fullBadgeText: { ...Typography.labelSm, color: Colors.error },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.md },
  loadMoreButton: { alignSelf: 'center', backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceVariant },
  loadMoreText: { ...Typography.labelMd, color: Colors.primary },
});