import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { FormHeader } from '../../components/layout/FormHeader';
import { ProfileEditForm } from '../../components/layout/profile/ProfileEditForm';
import { cafeProfileService } from '../../services/cafeProfileService';
import type { Category } from '../../types/category';
import { Colors } from '../../constants/theme';

const ACCENT = '#6366F1';
const MAX_BIO = 300;

export default function EditCafeProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [profile, cats] = await Promise.all([cafeProfileService.getMe(), cafeProfileService.getCategories()]);
        setName(profile.name ?? '');
        setBio(profile.bio ?? '');
        setCity(profile.city ?? '');
        setAddress(profile.address ?? '');
        setAvatarUrl(profile.avatarUrl ?? null);
        setCoverUrl(profile.coverImageUrl ?? null);
        setCategories(cats);
        setSelectedCategoryIds(profile.categoryIds ?? []);
      } catch {
        Alert.alert('Hata', 'Profil yüklenemedi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pickImage = useCallback(async (type: 'avatar' | 'cover') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri izni vermelisin.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    try {
      if (type === 'avatar') {
        setUploadingPhoto(true);
        const response = await cafeProfileService.uploadAvatar(result.assets[0].uri);
        setAvatarUrl(response.url);
      } else {
        setUploadingCover(true);
        const response = await cafeProfileService.uploadCover(result.assets[0].uri);
        setCoverUrl(response.url);
      }
    } catch {
      Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
    } finally {
      setUploadingPhoto(false);
      setUploadingCover(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Unvan gerekli', 'Lütfen bir isim gir.');
      return;
    }

    setSaving(true);
    try {
      await cafeProfileService.updateMe({
        name: name.trim(),
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      });
      router.back();
    } catch {
      Alert.alert('Hata', 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  }, [address, bio, city, name, router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <ScreenContainer
      edges={['top', 'bottom']}
      header={
        <FormHeader
          title="Cafe Profili"
          onClose={() => router.back()}
          onSave={handleSave}
          saving={saving}
          accentColor={ACCENT}
        />
      }
    >
      <ProfileEditForm
        photoUrl={avatarUrl}
        onPickPhoto={() => pickImage('avatar')}
        uploadingPhoto={uploadingPhoto}
        coverImageUrl={coverUrl}
        onPickCoverImage={() => pickImage('cover')}
        uploadingCoverImage={uploadingCover}
        titleLabel="İsim"
        titlePlaceholder="Cafe adınız"
        title={name}
        onTitleChange={setName}
        bio={bio}
        onBioChange={setBio}
        maxBio={MAX_BIO}
        city={city}
        onCityChange={setCity}
        yearsExperience=""
        onYearsExperienceChange={() => {}}
        specialization={[]}
        specInput=""
        onSpecInputChange={() => {}}
        onAddSpecialization={() => {}}
        onRemoveSpecialization={() => {}}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onToggleCategory={(id) => setSelectedCategoryIds((prev) =>
          prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        )}
      />

      <View style={styles.section}>
        <View style={styles.inputGroup}>
          <Text style={styles.sectionLabel}>Adres</Text>
          <TextInput
            style={styles.input}
            placeholder="Adres"
            placeholderTextColor="#9CA3AF"
            value={address}
            onChangeText={setAddress}
            multiline
            maxLength={120}
            textAlignVertical="top"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  inputGroup: { gap: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827', minHeight: 70 },
});
