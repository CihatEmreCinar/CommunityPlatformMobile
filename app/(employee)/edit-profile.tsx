import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { employeeService } from '../../services/employeeService';
import type { EmployeeProfile } from '../../services/employeeService';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { FormHeader } from '../../components/layout/FormHeader';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';

const ACCENT = '#6366F1';

export default function EditEmployeeProfileScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [interestInput, setInterestInput] = useState('');
  const [hobbyInput, setHobbyInput] = useState('');

  useEffect(() => {
    employeeService.getProfile()
      .then((profile: EmployeeProfile) => {
        setInterests(profile.interests ?? []);
        setHobbies(profile.hobbies ?? []);
        setBio(profile.bio ?? '');
        setCity(profile.city ?? '');
        setAvatarUrl(profile.avatarUrl ?? null);
      })
      .catch(() => Alert.alert('Hata', 'Profil yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const addInterest = useCallback(() => {
    const clean = interestInput.trim();
    if (!clean || interests.includes(clean)) {
      setInterestInput('');
      return;
    }
    setInterests((prev) => [...prev, clean]);
    setInterestInput('');
  }, [interestInput, interests]);

  const removeInterest = useCallback((item: string) => {
    setInterests((prev) => prev.filter((value) => value !== item));
  }, []);

  const addHobby = useCallback(() => {
    const clean = hobbyInput.trim();
    if (!clean || hobbies.includes(clean)) {
      setHobbyInput('');
      return;
    }
    setHobbies((prev) => [...prev, clean]);
    setHobbyInput('');
  }, [hobbyInput, hobbies]);

  const removeHobby = useCallback((item: string) => {
    setHobbies((prev) => prev.filter((value) => value !== item));
  }, []);

  const handlePickImage = useCallback(async () => {
    const previousAvatarUrl = avatarUrl;
    setUploadingPhoto(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri izni vermelisin.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setAvatarUrl(asset.uri);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as any);

      const uploaded = await userService.uploadAvatar(formData);
      setAvatarUrl(uploaded.url);
      await refreshUser();
    } catch {
      setAvatarUrl(previousAvatarUrl);
      Alert.alert('Hata', 'Profil fotoğrafı yüklenemedi. Lütfen tekrar dene.');
    } finally {
      setUploadingPhoto(false);
    }
  }, [avatarUrl, refreshUser]);

  const handleSave = useCallback(async () => {
    if (uploadingPhoto) {
      Alert.alert('Lütfen bekle', 'Profil fotoğrafı yüklenirken kaydetme işlemi başlatılamaz.');
      return;
    }

    setSaving(true);
    try {
      await employeeService.updateProfile({
        interests,
        hobbies,
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
        avatarUrl: avatarUrl ?? undefined,
      });
      await refreshUser();
      router.back();
    } catch {
      Alert.alert('Hata', 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  }, [uploadingPhoto, interests, hobbies, bio, city, avatarUrl, refreshUser, router]);

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
          saving={saving || uploadingPhoto}
          accentColor={ACCENT}
        />
      }
    >
      <View style={styles.photoSection}>
        <TouchableOpacity onPress={handlePickImage} disabled={uploadingPhoto} style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>Foto</Text>
            </View>
          )}
          {uploadingPhoto ? (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : null}
        </TouchableOpacity>
        <Text style={styles.photoHint}>
          {uploadingPhoto ? 'Fotoğraf yükleniyor...' : 'Fotoğrafı değiştirmek için dokun'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Şehir</Text>
        <TextInput
          style={styles.input}
          placeholder="örn. İstanbul"
          placeholderTextColor="#9CA3AF"
          value={city}
          onChangeText={setCity}
          maxLength={60}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hakkında</Text>
        <TextInput
          style={styles.bioInput}
          placeholder="Kendinden bahset..."
          placeholderTextColor="#9CA3AF"
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={300}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{bio.length}/300</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>İlgi Alanları</Text>
        <View style={styles.tagList}>
          {interests.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.tagChip}
              onPress={() => removeInterest(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.tagText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tagInputRow}>
          <TextInput
            style={styles.input}
            placeholder="Yeni ilgi alanı ekle"
            placeholderTextColor="#9CA3AF"
            value={interestInput}
            onChangeText={setInterestInput}
            onSubmitEditing={addInterest}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addBtn, !interestInput.trim() && styles.disabledBtn]}
            onPress={addInterest}
            disabled={!interestInput.trim()}
          >
            <Text style={styles.addBtnText}>Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hobiler</Text>
        <View style={styles.tagList}>
          {hobbies.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.tagChip}
              onPress={() => removeHobby(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.tagText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tagInputRow}>
          <TextInput
            style={styles.input}
            placeholder="Yeni hobi ekle"
            placeholderTextColor="#9CA3AF"
            value={hobbyInput}
            onChangeText={setHobbyInput}
            onSubmitEditing={addHobby}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addBtn, !hobbyInput.trim() && styles.disabledBtn]}
            onPress={addHobby}
            disabled={!hobbyInput.trim()}
          >
            <Text style={styles.addBtnText}>Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  photoSection: { alignItems: 'center', paddingTop: 20, gap: 8 },
  avatarWrap: { borderRadius: 48, overflow: 'hidden' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  avatarLoadingOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.35)', alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderText: { fontSize: 15, fontWeight: '700', color: ACCENT },
  photoHint: { fontSize: 12, color: '#9CA3AF' },
  section: { paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 12 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tagChip: { backgroundColor: '#EEF2FF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  tagText: { fontSize: 13, color: '#1D4ED8' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827' },
  bioInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827', minHeight: 90 },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right' },
  addBtn: { backgroundColor: ACCENT, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#FFFFFF', fontWeight: '700' },
  disabledBtn: { opacity: 0.48 },
});
