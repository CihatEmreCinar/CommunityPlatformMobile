import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { employerService, EmployerPublicProfile } from '../../../services/employerService';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';

export default function EmployerPublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<EmployerPublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    try {
      const data = await employerService.getPublicProfile(id);
      setProfile(data);
    } catch (error) {
      console.log('Profil yüklenemedi', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!profile) return null;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        {profile.profileImageUrl ? (
          <Image source={{ uri: profile.profileImageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons name="business" size={36} color={Colors.primary} />
          </View>
        )}
        <Text style={styles.name}>
          {profile.firstName} {profile.lastName}
        </Text>
        <Text style={styles.title}>{profile.workshopTitle}</Text>
        <View style={styles.rankPill}>
          <MaterialIcons name="workspace-premium" size={14} color={Colors.onPrimary} />
          <Text style={styles.rankPillText}>{profile.employerRank}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.totalWorkshops}</Text>
          <Text style={styles.statLabel}>Atölye</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile.avgRating ? profile.avgRating.toFixed(1) : '—'}
          </Text>
          <Text style={styles.statLabel}>Puan</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.yearsExperience ?? '—'}</Text>
          <Text style={styles.statLabel}>Yıl Tecrübe</Text>
        </View>
      </View>

      {/* Bio */}
      {profile.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hakkında</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      )}

      {/* Specialization */}
      {profile.specialization.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uzmanlık Alanları</Text>
          <View style={styles.tagsRow}>
            {profile.specialization.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Categories */}
      {profile.categoryNames.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <View style={styles.tagsRow}>
            {profile.categoryNames.map((name) => (
              <View key={name} style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Workshops */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktif Atölyeleri</Text>
        {profile.workshops.length === 0 ? (
          <Text style={styles.emptyText}>Şu anda yayında atölyesi yok</Text>
        ) : (
          <View style={styles.workshopList}>
            {profile.workshops.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={styles.workshopItem}
                onPress={() => router.push(`/(employee)/workshop/${w.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={styles.workshopIconWrap}>
                  <MaterialIcons name="event" size={18} color={Colors.primary} />
                </View>
                <View style={styles.workshopInfo}>
                  <Text style={styles.workshopTitle} numberOfLines={1}>
                    {w.title}
                  </Text>
                  <Text style={styles.workshopPrice}>{w.price} ₺</Text>
                </View>
                {w.avgRating > 0 && (
                  <View style={styles.workshopRating}>
                    <MaterialIcons name="star" size={14} color={Colors.amber} />
                    <Text style={styles.workshopRatingText}>{w.avgRating.toFixed(1)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
    marginBottom: Spacing.md,
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...Typography.h2,
    color: Colors.onSurface,
    marginTop: Spacing.sm,
  },
  title: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  rankPillText: {
    ...Typography.labelSm,
    color: Colors.onPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.surfaceVariant },
  statValue: { ...Typography.h2, color: Colors.onSurface },
  statLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 2 },
  section: { marginBottom: Spacing.lg, gap: Spacing.sm },
  sectionTitle: { ...Typography.h3, color: Colors.onSurface },
  bioText: { ...Typography.bodyLg, color: Colors.onSurfaceVariant, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tagText: { ...Typography.labelSm, color: Colors.onPrimaryContainer },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  workshopList: { gap: Spacing.sm },
  workshopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  workshopIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workshopInfo: { flex: 1 },
  workshopTitle: { ...Typography.labelMd, fontSize: 14, color: Colors.onSurface },
  workshopPrice: { ...Typography.bodyMd, fontSize: 12, color: Colors.primary, marginTop: 2 },
  workshopRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  workshopRatingText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  categoryTag: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  categoryTagText: {
    ...Typography.labelSm,
    color: Colors.onSecondaryContainer,
  },
});