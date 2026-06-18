import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { workshopService } from '../../../services/workshopService';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';

export default function CreateWorkshopScreen() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [locationType, setLocationType] = useState<'online' | 'in-person'>('in-person');
  const [locationDetail, setLocationDetail] = useState('');
  const [tagsText, setTagsText] = useState('');

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  function validate(): string | null {
    if (!title.trim()) return 'Başlık zorunludur.';
    if (!price || isNaN(Number(price)) || Number(price) < 0) return 'Geçerli bir fiyat girin.';
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1)
      return 'Geçerli bir kapasite girin.';
    if (!startDate) return 'Tarih zorunludur (YYYY-AA-GG formatında).';
    if (!startTime || !endTime) return 'Başlangıç ve bitiş saati zorunludur (SS:DD formatında).';
    if (locationType === 'in-person' && !locationDetail.trim())
      return 'Yüz yüze atölyeler için konum zorunludur.';
    return null;
  }

  async function handleCreate() {
    const error = validate();
    if (error) {
      Alert.alert('Hata', error);
      return;
    }

    setIsSaving(true);
    try {
      const startAt = new Date(`${startDate}T${startTime}:00Z`).toISOString();
      const endAt = new Date(`${startDate}T${endTime}:00Z`).toISOString();

      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await workshopService.create({
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        capacity: Number(capacity),
        locationType,
        locationDetail: locationDetail.trim() || undefined,
        startAt,
        endAt,
        tags,
      });

      Alert.alert('Başarılı', 'Atölye taslak olarak oluşturuldu.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Atölye oluşturulamadı.';
      Alert.alert('Hata', message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Atölye</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.form}>
        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Başlık *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Örn: Seramik Atölyesi - Başlangıç"
            placeholderTextColor={Colors.outlineVariant}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Atölye hakkında detaylı bilgi"
            placeholderTextColor={Colors.outlineVariant}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Price & Capacity */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.rowItem]}>
            <Text style={styles.label}>Fiyat (₺) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="250"
              placeholderTextColor={Colors.outlineVariant}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.fieldGroup, styles.rowItem]}>
            <Text style={styles.label}>Kapasite *</Text>
            <TextInput
              style={styles.input}
              value={capacity}
              onChangeText={setCapacity}
              placeholder="10"
              placeholderTextColor={Colors.outlineVariant}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Location Type */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Konum Türü</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleButton, locationType === 'in-person' && styles.toggleButtonActive]}
              onPress={() => setLocationType('in-person')}
            >
              <MaterialIcons
                name="place"
                size={16}
                color={locationType === 'in-person' ? Colors.onPrimary : Colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.toggleText,
                  locationType === 'in-person' && styles.toggleTextActive,
                ]}
              >
                Yüz Yüze
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, locationType === 'online' && styles.toggleButtonActive]}
              onPress={() => setLocationType('online')}
            >
              <MaterialIcons
                name="videocam"
                size={16}
                color={locationType === 'online' ? Colors.onPrimary : Colors.onSurfaceVariant}
              />
              <Text
                style={[styles.toggleText, locationType === 'online' && styles.toggleTextActive]}
              >
                Online
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Detail */}
        {locationType === 'in-person' && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Adres *</Text>
            <TextInput
              style={styles.input}
              value={locationDetail}
              onChangeText={setLocationDetail}
              placeholder="Örn: Kadıköy, İstanbul"
              placeholderTextColor={Colors.outlineVariant}
            />
          </View>
        )}

        {/* Date & Time */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tarih * (YYYY-AA-GG)</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2026-07-15"
            placeholderTextColor={Colors.outlineVariant}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.rowItem]}>
            <Text style={styles.label}>Başlangıç Saati * (SS:DD)</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="14:00"
              placeholderTextColor={Colors.outlineVariant}
            />
          </View>
          <View style={[styles.fieldGroup, styles.rowItem]}>
            <Text style={styles.label}>Bitiş Saati * (SS:DD)</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="17:00"
              placeholderTextColor={Colors.outlineVariant}
            />
          </View>
        </View>

        {/* Tags */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Etiketler</Text>
          <TextInput
            style={styles.input}
            value={tagsText}
            onChangeText={setTagsText}
            placeholder="seramik, el sanatları (virgülle ayır)"
            placeholderTextColor={Colors.outlineVariant}
          />
        </View>

        {/* Info note */}
        <View style={styles.noteBox}>
          <MaterialIcons name="info-outline" size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.noteText}>
            Atölyen taslak olarak oluşturulacak. Yayınlamak için profilini tamamlaman gerekir.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
          onPress={handleCreate}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={styles.submitButtonText}>Taslak Oluştur</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
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
  headerTitle: {
    ...Typography.h3,
    color: Colors.onSurface,
  },
  form: {
    gap: Spacing.md,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
  label: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
  input: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
  toggleTextActive: {
    color: Colors.onPrimary,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  noteText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
    fontSize: 14,
  },
});
