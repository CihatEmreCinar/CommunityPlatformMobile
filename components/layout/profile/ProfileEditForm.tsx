import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../../ui/Icon';
import type { Category } from '../../../types/category';
import { CityDistrictPicker } from '../../location/CityDistrictPicker';
import type { LocationSelection } from '../../../types/location';

const ACCENT = '#0F766E';

export type ProfileEditFormProps = {
  // Unvan
  titleLabel?: string;
  titlePlaceholder?: string;
  title: string;
  onTitleChange: (value: string) => void;

  // Hakkında
  bio: string;
  onBioChange: (value: string) => void;
  maxBio?: number;

  // Şehir / İlçe
  location: LocationSelection;
  onLocationChange: (value: LocationSelection) => void;

  // Deneyim
  yearsExperience: string;
  onYearsExperienceChange: (value: string) => void;
  showExperience?: boolean;

  // Uzmanlık alanları
  specialization: string[];
  specInput: string;
  onSpecInputChange: (value: string) => void;
  onAddSpecialization: () => void;
  onRemoveSpecialization: (tag: string) => void;
  maxSpecialization?: number;
  showSpecialization?: boolean;

  // Kategoriler
  categories: Category[];
  selectedCategoryIds: string[];
  onToggleCategory: (id: string) => void;
};

/**
 * Employer ve employee edit-profile ekranlarının ortak gövdesi.
 * Bu component veri çekmez / kaydetmez — tamamen controlled'dır.
 * Fetch/save mantığı her rolün kendi ekran dosyasında (kendi service'iyle) kalır,
 * böylece iki taraf aynı UI'ı, farklı veri kaynaklarıyla besleyebilir.
 */
export function ProfileEditForm({
  titleLabel = 'Unvan',
  titlePlaceholder = 'örn. Resim Eğitmeni',
  title,
  onTitleChange,
  bio,
  onBioChange,
  maxBio = 300,
  location,
  onLocationChange,
  yearsExperience,
  onYearsExperienceChange,
  showExperience = true,
  specialization,
  specInput,
  onSpecInputChange,
  onAddSpecialization,
  onRemoveSpecialization,
  maxSpecialization = 8,
  showSpecialization = true,
  categories,
  selectedCategoryIds,
  onToggleCategory,
}: ProfileEditFormProps) {
  return (
    <>
      {/* Unvan */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{titleLabel}</Text>
        <TextInput
          style={styles.input}
          placeholder={titlePlaceholder}
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={onTitleChange}
          maxLength={80}
        />
      </View>

      {/* Hakkında */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hakkında</Text>
        <TextInput
          style={styles.bioInput}
          placeholder="Kendinden bahset..."
          placeholderTextColor="#9CA3AF"
          value={bio}
          onChangeText={onBioChange}
          multiline
          maxLength={maxBio}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{bio.length}/{maxBio}</Text>
      </View>

      <View style={styles.section}>
        <CityDistrictPicker value={location} onChange={onLocationChange} />
      </View>

      {/* Deneyim */}
      {showExperience && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Deneyim (yıl)</Text>
          <TextInput
            style={styles.input}
            placeholder="örn. 5"
            placeholderTextColor="#9CA3AF"
            value={yearsExperience}
            onChangeText={(t) => onYearsExperienceChange(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
      )}

      {/* Uzmanlık alanları */}
      {showSpecialization && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Uzmanlık alanları</Text>
          {specialization.length > 0 && (
            <View style={styles.tagList}>
              {specialization.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.tagChip}
                  onPress={() => onRemoveSpecialization(s)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagText}>{s}</Text>
                  <Icon name="closeCircle" size={14} color={ACCENT} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {specialization.length < maxSpecialization && (
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Uzmanlık ekle..."
                placeholderTextColor="#9CA3AF"
                value={specInput}
                onChangeText={onSpecInputChange}
                onSubmitEditing={onAddSpecialization}
                returnKeyType="done"
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.addTagBtn, !specInput.trim() && styles.addTagBtnDisabled]}
                onPress={onAddSpecialization}
                disabled={!specInput.trim()}
              >
                <Icon name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Kategoriler */}
      {categories.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kategoriler</Text>
          <View style={styles.categoryGrid}>
            {categories.map((c) => {
              const selected = selectedCategoryIds.includes(c.id);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                  onPress={() => onToggleCategory(c.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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