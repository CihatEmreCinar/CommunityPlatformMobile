import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '../../../components/ui/Icon';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ticketService } from '../../../services/ticketService';
import { enrollmentService } from '../../../services/enrollmentService';
import { Participant } from '../../../types/ticket';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';

type TabKey = 'pending' | 'confirmed' | 'attended' | 'noshow';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'pending', label: 'Bekliyor' },
  { key: 'confirmed', label: 'Onaylandı' },
  { key: 'attended', label: 'Katıldı' },
  { key: 'noshow', label: 'Gelmedi' },
];

function matchesTab(p: Participant, tab: TabKey): boolean {
  if (tab === 'pending') return p.status === 'pending';
  if (tab === 'confirmed') return p.status === 'confirmed' && p.attendanceStatus === 'Pending';
  if (tab === 'attended') return p.attendanceStatus === 'Attended';
  if (tab === 'noshow') return p.attendanceStatus === 'NoShow';
  return false;
}

export default function ParticipantsScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('confirmed');
  const [scannerOpen, setScannerOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await ticketService.getWorkshopParticipants(id);
      setParticipants(data);
    } catch (e) {
      console.log('Katılımcılar yüklenemedi', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => participants.filter((p) => matchesTab(p, activeTab)), [participants, activeTab]);

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { pending: 0, confirmed: 0, attended: 0, noshow: 0 };
    for (const p of participants) {
      for (const t of TABS) {
        if (matchesTab(p, t.key)) c[t.key] += 1;
      }
    }
    return c;
  }, [participants]);

  async function handleManualAttend(enrollmentId: string) {
    try {
      await enrollmentService.markAttendedManual(enrollmentId);
      await load();
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.message || 'İşaretlenemedi.');
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrowBack" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || 'Katılımcılar'}
        </Text>
        <TouchableOpacity onPress={() => setScannerOpen(true)} style={styles.scanButton}>
          <Icon name="qrCodeScanner" size={22} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label} ({counts[t.key]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.list}
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
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="peopleOutline" size={40} color={Colors.outline} />
              <Text style={styles.emptyText}>Bu sekmede katılımcı yok</Text>
            </View>
          ) : (
            filtered.map((p) => (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Icon name="person" size={20} color={Colors.onSurfaceVariant} />
                  <Text style={styles.participantName}>{p.userName}</Text>
                </View>
                {p.attendedAt && (
                  <Text style={styles.attendedAtText}>
                    {new Date(p.attendedAt).toLocaleString('tr-TR')}
                  </Text>
                )}
                {activeTab === 'confirmed' && (
                  <TouchableOpacity style={styles.manualBtn} onPress={() => handleManualAttend(p.id)}>
                    <Text style={styles.manualBtnText}>Manuel işaretle</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <ScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCheckedIn={() => {
          setScannerOpen(false);
          load();
        }}
      />
    </SafeAreaView>
  );
}

function ScannerModal({
  visible,
  onClose,
  onCheckedIn,
}: {
  visible: boolean;
  onClose: () => void;
  onCheckedIn: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [preview, setPreview] = useState<{ qrPayload: string; participantName: string; workshopTitle: string; alreadyUsed: boolean } | null>(null);
  const [processing, setProcessing] = useState(false);
  // useState yerine ref: CameraView aynı kare için onBarcodeScanned'i art arda birkaç kez
  // tetikleyebiliyor; state güncellemesi bir sonraki render'a kadar gecikir, bu da aynı
  // QR için birden fazla /tickets/verify çağrısına yol açardı. Ref senkron ve anında geçerli.
  const lockRef = useRef(false);

  useEffect(() => {
    if (visible) {
      lockRef.current = false;
      setScanned(false);
      setPreview(null);
      if (!permission?.granted) requestPermission();
    }
  }, [visible]);

  async function handleScan({ data }: { data: string }) {
    if (lockRef.current) return;
    lockRef.current = true;
    setScanned(true);
    setProcessing(true);
    try {
      const result = await ticketService.verify(data);
      setPreview({
        qrPayload: data,
        participantName: result.participantName,
        workshopTitle: result.workshopTitle,
        alreadyUsed: result.alreadyUsed,
      });
    } catch (e: any) {
      const status = e?.response?.status;
      const backendMessage = e?.response?.data?.message;
      const detail =
        status === 403
          ? 'Bu atölye bu işletmeye ait değil.'
          : status === 429
          ? 'Çok fazla deneme yapıldı, birkaç saniye bekleyip tekrar deneyin.'
          : backendMessage || 'Bu QR kod doğrulanamadı.';

      Alert.alert('Geçersiz Bilet', `[${status ?? 'network'}] ${detail}`, [
        {
          text: 'Tamam',
          onPress: () => {
            lockRef.current = false;
            setScanned(false);
          },
        },
      ]);
    } finally {
      setProcessing(false);
    }
  }

  async function handleConfirm() {
    if (!preview) return;
    setProcessing(true);
    try {
      await ticketService.checkIn(preview.qrPayload);
      Alert.alert('Başarılı', `${preview.participantName} check-in yapıldı.`);
      onCheckedIn();
    } catch (e: any) {
      if (e?.response?.status === 409) {
        Alert.alert('Zaten Okutulmuş', 'Bu bilet daha önce kullanılmış.');
      } else {
        const status = e?.response?.status;
        Alert.alert('Hata', `[${status ?? 'network'}] ${e?.response?.data?.message || 'Check-in başarısız.'}`);
      }
      lockRef.current = false;
      setScanned(false);
      setPreview(null);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.scannerContainer}>
        {!permission?.granted ? (
          <View style={styles.center}>
            <Text style={styles.permissionText}>Kamera izni gerekiyor</Text>
            <TouchableOpacity style={styles.manualBtn} onPress={requestPermission}>
              <Text style={styles.manualBtnText}>İzin ver</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleScan}
          />
        )}

        <View style={styles.scannerHeader}>
          <TouchableOpacity onPress={onClose} style={styles.scannerCloseBtn}>
            <Icon name="closeModal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.scannerTitle}>QR Tara</Text>
          <View style={{ width: 40 }} />
        </View>

        {preview && (
          <View style={styles.previewSheet}>
            {preview.alreadyUsed && (
              <View style={styles.warningRow}>
                <Icon name="warning" size={16} color={Colors.error} />
                <Text style={styles.warningText}>Bu bilet zaten kullanılmış</Text>
              </View>
            )}
            <Text style={styles.previewName}>{preview.participantName}</Text>
            <Text style={styles.previewWorkshop}>{preview.workshopTitle}</Text>
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.previewCancelBtn}
                onPress={() => {
                  setScanned(false);
                  setPreview(null);
                }}
              >
                <Text style={styles.previewCancelText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewConfirmBtn, preview.alreadyUsed && styles.previewConfirmBtnDisabled]}
                onPress={handleConfirm}
                disabled={processing || preview.alreadyUsed}
              >
                {processing ? (
                  <ActivityIndicator color={Colors.onPrimary} />
                ) : (
                  <Text style={styles.previewConfirmText}>Onayla</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.sm,
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
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.containerMargin,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, fontSize: 11 },
  tabTextActive: { color: Colors.onPrimary, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.containerMargin, paddingBottom: Spacing.xl },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  participantName: { ...Typography.labelMd, fontSize: 15, color: Colors.onSurface },
  attendedAtText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  manualBtn: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  manualBtnText: { ...Typography.labelMd, color: Colors.primary },

  // Scanner
  scannerContainer: { flex: 1, backgroundColor: '#000000' },
  scannerHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
  },
  scannerCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTitle: { ...Typography.h3, color: '#FFFFFF' },
  permissionText: { ...Typography.bodyMd, color: '#FFFFFF' },
  previewSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.xs,
    ...Shadows.card,
  },
  warningRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  warningText: { ...Typography.labelMd, color: Colors.error },
  previewName: { ...Typography.h2, color: Colors.onSurface },
  previewWorkshop: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm },
  previewActions: { flexDirection: 'row', gap: Spacing.sm },
  previewCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.outline,
    alignItems: 'center',
  },
  previewCancelText: { ...Typography.labelMd, color: Colors.onSurface },
  previewConfirmBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  previewConfirmBtnDisabled: { backgroundColor: Colors.outline },
  previewConfirmText: { ...Typography.labelMd, color: Colors.onPrimary },
});
