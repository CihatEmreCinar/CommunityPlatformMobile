import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { KeyboardAwareScreen } from '../../../components/layout/KeyboardAwareScreen';
import { CollapsibleFilterPanel } from '../../../components/layout/CollapsibleFilterPanel';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { spaceListingService, type SpaceListing, type SpaceListingSearchResult } from '../../../services/spaceListingService';

export default function EmployerSearchTabScreen() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [listings, setListings] = useState<SpaceListing[]>([]);
  const [searchResult, setSearchResult] = useState<SpaceListingSearchResult>({ listings: [], page: 1, pageSize: 10, total: 0, hasNextPage: false });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function executeSearch(page = 1, append = false) {
    setLoading(true);
    try {
      const filters = {
        city: city.trim() || undefined,
        minCapacity: minCapacity ? Number(minCapacity) : undefined,
        maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page,
        pageSize: 10,
      };

      const result = await spaceListingService.search(filters);
      setSearchResult(result);
      setListings((prev) => (append ? [...prev, ...result.listings] : result.listings));
      setSearched(true);
    } catch (error) {
      console.log('Mekan arama hatası', error);
    } finally {
      setLoading(false);
    }
  }

  const canLoadMore = !loading && searchResult.hasNextPage;

  const filterSummaryParts = [
    city.trim(),
    minCapacity || maxCapacity ? `${minCapacity || '0'}-${maxCapacity || '∞'} kişi` : '',
    minPrice || maxPrice ? `${minPrice || '0'}-${maxPrice || '∞'} ₺/saat` : '',
  ].filter(Boolean);
  const filterSummary = filterSummaryParts.length > 0 ? filterSummaryParts.join(' · ') : 'Tüm mekanlar';

  return (
    <ScreenContainer edges={['top', 'bottom']} header={<Text style={styles.title}>Mekan Bul</Text>} scroll={false}>
      <KeyboardAwareScreen contentContainerStyle={styles.content}>
        <CollapsibleFilterPanel title="Filtreler" summary={filterSummary} defaultOpen>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Şehir</Text>
            <TextInput
              style={styles.input}
              placeholder="İstanbul"
              placeholderTextColor={Colors.outlineVariant}
              value={city}
              onChangeText={setCity}
              returnKeyType="search"
              onSubmitEditing={() => executeSearch(1, false)}
            />
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Kapasite Aralığı</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={minCapacity}
                onChangeText={setMinCapacity}
                keyboardType="number-pad"
                placeholder="Min"
                placeholderTextColor={Colors.outlineVariant}
              />
              <Text style={styles.rangeSeparator}>–</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={maxCapacity}
                onChangeText={setMaxCapacity}
                keyboardType="number-pad"
                placeholder="Max"
                placeholderTextColor={Colors.outlineVariant}
              />
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Fiyat Aralığı (₺/saat)</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="number-pad"
                placeholder="Min"
                placeholderTextColor={Colors.outlineVariant}
              />
              <Text style={styles.rangeSeparator}>–</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="number-pad"
                placeholder="Max"
                placeholderTextColor={Colors.outlineVariant}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={() => executeSearch(1, false)} activeOpacity={0.85}>
            <MaterialIcons name="search" size={20} color={Colors.onPrimary} />
            <Text style={styles.searchButtonText}>Ara</Text>
          </TouchableOpacity>
        </CollapsibleFilterPanel>

        {loading ? <ActivityIndicator style={{ marginTop: Spacing.md }} size="large" color={Colors.primary} /> : null}

        {searched && !loading && listings.length > 0 ? (
          <Text style={styles.resultInfo}>
            {searchResult.total} sonuç bulundu · Sayfa {searchResult.page}
          </Text>
        ) : null}

        <View style={styles.list}>
          {listings.map((listing) => (
            <TouchableOpacity key={listing.id} style={styles.card} onPress={() => router.push(`/(employer)/space/${listing.id}` as any)} activeOpacity={0.85}>
              <View style={styles.imagePlaceholder}><MaterialIcons name="place" size={24} color={Colors.primary} /></View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{listing.title}</Text>
                <Text style={styles.cardMeta}>{listing.city || 'Şehir belirtilmedi'} · {listing.hourlyPrice} ₺/saat</Text>
                <Text style={styles.cardText}>{listing.capacity} kişi kapasite</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {!loading && !searched ? <Text style={styles.emptyText}>Arama yapmak için filtreleri girip "Ara"ya dokunun.</Text> : null}
        {!loading && searched && listings.length === 0 ? <Text style={styles.emptyText}>Sonuç bulunamadı.</Text> : null}

        {canLoadMore ? (
          <TouchableOpacity style={styles.loadMoreButton} onPress={() => executeSearch(searchResult.page + 1, true)} activeOpacity={0.85}>
            <Text style={styles.loadMoreText}>Daha fazla yükle</Text>
          </TouchableOpacity>
        ) : null}
      </KeyboardAwareScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...Typography.h3, color: Colors.onSurface },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.md },

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

  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rangeInput: { flex: 1 },
  rangeSeparator: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },

  searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: Spacing.sm, marginTop: Spacing.xs },
  searchButtonText: { ...Typography.labelMd, color: Colors.onPrimary },

  list: { gap: Spacing.md },
  resultInfo: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, padding: Spacing.md, ...Shadows.sm },
  imagePlaceholder: { width: 56, height: 56, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { ...Typography.labelMd, color: Colors.onSurface },
  cardMeta: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  cardText: { ...Typography.bodyMd, color: Colors.primary },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.md },
  loadMoreButton: { alignSelf: 'center', backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceVariant, marginTop: Spacing.sm },
  loadMoreText: { ...Typography.labelMd, color: Colors.primary },
});