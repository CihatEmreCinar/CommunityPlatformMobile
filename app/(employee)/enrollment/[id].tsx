import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '../../../components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { enrollmentService } from '../../../services/enrollmentService';
import { Ticket } from '../../../types/ticket';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';
import { TicketQR } from '../../../components/tickets/TicketQR';

const ATTENDANCE_PASTEL: Record<string, { label: string; palette: typeof Pastel.teal }> = {
  Pending: { label: 'Katılım bekleniyor', palette: Pastel.amber },
  Attended: { label: 'Katıldınız', palette: Pastel.teal },
  NoShow: { label: 'Katılmadınız', palette: Pastel.coral },
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
          <Icon name="errorOutline" size={40} color={Pastel.coral.text} />
          <Text style={styles.errorText}>{error || 'Bilet bulunamadı.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const s = ATTENDANCE_PASTEL[ticket.attendanceStatus] ?? ATTENDANCE_PASTEL.Pending;
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

        {/* Hero kart — bu ekranın tek öncelikli içeriği: solid doygun pastel, koyu ton metin */}
        <View style={[styles.ticketCard, { backgroundColor: s.palette.hero }]}>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: s.palette.heroText }]}>{s.label}</Text>
          </View>

          <Text style={[styles.workshopTitle, { color: s.palette.heroText }]}>{ticket.workshopTitle}</Text>

          <View style={styles.infoRow}>
            <Icon name="calendarToday" size={16} color={s.palette.heroText} />
            <Text style={[styles.infoText, { color: s.palette.heroText }]}>{dateText}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="schedule" size={16} color={s.palette.heroText} />
            <Text style={[styles.infoText, { color: s.palette.heroText }]}>{timeText}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="place" size={16} color={s.palette.heroText} />
            <Text style={[styles.infoText, { color: s.palette.heroText }]}>
              {ticket.workshopLocationType === 'online' ? 'Online' : (ticket.workshopLocationDetail || 'Konum belirtilmedi')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="badge" size={16} color={s.palette.heroText} />
            <Text style={[styles.infoText, { color: s.palette.heroText }]}>{ticket.employerName}</Text>
          </View>

          <View style={styles.participantBlock}>
            <Text style={[styles.participantLabel, { color: s.palette.heroText }]}>Katılımcı</Text>
            <Text style={[styles.participantName, { color: s.palette.heroText }]}>{ticket.participantName}</Text>
          </View>

          <View style={styles.qrSection}>
            {ticket.attendanceStatus === 'Attended' ? (
              <View style={styles.attendedBox}>
                <Icon name="checkCircle" size={48} color={s.palette.heroText} />
                <Text style={[styles.attendedText, { color: s.palette.heroText }]}>Bu atölyeye katıldınız</Text>
              </View>
            ) : (
              <View style={styles.qrCard}>
                <TicketQR value={ticket.qrPayload} />
                <Text style={styles.qrHint}>Giriş için bu kodu görevliye okutun</Text>
              </View>
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
    backgroundColor: Colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { ...Typography.serifTitle, color: Colors.onSurface, flex: 1, textAlign: 'center' },
  ticketCard: {
    borderRadius: Radius.xxxl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: { ...Typography.labelSm, fontWeight: '700' },
  workshopTitle: { ...Typography.serifHeading, fontSize: 22, lineHeight: 28, marginTop: Spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  infoText: { ...Typography.bodyMd },
  participantBlock: { marginTop: Spacing.sm, gap: 2 },
  participantLabel: { ...Typography.labelSm, opacity: 0.8 },
  participantName: { ...Typography.h3 },
  qrSection: { alignItems: 'center', marginTop: Spacing.lg, gap: Spacing.sm },
  qrCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center', gap: Spacing.sm },
  qrHint: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  attendedBox: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  attendedText: { ...Typography.h3 },
});
