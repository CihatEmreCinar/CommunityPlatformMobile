import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { workshopService } from '../../../services/workshopService';
import { enrollmentService } from '../../../services/enrollmentService';
import { Workshop } from '../../../types/workshop';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';

export default function WorkshopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    loadWorkshop();
  }, [id]);

  async function loadWorkshop() {
    try {
      const data = await workshopService.getById(id);
      setWorkshop(data);
    } catch (error) {
      Alert.alert('Hata', 'Atölye bulunamadı.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEnroll() {
    if (!workshop) return;

    setIsEnrolling(true);
    try {
      await enrollmentService.create({ workshopId: workshop.id });
      Alert.alert('Başarılı', 'Atölyeye kaydoldun!', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Kayıt işlemi başarısız oldu.';
      Alert.alert('Hata', message);
    } finally {
      setIsEnrolling(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!workshop) return null;

  const isFull = workshop.enrolledCount >= workshop.capacity;
  const startDate = new Date(workshop.startAt);
  const endDate = new Date(workshop.endAt);
  const formattedDate = startDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = `${startDate.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${endDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with back button */}
        <View style={styles.headerImage}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerIconWrap}>
            <MaterialIcons name="palette" size={48} color={Colors.primary} />
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Employer */}
          <Text style={styles.title}>{workshop.title}</Text>
          <View style={styles.employerRow}>
            <MaterialIcons name="person" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.employerName}>{workshop.employerName}</Text>
          </View>

          {/* Rating */}
          {workshop.avgRating > 0 && (
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={16} color={Colors.amber} />
              <Text style={styles.ratingText}>
                {workshop.avgRating.toFixed(1)} ({workshop.reviewCount} değerlendirme)
              </Text>
            </View>
          )}

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <InfoItem icon="calendar-today" label="Tarih" value={formattedDate} />
            <InfoItem icon="schedule" label="Saat" value={formattedTime} />
            <InfoItem
              icon={workshop.locationType === 'online' ? 'videocam' : 'place'}
              label="Konum"
              value={workshop.locationType === 'online' ? 'Online' : workshop.locationDetail || '—'}
            />
            <InfoItem
              icon="groups"
              label="Kapasite"
              value={`${workshop.enrolledCount}/${workshop.capacity} kişi`}
            />
          </View>

          {/* Description */}
          {workshop.description && (
            <View style={styles.descSection}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{workshop.description}</Text>
            </View>
          )}

          {/* Tags */}
          {workshop.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {workshop.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Fiyat</Text>
          <Text style={styles.priceValue}>{workshop.price} ₺</Text>
        </View>
        <TouchableOpacity
          style={[styles.enrollButton, (isFull || isEnrolling) && styles.enrollButtonDisabled]}
          onPress={handleEnroll}
          disabled={isFull || isEnrolling}
          activeOpacity={0.85}
        >
          {isEnrolling ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={styles.enrollButtonText}>{isFull ? 'Kapasite Doldu' : 'Kaydol'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconWrap}>
        <MaterialIcons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
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
  container: { paddingBottom: 100 },
  headerImage: {
    height: 220,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.xl,
    left: Spacing.containerMargin,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
    zIndex: 10,
  },
  headerIconWrap: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.onSurface,
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  employerName: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  infoItem: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextWrap: { flex: 1 },
  infoLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  infoValue: {
    ...Typography.labelMd,
    color: Colors.onSurface,
    marginTop: 1,
  },
  descSection: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.onSurface,
  },
  description: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  tagText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
    ...Shadows.card,
  },
  priceLabel: {
    ...Typography.labelSm,
    color: Colors.outline,
  },
  priceValue: {
    ...Typography.h2,
    color: Colors.primary,
  },
  enrollButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollButtonDisabled: {
    backgroundColor: Colors.outline,
  },
  enrollButtonText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
    fontSize: 14,
  },
});