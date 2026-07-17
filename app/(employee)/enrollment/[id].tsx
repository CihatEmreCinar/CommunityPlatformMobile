import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '../../../components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { enrollmentService } from '../../../services/enrollmentService';
import { Ticket } from '../../../types/ticket';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { TicketQR } from '../../../components/tickets/TicketQR';

const ATTENDANCE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  Pending: { label: 'Katılım bekleniyor', color: Colors.secondary, bg: Colors.secondaryContainer },
  Attended: { label: 'Katıldınız', color: '#0F766E', bg: '#CCFBF1' },
  NoShow: { label: 'Katılmadınız', color: Colors.error, bg: Colors.errorContainer },
};

export default function TicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await enrollmentService.getTicket(id);
      setTicket(data);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Bilet yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !ticket) {
    return (
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrowBack" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bilet</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Icon name="errorOutline" size={40} color={Colors.error} />
          <Text style={styles.errorText}>{error || 'Bilet bulunamadı.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const s = ATTENDANCE_LABELS[ticket.attendanceStatus] ?? ATTENDANCE_LABELS.Pending;
  const startDate = new Date(ticket.workshopStartAt);
  const dateText = startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeText = startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrowBack" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bilet</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.ticketCard}>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
          </View>

          <Text style={styles.workshopTitle}>{ticket.workshopTitle}</Text>

          <View style={styles.infoRow}>
            <Icon name="calendarToday" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.infoText}>{dateText}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="schedule" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.infoText}>{timeText}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="place" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.infoText}>
              {ticket.workshopLocationType === 'online' ? 'Online' : (ticket.workshopLocationDetail || 'Konum belirtilmedi')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="badge" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.infoText}>{ticket.employerName}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.participantLabel}>Katılımcı</Text>
          <Text style={styles.participantName}>{ticket.participantName}</Text>

          <View style={styles.qrSection}>
            {ticket.attendanceStatus === 'Attended' ? (
              <View style={styles.attendedBox}>
                <Icon name="checkCircle" size={48} color="#0F766E" />
                <Text style={styles.attendedText}>Bu atölyeye katıldınız</Text>
              </View>
            ) : (
              <>
                <TicketQR value={ticket.qrPayload} />
                <Text style={styles.qrHint}>Giriş için bu kodu görevliye okutun</Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: Spacing.sm },
  container: { paddingHorizontal: Spacing.containerMargin, paddingBottom: Spacing.xl },
  errorText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
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
  headerTitle: { ...Typography.h3, color: Colors.onSurface, flex: 1, textAlign: 'center' },
  ticketCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: { ...Typography.labelSm, fontWeight: '600' },
  workshopTitle: { ...Typography.h2, color: Colors.onSurface, marginTop: Spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  infoText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  divider: { height: 1, backgroundColor: Colors.surfaceVariant, marginVertical: Spacing.sm },
  participantLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  participantName: { ...Typography.h3, color: Colors.onSurface },
  qrSection: { alignItems: 'center', marginTop: Spacing.lg, gap: Spacing.sm },
  qrHint: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  attendedBox: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  attendedText: { ...Typography.h3, color: '#0F766E' },
});
