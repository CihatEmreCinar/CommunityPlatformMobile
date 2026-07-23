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
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { useAuth } from '../../contexts/AuthContext';
import { EMPTY_LOCATION_SELECTION, type LocationSelection } from '../../types/location';
import { Colors } from '../../constants/theme';

const ACCENT = Colors.primary;
const MAX_BIO = 300;
const MAX_SPECIALIZATION = 8;

export default function EditEmployerProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);

  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [specInput, setSpecInput] = useState('');
  const [specialization, setSpecialization] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationSelection>(EMPTY_LOCATION_SELECTION);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([employerService.getProfile(), categoryService.getAll()])
      .then(([p, cats]: [EmployerProfile, Category[]]) => {
        setCategories(cats);
        setTitle(p.workshopTitle ?? '');
        setBio(p.bio ?? '');
        setYearsExperience(p.yearsExperience != null ? String(p.yearsExperience) : '');
        setSpecialization(p.specialization ?? []);
        setSelectedCategoryIds(p.categoryIds ?? []);
        setLocation({
          cityId: p.cityId ?? null,
          cityName: p.city ?? null,
          districtId: p.districtId ?? null,
          districtName: p.district ?? null,
        });
        setProfileImageUrl(p.profileImageUrl ?? null);
        setCoverImageUrl(p.coverImageUrl ?? null);
      })
      .catch(() => Alert.alert('Hata', 'Profil yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri izni vermelisin.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    setProfileImageUrl(result.assets[0].uri);
    Alert.alert('Önizleme', 'Fotoğraf seçildi ancak yükleme henüz aktif değil — bu özellik yakında eklenecek.');
  }, []);

  const handlePickCover = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Kapak görseli seçmek için galeri izni vermelisin.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 9], quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploadingCoverImage(true);
    try {
      const extension = asset.uri.split('.').pop()?.split('?')[0] ?? 'jpg';
      const formData = new FormData();
      formData.append('file', { uri: asset.uri, name: `cover_${Date.now()}.${extension}`, type: 'image/jpeg' } as any);
      const res = await employerService.uploadEmployerCover(formData);
      setCoverImageUrl(res.url);
    } catch {
      Alert.alert('Hata', 'Kapak görseli yüklenemedi.');
    } finally {
      setUploadingCoverImage(false);
    }
  }, []);

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
    setSaving(true);
    try {
      await employerService.updateProfile({
        workshopTitle: title.trim(),
        bio: bio.trim() || undefined,
        cityId: location.cityId ?? undefined,
        districtId: location.districtId ?? undefined,
        yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
        specialization,
        categoryIds: selectedCategoryIds,
      });
      router.back();
    } catch {
      Alert.alert('Hata', 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  }, [title, bio, location, yearsExperience, specialization, selectedCategoryIds, router]);

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
      header={<FormHeader title="Profili Düzenle" onClose={() => router.back()} onSave={handleSave} saving={saving} accentColor={ACCENT} />}
    >
      <ProfileHeader
        editable
        coverUrl={coverImageUrl}
        avatarUrl={profileImageUrl}
        fullName={user ? `${user.firstName} ${user.lastName}` : ''}
        roleLabel="Eğitmen"
        onPickCover={handlePickCover}
        onPickAvatar={handlePickImage}
        uploadingCover={uploadingCoverImage}
        uploadingAvatar={uploadingPhoto}
      />
      <ProfileEditForm
        titleLabel="Unvan"
        titlePlaceholder="örn. Seramik Meraklısı"
        title={title}
        onTitleChange={setTitle}
        bio={bio}
        onBioChange={setBio}
        maxBio={MAX_BIO}
        location={location}
        onLocationChange={setLocation}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
});
