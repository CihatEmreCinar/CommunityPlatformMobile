import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { employerService } from '../../services/employerService';
import { categoryService } from '../../services/categoryService';
import type { EmployerProfile } from '../../services/employerService';
import type { Category } from '../../types/category';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { FormHeader } from '../../components/layout/FormHeader';
import { ProfileEditForm } from '../../components/layout/profile/ProfileEditForm';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';

const ACCENT = '#6366F1'; // employee tab'lerindeki mevcut accent renk ile aynı
const MAX_BIO = 300;
const MAX_SPECIALIZATION = 8;

export default function EditEmployerProfileScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [specInput, setSpecInput] = useState('');
  const [specialization, setSpecialization] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [city, setCity] = useState('');

  useEffect(() => {
    Promise.all([employerService.getProfile(), categoryService.getAll()])
      .then(([p, cats]: [EmployerProfile, Category[]]) => {
        setCategories(cats);
        setTitle(p.workshopTitle ?? '');
        setBio(p.bio ?? '');
        setYearsExperience(p.yearsExperience != null ? String(p.yearsExperience) : '');
        setSpecialization(p.specialization ?? []);
        setSelectedCategoryIds(p.categoryIds ?? []);
        setProfileImageUrl(p.profileImageUrl ?? null);
        setCoverImageUrl(p.coverImageUrl ?? null);
        setCity(p.city ?? '');
      })
      .catch(() => Alert.alert('Hata', 'Profil yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePickImage = useCallback(async () => {
    const previousAvatarUrl = profileImageUrl;
    setUploadingPhoto(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri izni vermelisin.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setProfileImageUrl(asset.uri);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as any);

      const uploaded = await userService.uploadAvatar(formData);
      setProfileImageUrl(uploaded.url || asset.uri);
      await refreshUser();
    } catch {
      setProfileImageUrl(previousAvatarUrl);
      Alert.alert('Hata', 'Profil fotoğrafı yüklenemedi. Lütfen tekrar dene.');
    } finally {
      setUploadingPhoto(false);
    }
  }, [profileImageUrl, refreshUser]);

  const handlePickCoverImage = useCallback(async () => {
    const previousCoverUrl = coverImageUrl;
    setUploadingCover(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Kapak görseli seçmek için galeri izni vermelisin.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setCoverImageUrl(asset.uri);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? `cover-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as any);

      const uploaded = await employerService.uploadEmployerCover(formData);
      setCoverImageUrl(uploaded.url || asset.uri);
      await refreshUser();
    } catch {
      setCoverImageUrl(previousCoverUrl);
      Alert.alert('Hata', 'Kapak görseli yüklenemedi. Lütfen tekrar dene.');
    } finally {
      setUploadingCover(false);
    }
  }, [coverImageUrl, refreshUser]);

  const addSpecialization = useCallback(() => {
    const clean = specInput.trim();
    if (!clean || specialization.includes(clean)) { setSpecInput(''); return; }
    if (specialization.length >= MAX_SPECIALIZATION) {
      Alert.alert(`En fazla ${MAX_SPECIALIZATION} uzmanlık alanı ekleyebilirsin.`);
      return;
    }
    setSpecialization((prev) => [...prev, clean]);
    setSpecInput('');
  }, [specInput, specialization]);

  const removeSpecialization = useCallback((tag: string) => {
    setSpecialization((prev) => prev.filter((t) => t !== tag));
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Unvan gerekli', 'Lütfen bir unvan/başlık gir.');
      return;
    }

    if (uploadingPhoto || uploadingCover) {
      Alert.alert('Lütfen bekle', 'Görsel yükleme tamamlanmadan profil kaydedilemez.');
      return;
    }

    setSaving(true);
    try {
      await employerService.updateProfile({
        workshopTitle: title.trim(),
        bio: bio.trim() || undefined,
        yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
        specialization,
        categoryIds: selectedCategoryIds,
        profileImageUrl: profileImageUrl ?? undefined,
        coverImageUrl: coverImageUrl ?? undefined,
        city: city.trim() || undefined,
      });
      await refreshUser();
      router.back();
    } catch {
      Alert.alert('Hata', 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  }, [title, uploadingPhoto, uploadingCover, bio, yearsExperience, specialization, selectedCategoryIds, profileImageUrl, coverImageUrl, city, refreshUser, router]);

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
          title="Profili Düzenle"
          onClose={() => router.back()}
          onSave={handleSave}
          saving={saving || uploadingPhoto || uploadingCover}
          accentColor={ACCENT}
        />
      }
    >
      <ProfileEditForm
        photoUrl={profileImageUrl}
        onPickPhoto={handlePickImage}
        uploadingPhoto={uploadingPhoto}
        coverImageUrl={coverImageUrl}
        onPickCoverImage={handlePickCoverImage}
        uploadingCoverImage={uploadingCover}
        titleLabel="Unvan"
        titlePlaceholder="örn. Seramik Meraklısı"
        title={title}
        onTitleChange={setTitle}
        bio={bio}
        onBioChange={setBio}
        maxBio={MAX_BIO}
        city={city}
        onCityChange={setCity}
        yearsExperience={yearsExperience}
        onYearsExperienceChange={setYearsExperience}
        specialization={specialization}
        specInput={specInput}
        onSpecInputChange={setSpecInput}
        onAddSpecialization={addSpecialization}
        onRemoveSpecialization={removeSpecialization}
        maxSpecialization={MAX_SPECIALIZATION}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onToggleCategory={toggleCategory}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
});
