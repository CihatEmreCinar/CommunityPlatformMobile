import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import { spaceListingService, type SpaceListing } from '../../services/spaceListingService';

export default function EmployerSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [listings, setListings] = useState<SpaceListing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setListings([]);
        return;
      }
      (async () => {
        setLoading(true);
        try {
          const result = await spaceListingService.search({ city: query.trim() });
          setListings(result.listings);
        } catch (error) {
          console.log('Mekan arama hatası', error);
        } finally {
          setLoading(false);
        }
      })();
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <ScreenContainer edges={['top', 'bottom']} header={<Text style={styles.title}>Mekan Bul</Text>}>
      <View style={styles.content}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={Colors.outline} />
          <TextInput style={styles.input} placeholder="Şehir ara" value={query} onChangeText={setQuery} placeholderTextColor={Colors.outlineVariant} />
        </View>
        {loading ? <ActivityIndicator style={{ marginTop: Spacing.md }} size="large" color={Colors.primary} /> : null}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
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
          {!loading && !query.trim() ? <Text style={styles.emptyText}>Bir şehir adı yazın.</Text> : null}
          {!loading && query.trim() && listings.length === 0 ? <Text style={styles.emptyText}>Sonuç bulunamadı.</Text> : null}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...Typography.h3, color: Colors.onSurface },
  content: { flex: 1, padding: Spacing.md, gap: Spacing.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceBright, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceVariant },
  input: { flex: 1, color: Colors.onSurface },
  list: { flex: 1 },
  listContent: { gap: Spacing.md, paddingBottom: Spacing.lg },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, padding: Spacing.md, ...Shadows.sm },
  imagePlaceholder: { width: 56, height: 56, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { ...Typography.labelMd, color: Colors.onSurface },
  cardMeta: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  cardText: { ...Typography.bodyMd, color: Colors.primary },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.md },
});
