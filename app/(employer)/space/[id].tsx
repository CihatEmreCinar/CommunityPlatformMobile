import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '../../../components/ui/Icon';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';
import { spaceListingService, type SpaceListing } from '../../../services/spaceListingService';
import { spaceBookingService } from '../../../services/spaceBookingService';

type PickerTarget = { field: 'start' | 'end'; mode: 'date' | 'time' } | null;

function combineDateAndTime(base: Date, part: Date, part2: 'date' | 'time'): Date {
  const result = new Date(base);
  if (part2 === 'date') result.setFullYear(part.getFullYear(), part.getMonth(), part.getDate());
  else result.setHours(part.getHours(), part.getMinutes(), 0, 0);
  return result;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function defaultStart(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

function defaultEnd(): Date {
  const d = defaultStart();
  d.setHours(d.getHours() + 1);
  return d;
}

export default function EmployerSpaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<SpaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDateTime, setStartDateTime] = useState<Date>(defaultStart());
  const [endDateTime, setEndDateTime] = useState<Date>(defaultEnd());
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const resolvedId = Array.isArray(id) ? id[0] : String(id);
    if (!resolvedId || resolvedId === 'undefined') { setLoading(false); return; }
    (async () => {
      try {
        setListing(await spaceListingService.getById(resolvedId));
      } catch (error) {
        console.log('Mekan detay yüklenemedi', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function openPicker(field: 'start' | 'end') {
    setPickerTarget({ field, mode: 'date' });
  }

  function handlePickerChange(event: DateTimePickerEvent, selected?: Date) {
    if (!pickerTarget) return;
    if (event.type === 'dismissed') { setPickerTarget(null); return; }
    if (!selected) { setPickerTarget(null); return; }
    const { field, mode } = pickerTarget;
    const current = field === 'start' ? startDateTime : endDateTime;
    const updated = combineDateAndTime(current, selected, mode);
    if (field === 'start') setStartDateTime(updated);
    else setEndDateTime(updated);
    if (mode === 'date') setPickerTarget({ field, mode: 'time' });
    else setPickerTarget(null);
  }

  async function handleCreateBooking() {
    if (!listing) return;
    if (endDateTime <= startDateTime) {
      Alert.alert('Geçersiz tarih', 'Bitiş tarihi başlangıç tarihinden sonra olmalı.');
      return;
    }
    setSubmitting(true);
    try {
      await spaceBookingService.create({ spaceListingId: listing.id, startDateTime: startDateTime.toISOString(), endDateTime: endDateTime.toISOString() });
      Alert.alert('Talep gönderildi', 'Rezervasyon talebiniz kafeye iletildi.');
      router.back();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        Alert.alert('Dolu', error.response?.data?.message || 'Bu tarih aralığı dolu.');
      } else {
        Alert.alert('Hata', error?.response?.data?.message || 'Rezervasyon talebi gönderilemedi.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenContainer>
    );
  }

  if (!listing) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={styles.centered}><Text style={{ color: Colors.onSurfaceVariant }}>İlan bulunamadı.</Text></View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']} header={<Text style={styles.title}>{listing.title}</Text>}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photoGallery}>
          {listing.photoUrls.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
              {listing.photoUrls.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.photoItem} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="photoLibrary" size={30} color={Pastel.coral.text} />
              <Text style={styles.photoPlaceholderText}>Fotoğraf yok</Text>
            </View>
          )}
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: listing.isActive ? Pastel.teal.tintStrong : Pastel.coral.tintStrong }]}>
            <Text style={[styles.statusText, { color: listing.isActive ? Pastel.teal.text : Pastel.coral.text }]}>{listing.isActive ? 'Aktif' : 'Pasif'}</Text>
          </View>
          {listing.status ? <Text style={styles.statusSubtext}>{listing.status}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Açıklama</Text>
          <Text style={styles.value}>{listing.description || 'Açıklama yok.'}</Text>
        </View>

        <View style={styles.rowCard}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Kapasite</Text>
            <Text style={styles.value}>{listing.capacity} kişi</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Saatlik</Text>
            <Text style={styles.value}>{listing.hourlyPrice} ₺</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Şehir</Text>
          <Text style={styles.value}>{listing.city || 'Belirtilmemiş'}</Text>
        </View>

        {listing.amenities.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.label}>Olanaklar</Text>
            <Text style={styles.value}>{listing.amenities.join(', ')}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Kafe</Text>
          <Text style={styles.value}>{listing.cafeName || 'Bilinmiyor'}</Text>
          {listing.cafeCity ? <Text style={styles.subValue}>{listing.cafeCity}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Rezervasyon Talep Et</Text>

          <TouchableOpacity style={styles.dateRow} onPress={() => openPicker('start')} activeOpacity={0.7}>
            <Icon name="event" size={17} color={Pastel.coral.text} />
            <View style={styles.dateRowText}>
              <Text style={styles.dateRowLabel}>Başlangıç</Text>
              <Text style={styles.dateRowValue}>{formatDateTime(startDateTime)}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateRow} onPress={() => openPicker('end')} activeOpacity={0.7}>
            <Icon name="event" size={17} color={Pastel.coral.text} />
            <View style={styles.dateRowText}>
              <Text style={styles.dateRowLabel}>Bitiş</Text>
              <Text style={styles.dateRowValue}>{formatDateTime(endDateTime)}</Text>
            </View>
          </TouchableOpacity>

          {pickerTarget ? (
            <DateTimePicker
              value={pickerTarget.field === 'start' ? startDateTime : endDateTime}
              mode={pickerTarget.mode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handlePickerChange}
              minimumDate={pickerTarget.field === 'end' ? startDateTime : new Date()}
            />
          ) : null}
        </View>

        <TouchableOpacity style={[styles.submitButton, submitting && styles.submitButtonDisabled]} activeOpacity={0.85} onPress={handleCreateBooking} disabled={submitting}>
          {submitting ? <ActivityIndicator size="small" color={Colors.onPrimary} /> : <Text style={styles.submitButtonText}>Rezervasyon Talep Et</Text>}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.serifTitleLg, color: Colors.onSurface },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  photoGallery: { minHeight: 180, borderRadius: Radius.xxl, overflow: 'hidden', backgroundColor: Pastel.coral.tint },
  photoRow: { gap: Spacing.sm, padding: Spacing.sm },
  photoItem: { width: 240, height: 160, borderRadius: Radius.xl, backgroundColor: Colors.surfaceContainer },
  photoPlaceholder: { flex: 1, minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  photoPlaceholderText: { ...Typography.bodyMd, color: Pastel.coral.text },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusBadge: { borderRadius: Radius.full, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  statusText: { ...Typography.labelSm, fontWeight: '700' },
  statusSubtext: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  card: { backgroundColor: Pastel.coral.tint, borderRadius: Radius.xxl, padding: Spacing.md, gap: Spacing.xs },
  rowCard: { backgroundColor: Pastel.coral.tint, borderRadius: Radius.xxl, padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  infoColumn: { flex: 1, gap: Spacing.xs },
  label: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  value: { ...Typography.bodyMd, color: Colors.onSurface },
  subValue: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  dateRowText: { flex: 1 },
  dateRowLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  dateRowValue: { ...Typography.bodyMd, color: Colors.onSurface, marginTop: 2 },
  submitButton: { marginTop: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: Spacing.md, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { ...Typography.labelMd, color: Colors.onPrimary },
});
