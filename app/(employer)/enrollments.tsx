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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { enrollmentService } from '../../services/enrollmentService';
import { EmployerEnrollment } from '../../types/enrollment';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Onaylandı', color: Colors.primary, bg: Colors.primaryContainer },
  pending: { label: 'Bekliyor', color: Colors.secondary, bg: Colors.secondaryContainer },
  attended: { label: 'Katıldı', color: '#0F766E', bg: '#CCFBF1' },
  cancelled: { label: 'İptal', color: Colors.error, bg: Colors.errorContainer },
};

export default function EmployerEnrollmentsScreen() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status?: string }>();
  const [enrollments, setEnrollments] = useState<EmployerEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadEnrollments = useCallback(async () => {
    try {
      const data = await enrollmentService.getEmployerEnrollments(status);
      setEnrollments(data);
    } catch (error) {
      console.log('Kayıtlar yüklenemedi', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [status]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  async function handleApprove(id: string) {
    setActionId(id);
    try {
      await enrollmentService.approve(id);
      setEnrollments((prev) => prev.map((item) => item.id === id ? { ...item, status: 'confirmed' } : item));
    } catch (error) {
      console.log('Onaylanamadı', error);
      Alert.alert('Hata', 'Kaydı onaylarken bir sorun oluştu.');
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    setActionId(id);
    try {
      await enrollmentService.reject(id);
      setEnrollments((prev) => prev.map((item) => item.id === id ? { ...item, status: 'cancelled' } : item));
    } catch (error) {
      console.log('Reddedilemedi', error);
      Alert.alert('Hata', 'Kaydı reddederken bir sorun oluştu.');
    } finally {
      setActionId(null);
    }
  }

  function onRefresh() {
    setIsRefreshing(true);
    loadEnrollments();
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Kayıt Talepleri</Text>
        <View style={{ width: 40 }} />
      </View>

      {enrollments.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="people-outline" size={40} color={Colors.outline} />
          <Text style={styles.emptyTitle}>Kayıt bulunamadı</Text>
          <Text style={styles.emptyText}>Yeni talepler için atölyelerini kontrol et.</Text>
        </View>
      ) : (
        enrollments.map((item) => {
          const statusStyle = STATUS_LABELS[item.status] ?? STATUS_LABELS.pending;
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.workshopTitle}</Text>
                  <Text style={styles.cardSubtitle}>{item.employeeName}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}> 
                  <Text style={[styles.badgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                </View>
              </View>

              {item.message ? (
                <View style={styles.messageRow}>
                  <MaterialIcons name="message" size={16} color={Colors.outline} />
                  <Text style={styles.messageText}>{item.message}</Text>
                </View>
              ) : null}

              <View style={styles.metaRow}>
                <MaterialIcons name="event" size={14} color={Colors.outline} />
                <Text style={styles.metaText}>{new Date(item.appliedAt).toLocaleDateString('tr-TR', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}</Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  disabled={item.status !== 'pending' || actionId === item.id}
                  onPress={() => handleApprove(item.id)}
                >
                  <Text style={styles.actionText}>Onayla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  disabled={item.status !== 'pending' || actionId === item.id}
                  onPress={() => handleReject(item.id)}
                >
                  <Text style={styles.actionText}>Reddet</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  container: { padding: Spacing.containerMargin, paddingBottom: Spacing.xl },
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
  title: { ...Typography.h3, color: Colors.onSurface },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl * 1.5, gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.onSurface, marginTop: Spacing.sm },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  cardTitleWrap: { flex: 1 },
  cardTitle: { ...Typography.h3, color: Colors.onSurface, fontSize: 16 },
  cardSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, alignSelf: 'flex-start' },
  badgeText: { ...Typography.labelSm, fontWeight: '700' },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  messageText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 13 },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: Colors.primary,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  actionText: { ...Typography.labelMd, color: '#FFFFFF' },
});