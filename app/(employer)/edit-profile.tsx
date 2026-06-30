import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { employerService } from '../../services/employerService';
import { categoryService } from '../../services/categoryService';
import type { EmployerProfile } from '../../services/employerService';
import type { Category } from '../../types/category';

const ACCENT = '#0F766E';
const MAX_BIO = 300;
const MAX_SPECIALIZATION = 8;

export default function EditEmployerProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [workshopTitle, setWorkshopTitle] = useState('');
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [specInput, setSpecInput] = useState('');
  const [specialization, setSpecialization] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // ─── Yükle ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([employerService.getProfile(), categoryService.getAll()])
      .then(([p, cats]) => {
        setProfile(p);
        setCategories(cats);
        setWorkshopTitle(p.workshopTitle ?? '');
        setBio(p.bio ?? '');
        setYearsExperience(p.yearsExperience != null ? String(p.yearsExperience) : '');
        setSpecialization(p.specialization ?? []);
        setSelectedCategoryIds(p.categoryIds ?? []);
        setProfileImageUrl(p.profileImageUrl ?? null);
      })
      .catch(() => Alert.alert('Hata', 'Profil yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  // ─── Fotoğraf seç ve yükle ──────────────────────────────────────────────────
  const handlePickImage = useCallback(async () => {
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
    // TODO: Backend'de upload endpoint'i netleşince employerService.uploadProfileImage
    // eklenip burası aktif edilecek. Şimdilik yerel URI'yi geçici önizleme olarak kullan,
    // kaydetme isteğine dahil edilmiyor.
    setProfileImageUrl(asset.uri);
    Alert.alert(
      'Önizleme',
      'Fotoğraf seçildi ancak yükleme henüz aktif değil — bu özellik yakında eklenecek.'
    );
  }, []);

  // ─── Uzmanlık tag ekle/çıkar ────────────────────────────────────────────────
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
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  // ─── Kaydet ────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!workshopTitle.trim()) {
      Alert.alert('Unvan gerekli', 'Lütfen bir unvan/başlık gir.');
      return;
    }
    setSaving(true);
    try {
      await employerService.updateProfile({
        workshopTitle: workshopTitle.trim(),
        bio: bio.trim() || undefined,
        yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
        specialization,
        categoryIds: selectedCategoryIds,
        // profileImageUrl henüz gönderilmiyor — upload endpoint'i hazır olunca eklenecek
      });
      router.back();
    } catch {
      Alert.alert('Hata', 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  }, [workshopTitle, bio, yearsExperience, specialization, selectedCategoryIds, profileImageUrl, router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {/* Fotoğraf */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handlePickImage} disabled={uploadingPhoto} style={styles.avatarWrap}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              {uploadingPhoto ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="camera" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Fotoğrafı değiştirmek için dokun</Text>
        </View>

        {/* Unvan */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Unvan</Text>
          <TextInput
            style={styles.input}
            placeholder="örn. Resim Eğitmeni"
            placeholderTextColor="#9CA3AF"
            value={workshopTitle}
            onChangeText={setWorkshopTitle}
            maxLength={80}
          />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hakkında</Text>
          <TextInput
            style={styles.bioInput}
            placeholder="Kendinden ve atölyelerinden bahset..."
            placeholderTextColor="#9CA3AF"
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={MAX_BIO}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bio.length}/{MAX_BIO}</Text>
        </View>

        {/* Deneyim */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Deneyim (yıl)</Text>
          <TextInput
            style={styles.input}
            placeholder="örn. 5"
            placeholderTextColor="#9CA3AF"
            value={yearsExperience}
            onChangeText={(t) => setYearsExperience(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        {/* Uzmanlık alanları */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Uzmanlık alanları</Text>
          {specialization.length > 0 && (
            <View style={styles.tagList}>
              {specialization.map((s) => (
                <TouchableOpacity key={s} style={styles.tagChip} onPress={() => removeSpecialization(s)} activeOpacity={0.7}>
                  <Text style={styles.tagText}>{s}</Text>
                  <Ionicons name="close-circle" size={14} color={ACCENT} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {specialization.length < MAX_SPECIALIZATION && (
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Uzmanlık ekle..."
                placeholderTextColor="#9CA3AF"
                value={specInput}
                onChangeText={setSpecInput}
                onSubmitEditing={addSpecialization}
                returnKeyType="done"
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.addTagBtn, !specInput.trim() && styles.addTagBtnDisabled]}
                onPress={addSpecialization}
                disabled={!specInput.trim()}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Kategoriler */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kategoriler</Text>
          <View style={styles.categoryGrid}>
            {categories.map((c) => {
              const selected = selectedCategoryIds.includes(c.id);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                  onPress={() => toggleCategory(c.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  saveBtn: { backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, minWidth: 72, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#99D6D0' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  body: { flex: 1 },
  photoSection: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  avatarWrap: { position: 'relative' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  photoHint: { fontSize: 12, color: '#9CA3AF' },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827' },
  bioInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827', minHeight: 90 },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: 6 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#99D6D0', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 13, color: ACCENT, fontWeight: '500' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagInput: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827' },
  addTagBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  addTagBtnDisabled: { backgroundColor: '#99D6D0' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 },
  categoryChipSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  categoryChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  categoryChipTextSelected: { color: '#FFFFFF' },
});
