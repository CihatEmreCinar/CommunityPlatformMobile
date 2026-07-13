import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { enrollmentService } from '../../../services/enrollmentService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Enrollment } from '../../../types/enrollment';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Onaylandı', color: Colors.primary, bg: Colors.primaryContainer },
  pending: { label: 'Bekliyor', color: Colors.secondary, bg: Colors.secondaryContainer },
  cancelled: { label: 'İptal', color: Colors.error, bg: Colors.errorContainer },
};

function resolveBadge(e: Enrollment) {
  if (e.attendanceStatus === 'Attended') {
    return { label: 'Katıldım', color: '#0F766E', bg: '#CCFBF1' };
  }
  if (e.attendanceStatus === 'NoShow') {
    return { label: 'Katılmadım', color: Colors.error, bg: Colors.errorContainer };
  }
  return STATUS_LABELS[e.status] ?? STATUS_LABELS.pending;
}

export default function EnrollmentsScreen() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await enrollmentService.getMine();
      setEnrollments(data);
    } catch (e) {
      console.log('Kayıtlar yüklenemedi', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel(id: string) {
    try {
      await enrollmentService.cancel(id);
      setEnrollments((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'cancelled' } : e)));
    } catch (e) {
      console.log('İptal edilemedi', e);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              load();
            }}
            colors={[Colors.primary]}
          />
        }
      >
        <Text style={styles.pageTitle}>Kayıtlarım</Text>
      <Text style={styles.totalCount}>Toplam Kayıt: {enrollments.length}</Text>

      {enrollments.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="event-busy" size={40} color={Colors.outline} />
          <Text style={styles.emptyText}>Henüz kayıt yok</Text>
        </View>
      ) : (
        enrollments.map((e) => (
          <EnrollmentCard
            key={e.id}
            enrollment={e}
            onCancel={handleCancel}
            onOpenTicket={() => router.push(`/(employee)/enrollment/${e.id}`)}
          />
        ))
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EnrollmentCard({
  enrollment: e,
  onCancel,
  onOpenTicket,
}: {
  enrollment: Enrollment;
  onCancel: (id: string) => void;
  onOpenTicket: () => void;
}) {
  const s = resolveBadge(e);
  const date = new Date(e.workshopStartAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const canOpenTicket = e.status === 'confirmed';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={canOpenTicket ? 0.8 : 1}
      onPress={canOpenTicket ? onOpenTicket : undefined}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.workshopTitle} numberOfLines={2}>
          {e.workshopTitle}
        </Text>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="calendar-today" size={14} color={Colors.outline} />
        <Text style={styles.infoText}>{date}</Text>
      </View>

      {e.status === 'pending' && (
        <View style={styles.pendingInfo}>
          <MaterialIcons name="hourglass-top" size={14} color={Colors.secondary} />
          <Text style={styles.pendingText}>Onay bekleniyor</Text>
        </View>
      )}

      {canOpenTicket && (
        <View style={styles.ticketRow}>
          <MaterialIcons name="qr-code-2" size={16} color={Colors.primary} />
          <Text style={styles.ticketRowText}>Bileti görüntülemek için dokun</Text>
        </View>
      )}

      {e.status === 'confirmed' && e.attendanceStatus !== 'Attended' && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(e.id)} activeOpacity={0.8}>
          <Text style={styles.cancelText}>Kaydı İptal Et</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  container: { padding: Spacing.containerMargin, paddingBottom: Spacing.xl },
  pageTitle: { ...Typography.h1Mobile, color: Colors.onSurface, marginBottom: Spacing.sm },
  totalCount: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginBottom: Spacing.lg },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  workshopTitle: { ...Typography.h3, color: Colors.onSurface, flex: 1, fontSize: 15 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  badgeText: { ...Typography.labelSm, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  infoText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 13 },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
  },
  ticketRowText: { ...Typography.bodyMd, color: Colors.onPrimaryContainer, fontSize: 13 },
  cancelBtn: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
  },
  cancelText: { ...Typography.labelMd, color: Colors.error },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.secondaryContainer,
  },
  pendingText: { ...Typography.bodyMd, color: Colors.secondary },
});
