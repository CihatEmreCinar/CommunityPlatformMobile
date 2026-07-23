import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../ui/Icon';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/category';
import { Workshop, WorkshopRequest } from '../../types/workshop';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CityDistrictPicker } from '../location/CityDistrictPicker';
import { EMPTY_LOCATION_SELECTION, type LocationSelection } from '../../types/location';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';

export interface WorkshopFormProps {
  mode: 'create' | 'edit';
  initialWorkshop?: Workshop;
  onSubmit: (payload: WorkshopRequest) => Promise<void>;
}

function toDateInput(iso: string): string { return iso.slice(0, 10); }
function toTimeInput(iso: string): string { return iso.slice(11, 16); }

export function WorkshopForm({ mode, initialWorkshop, onSubmit }: WorkshopFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState(initialWorkshop?.title ?? '');
  const [description, setDescription] = useState(initialWorkshop?.description ?? '');
  const [price, setPrice] = useState(initialWorkshop ? String(initialWorkshop.price) : '');
  const [capacity, setCapacity] = useState(initialWorkshop ? String(initialWorkshop.capacity) : '');
  const [locationType, setLocationType] = useState<'online' | 'in-person'>(initialWorkshop?.locationType ?? 'in-person');
  const [venueName, setVenueName] = useState(initialWorkshop?.venueName ?? '');
  const [address, setAddress] = useState(initialWorkshop?.address ?? '');
  const [location, setLocation] = useState<LocationSelection>(
    initialWorkshop
      ? { cityId: initialWorkshop.cityId, cityName: initialWorkshop.city, districtId: initialWorkshop.districtId, districtName: initialWorkshop.district }
      : EMPTY_LOCATION_SELECTION
  );
  const [latitude, setLatitude] = useState<number | null>(initialWorkshop?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(initialWorkshop?.longitude ?? null);
  const { getCurrentLocation, loading: locating } = useCurrentLocation();
  const [locationDetail, setLocationDetail] = useState(initialWorkshop?.locationDetail ?? '');
  const [tagsText, setTagsText] = useState(initialWorkshop?.tags?.join(', ') ?? '');

  const [startDate, setStartDate] = useState(initialWorkshop ? toDateInput(initialWorkshop.startAt) : '');
  const [startTime, setStartTime] = useState(initialWorkshop ? toTimeInput(initialWorkshop.startAt) : '');
  const [endTime, setEndTime] = useState(initialWorkshop ? toTimeInput(initialWorkshop.endAt) : '');

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialWorkshop?.categoryIds ?? []);

  useEffect(() => { categoryService.getAll().then(setCategories).catch(() => {}); }, []);

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleUseCurrentLocation() {
    const coords = await getCurrentLocation();
    if (!coords) {
      Alert.alert('Konum alınamadı', 'Konum izni verilmedi veya cihaz konumu okunamadı.');
      return;
    }
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
  }

  function validate(): string | null {
    if (!title.trim()) return 'Başlık zorunludur.';
    if (!price || isNaN(Number(price)) || Number(price) < 0) return 'Geçerli bir fiyat girin.';
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1) return 'Geçerli bir kapasite girin.';
    if (!startDate) return 'Tarih zorunludur (YYYY-AA-GG formatında).';
    if (!startTime || !endTime) return 'Başlangıç ve bitiş saati zorunludur (SS:DD formatında).';
    if (locationType === 'in-person' && !address.trim()) return 'Yüz yüze atölyeler için adres zorunludur.';
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) { Alert.alert('Hata', error); return; }
    setIsSaving(true);
    try {
      const startAt = new Date(`${startDate}T${startTime}:00Z`).toISOString();
      const endAt = new Date(`${startDate}T${endTime}:00Z`).toISOString();
      const tags = tagsText.split(',').map((t) => t.trim()).filter((t) => t.length > 0);

      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        capacity: Number(capacity),
        locationType,
        locationDetail: locationDetail.trim() || undefined,
        venueName: locationType === 'in-person' ? venueName.trim() || undefined : undefined,
        address: locationType === 'in-person' ? address.trim() || undefined : undefined,
        cityId: locationType === 'in-person' ? location.cityId ?? undefined : undefined,
        districtId: locationType === 'in-person' ? location.districtId ?? undefined : undefined,
        latitude: locationType === 'in-person' ? latitude ?? undefined : undefined,
        longitude: locationType === 'in-person' ? longitude ?? undefined : undefined,
        startAt,
        endAt,
        tags,
        categoryIds: selectedCategoryIds,
      });

      if (mode === 'create') {
        Alert.alert('Başarılı', 'Atölye taslak olarak oluşturuldu.', [{ text: 'Tamam', onPress: () => router.back() }]);
      } else {
        Alert.alert('Başarılı', 'Atölye güncellendi.', [{ text: 'Tamam', onPress: () => router.back() }]);
      }
    } catch (error: any) {
      Alert.alert('Hata', error?.response?.data?.message || (mode === 'create' ? 'Atölye oluşturulamadı.' : 'Atölye güncellenemedi.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrowBack" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{mode === 'create' ? 'Yeni Atölye' : 'Atölyeyi Düzenle'}</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Başlık *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Örn: Seramik Atölyesi - Başlangıç" placeholderTextColor={Colors.outline} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Atölye hakkında detaylı bilgi" placeholderTextColor={Colors.outline} multiline numberOfLines={4} />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.rowItem]}>
              <Text style={styles.label}>Fiyat (₺) *</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="250" placeholderTextColor={Colors.outline} keyboardType="decimal-pad" />
            </View>
            <View style={[styles.fieldGroup, styles.rowItem]}>
              <Text style={styles.label}>Kapasite *</Text>
              <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} placeholder="10" placeholderTextColor={Colors.outline} keyboardType="number-pad" />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Konum Türü</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.toggleButton, locationType === 'in-person' && styles.toggleButtonActive]} onPress={() => setLocationType('in-person')}>
                <Icon name="place" size={15} color={locationType === 'in-person' ? Colors.onPrimary : Colors.onSurfaceVariant} />
                <Text style={[styles.toggleText, locationType === 'in-person' && styles.toggleTextActive]}>Yüz Yüze</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleButton, locationType === 'online' && styles.toggleButtonActive]} onPress={() => setLocationType('online')}>
                <Icon name="videocam" size={15} color={locationType === 'online' ? Colors.onPrimary : Colors.onSurfaceVariant} />
                <Text style={[styles.toggleText, locationType === 'online' && styles.toggleTextActive]}>Online</Text>
              </TouchableOpacity>
            </View>
          </View>

          {locationType === 'in-person' && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Mekan Adı</Text>
                <TextInput style={styles.input} value={venueName} onChangeText={setVenueName} placeholder="Örn: Atolium Design Stüdyosu" placeholderTextColor={Colors.outline} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Adres *</Text>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Örn: Caferağa Mah. Moda Cad. No:10, Kadıköy" placeholderTextColor={Colors.outline} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Şehir / İlçe</Text>
                <CityDistrictPicker value={location} onChange={setLocation} />
              </View>

              <View style={styles.fieldGroup}>
                <TouchableOpacity style={styles.locationBtn} onPress={handleUseCurrentLocation} disabled={locating} activeOpacity={0.7}>
                  {locating ? <ActivityIndicator size="small" color={Pastel.teal.text} /> : <Icon name="myLocation" size={15} color={Pastel.teal.text} />}
                  <Text style={styles.locationBtnText}>{latitude != null && longitude != null ? 'Konumu Güncelle' : 'Konumumu Kullan'}</Text>
                </TouchableOpacity>
                {latitude != null && longitude != null && (
                  <Text style={styles.coordText}>
                    Harita pini ayarlandı ({latitude.toFixed(5)}, {longitude.toFixed(5)}) — bu, katılımcılara "Yakınımdakiler" listesinde mesafe gösterilmesini sağlar.
                  </Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Ek Konum Notu (opsiyonel)</Text>
                <TextInput style={styles.input} value={locationDetail} onChangeText={setLocationDetail} placeholder="Örn: 3. kat, yeşil kapı" placeholderTextColor={Colors.outline} />
              </View>
            </>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tarih * (YYYY-AA-GG)</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2026-07-15" placeholderTextColor={Colors.outline} />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.rowItem]}>
              <Text style={styles.label}>Başlangıç Saati * (SS:DD)</Text>
              <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="14:00" placeholderTextColor={Colors.outline} />
            </View>
            <View style={[styles.fieldGroup, styles.rowItem]}>
              <Text style={styles.label}>Bitiş Saati * (SS:DD)</Text>
              <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="17:00" placeholderTextColor={Colors.outline} />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kategoriler</Text>
            <View style={styles.categoryWrap}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <TouchableOpacity key={cat.id} style={[styles.categoryChip, isSelected && styles.categoryChipActive]} onPress={() => toggleCategory(cat.id)}>
                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Etiketler</Text>
            <TextInput style={styles.input} value={tagsText} onChangeText={setTagsText} placeholder="seramik, el sanatları (virgülle ayır)" placeholderTextColor={Colors.outline} />
          </View>

          {mode === 'create' && (
            <View style={styles.noteBox}>
              <Icon name="infoOutline" size={15} color={Pastel.amber.text} />
              <Text style={styles.noteText}>Atölyen taslak olarak oluşturulacak. Yayınlamak için profilini tamamlaman gerekir.</Text>
            </View>
          )}

          <TouchableOpacity style={[styles.submitButton, isSaving && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={isSaving} activeOpacity={0.85}>
            {isSaving ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.submitButtonText}>{mode === 'create' ? 'Taslak Oluştur' : 'Değişiklikleri Kaydet'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { paddingHorizontal: Spacing.containerMargin, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  backButton: { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...Typography.serifTitleLg, color: Colors.onSurface },
  form: { gap: Spacing.md },
  fieldGroup: { gap: Spacing.xs },
  row: { flexDirection: 'row', gap: Spacing.sm },
  rowItem: { flex: 1 },
  label: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  input: { ...Typography.bodyLg, color: Colors.onSurface, backgroundColor: Colors.surfaceContainer, borderRadius: Radius.lg, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  toggleRow: { flexDirection: 'row', gap: Spacing.sm },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm, borderRadius: Radius.lg, backgroundColor: Colors.surfaceContainer },
  toggleButtonActive: { backgroundColor: Colors.primary },
  toggleText: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  toggleTextActive: { color: Colors.onPrimary },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 8, borderRadius: Radius.lg, backgroundColor: Pastel.teal.tint },
  locationBtnText: { ...Typography.labelMd, color: Pastel.teal.text },
  coordText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: Spacing.xs, lineHeight: 16 },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  categoryChip: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainer },
  categoryChipActive: { backgroundColor: Colors.primary },
  categoryChipText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  categoryChipTextActive: { color: Colors.onPrimary },
  noteBox: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs, backgroundColor: Pastel.amber.tint, borderRadius: Radius.lg, padding: Spacing.sm },
  noteText: { ...Typography.labelSm, color: Pastel.amber.text, flex: 1, lineHeight: 16 },
  submitButton: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: Spacing.sm + 2, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { ...Typography.labelMd, color: Colors.onPrimary, fontSize: 14 },
});
