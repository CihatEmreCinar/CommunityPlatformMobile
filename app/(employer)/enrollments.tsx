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
import { Icon } from '../../components/ui/Icon';
import { enrollmentService } from '../../services/enrollmentService';
import { EmployerEnrollment } from '../../types/enrollment';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_STYLES: Record<string, { label: string; palette: typeof Pastel.teal }> = {
  confirmed: { label: 'Onaylandı', palette: Pastel.teal },
  pending: { label: 'Bekliyor', palette: Pastel.amber },
  attended: { label: 'Katıldı', palette: Pastel.purple },
  cancelled: { label: 'İptal', palette: Pastel.coral },
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
      setEnrollments(await enrollmentService.getEmployerEnrollments(status));
    } catch (error) {
      if (__DEV__) console.log('Kayıtlar yüklenemedi', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [status]);

  useEffect(() => { loadEnrollments(); }, [loadEnrollments]);

  async function handleApprove(id: string) {
    setActionId(id);
    try {
      await enrollmentService.approve(id);
      setEnrollments((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'confirmed' } : item)));
    } catch (error) {
      if (__DEV__) console.log('Onaylanamadı', error);
      Alert.alert('Hata', 'Kaydı onaylarken bir sorun oluştu.');
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    setActionId(id);
    try {
      await enrollmentService.reject(id);
      setEnrollments((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item)));
    } catch (error) {
      if (__DEV__) console.log('Reddedilemedi', error);
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Geri">
            <Icon name="arrowBack" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Kayıt Talepleri</Text>
          <View style={{ width: 38 }} />
        </View>

        {enrollments.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="peopleOutline" size={38} color={Colors.outline} />
            <Text style={styles.emptyTitle}>Kayıt bulunamadı</Text>
            <Text style={styles.emptyText}>Yeni talepler için atölyelerini kontrol et.</Text>
          </View>
        ) : (
          enrollments.map((item) => {
            const s = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;
            return (
              <View key={item.id} style={[styles.card, { backgroundColor: s.palette.tint }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.workshopTitle}</Text>
                    <Text style={styles.cardSubtitle}>{item.employeeName}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: s.palette.tintStrong }]}>
                    <Text style={[styles.badgeText, { color: s.palette.text }]}>{s.label}</Text>
                  </View>
                </View>

                {item.message ? (
                  <View style={styles.messageRow}>
                    <Icon name="message" size={15} color={Colors.onSurfaceVariant} />
                    <Text style={styles.messageText}>{item.message}</Text>
                  </View>
                ) : null}

                <View style={styles.metaRow}>
                  <Icon name="event" size={13} color={Colors.onSurfaceVariant} />
                  <Text style={styles.metaText}>
                    {new Date(item.appliedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    disabled={item.status !== 'pending' || actionId === item.id}
                    onPress={() => handleApprove(item.id)}
                  >
                    <Text style={styles.approveText}>Onayla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    disabled={item.status !== 'pending' || actionId === item.id}
                    onPress={() => handleReject(item.id)}
                  >
                    <Text style={styles.rejectText}>Reddet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  container: { padding: Spacing.containerMargin, paddingBottom: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  backButton: { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.serifTitleLg, color: Colors.onSurface },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl * 1.5, gap: Spacing.sm },
  emptyTitle: { ...Typography.serifTitle, color: Colors.onSurface, marginTop: Spacing.sm },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  card: { borderRadius: Radius.xxl, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  cardTitleWrap: { flex: 1 },
  cardTitle: { ...Typography.labelMd, fontSize: 16, color: Colors.onSurface },
  cardSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, alignSelf: 'flex-start' },
  badgeText: { ...Typography.labelSm, fontWeight: '700' },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  messageText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { ...Typography.bodySm, color: Colors.onSurfaceVariant },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionButton: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  approveButton: { backgroundColor: Colors.primary },
  rejectButton: { backgroundColor: Pastel.coral.tintStrong },
  approveText: { ...Typography.labelMd, color: Colors.white },
  rejectText: { ...Typography.labelMd, color: Pastel.coral.text },
});
