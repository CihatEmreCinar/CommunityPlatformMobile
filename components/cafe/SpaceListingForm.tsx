import React, { useMemo, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';
import { type SpaceListing, type SpaceListingRequest } from '../../services/spaceListingService';

type SpaceListingFormProps = {
  initialData?: Partial<SpaceListing>;
  existingPhotoUrls?: string[];
  onSubmit: (request: SpaceListingRequest, newPhotos: string[]) => Promise<void>;
  submitting: boolean;
  submitLabel: string;
};

export function SpaceListingForm({
  initialData,
  existingPhotoUrls = [],
  onSubmit,
  submitting,
  submitLabel,
}: SpaceListingFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [capacity, setCapacity] = useState(initialData?.capacity ? String(initialData.capacity) : '');
  const [hourlyPrice, setHourlyPrice] = useState(initialData?.hourlyPrice ? String(initialData.hourlyPrice) : '');
  const [city, setCity] = useState(initialData?.city ?? '');
  const [amenitiesText, setAmenitiesText] = useState((initialData?.amenities ?? []).join(', '));
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  const amenities = useMemo(
    () => amenitiesText.split(',').map((item) => item.trim()).filter(Boolean),
    [amenitiesText]
  );

  function validate(): string | null {
    if (!title.trim()) return 'Başlık zorunludur.';
    if (!capacity || Number.isNaN(Number(capacity)) || Number(capacity) < 1) return 'Geçerli kapasite girin.';
    if (!hourlyPrice || Number.isNaN(Number(hourlyPrice)) || Number(hourlyPrice) < 0) return 'Geçerli saatlik fiyat girin.';
    return null;
  }

  async function handlePickPhotos() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri izni vermelisin.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setPhotoUris((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
    }
  }

  async function handleSubmit() {
    const error = validate();
    if (error) {
      Alert.alert('Hata', error);
      return;
    }

    await onSubmit(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        capacity: Number(capacity),
        hourlyPrice: Number(hourlyPrice),
        city: city.trim() || undefined,
        amenities,
      },
      photoUris
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.label}>Başlık *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Örn. Şık toplantı alanı"
          placeholderTextColor={Colors.outlineVariant}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="İlan açıklaması"
          placeholderTextColor={Colors.outlineVariant}
          textAlignVertical="top"
        />
      </View>

      <View style={[styles.section, styles.row]}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Kapasite *</Text>
          <TextInput
            style={styles.input}
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="number-pad"
            placeholder="12"
            placeholderTextColor={Colors.outlineVariant}
          />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Saatlik Fiyat *</Text>
          <TextInput
            style={styles.input}
            value={hourlyPrice}
            onChangeText={setHourlyPrice}
            keyboardType="decimal-pad"
            placeholder="250"
            placeholderTextColor={Colors.outlineVariant}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Şehir</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="İstanbul"
          placeholderTextColor={Colors.outlineVariant}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Olanaklar</Text>
        <TextInput
          style={styles.input}
          value={amenitiesText}
          onChangeText={setAmenitiesText}
          placeholder="Wi-Fi, proje, klima"
          placeholderTextColor={Colors.outlineVariant}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Fotoğraflar</Text>
        <TouchableOpacity style={styles.photoButton} onPress={handlePickPhotos} disabled={submitting}>
          <Icon name="photoLibrary" size={20} color={Pastel.coral.text} />
          <Text style={styles.photoText}>{photoUris.length > 0 ? `${photoUris.length} fotoğraf seçildi` : 'Fotoğraf ekle'}</Text>
        </TouchableOpacity>
        {(existingPhotoUrls.length > 0 || photoUris.length > 0) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoPreviewRow}>
            {existingPhotoUrls.map((uri) => (
              <Image key={`existing-${uri}`} source={{ uri }} style={styles.photoPreview} />
            ))}
            {photoUris.map((uri) => (
              <Image key={`new-${uri}`} source={{ uri }} style={styles.photoPreview} />
            ))}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity style={[styles.submitButton, submitting && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
        <Text style={styles.submitButtonText}>{submitting ? 'Kaydediliyor...' : submitLabel}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formContent: { padding: Spacing.md, gap: Spacing.sm },
  section: { backgroundColor: Pastel.coral.tint, borderRadius: Radius.xxl, padding: Spacing.md, gap: Spacing.xs },
  row: { flexDirection: 'row', gap: Spacing.sm },
  rowItem: { flex: 1, gap: Spacing.xs },
  label: { ...Typography.labelMd, color: Colors.onSurface },
  input: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, ...Typography.bodyMd, color: Colors.onSurface },
  textArea: { minHeight: 100 },
  photoButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, backgroundColor: Colors.surfaceContainerLowest },
  photoText: { ...Typography.labelMd, color: Pastel.coral.text },
  photoPreviewRow: { marginTop: Spacing.sm, gap: Spacing.sm },
  photoPreview: { width: 100, height: 80, borderRadius: Radius.lg, marginRight: Spacing.sm, backgroundColor: Colors.surfaceContainer },
  submitButton: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: Spacing.md, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xs },
  submitButtonDisabled: { opacity: 0.65 },
  submitButtonText: { ...Typography.labelMd, color: Colors.onPrimary },
});
