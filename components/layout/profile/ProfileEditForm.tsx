import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../../ui/Icon';
import type { Category } from '../../../types/category';
import { CityDistrictPicker } from '../../location/CityDistrictPicker';
import type { LocationSelection } from '../../../types/location';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';

export type ProfileEditFormProps = {
  titleLabel?: string;
  titlePlaceholder?: string;
  title: string;
  onTitleChange: (value: string) => void;
  bio: string;
  onBioChange: (value: string) => void;
  maxBio?: number;
  location: LocationSelection;
  onLocationChange: (value: LocationSelection) => void;
  yearsExperience: string;
  onYearsExperienceChange: (value: string) => void;
  showExperience?: boolean;
  specialization: string[];
  specInput: string;
  onSpecInputChange: (value: string) => void;
  onAddSpecialization: () => void;
  onRemoveSpecialization: (tag: string) => void;
  maxSpecialization?: number;
  showSpecialization?: boolean;
  categories: Category[];
  selectedCategoryIds: string[];
  onToggleCategory: (id: string) => void;
};

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
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{titleLabel}</Text>
        <TextInput style={styles.input} placeholder={titlePlaceholder} placeholderTextColor={Colors.outline} value={title} onChangeText={onTitleChange} maxLength={80} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hakkında</Text>
        <TextInput
          style={styles.bioInput}
          placeholder="Kendinden bahset..."
          placeholderTextColor={Colors.outline}
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

      {showExperience && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Deneyim (yıl)</Text>
          <TextInput
            style={styles.input}
            placeholder="örn. 5"
            placeholderTextColor={Colors.outline}
            value={yearsExperience}
            onChangeText={(t) => onYearsExperienceChange(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
      )}

      {showSpecialization && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Uzmanlık alanları</Text>
          {specialization.length > 0 && (
            <View style={styles.tagList}>
              {specialization.map((s) => (
                <TouchableOpacity key={s} style={styles.tagChip} onPress={() => onRemoveSpecialization(s)} activeOpacity={0.7}>
                  <Text style={styles.tagText}>{s}</Text>
                  <Icon name="closeCircle" size={13} color={Pastel.teal.text} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {specialization.length < maxSpecialization && (
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Uzmanlık ekle..."
                placeholderTextColor={Colors.outline}
                value={specInput}
                onChangeText={onSpecInputChange}
                onSubmitEditing={onAddSpecialization}
                returnKeyType="done"
                maxLength={30}
              />
              <TouchableOpacity style={[styles.addTagBtn, !specInput.trim() && styles.addTagBtnDisabled]} onPress={onAddSpecialization} disabled={!specInput.trim()}>
                <Icon name="add" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

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
                  <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>{c.name}</Text>
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
  section: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
  sectionLabel: { ...Typography.labelMd, color: Colors.onSurface, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surfaceContainer, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, ...Typography.bodyMd, color: Colors.onSurface },
  bioInput: { backgroundColor: Colors.surfaceContainer, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, ...Typography.bodyMd, color: Colors.onSurface, minHeight: 90 },
  charCount: { ...Typography.labelSm, color: Colors.outline, textAlign: 'right', marginTop: 6 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Pastel.teal.tintStrong, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { ...Typography.labelSm, color: Pastel.teal.text, fontWeight: '600' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagInput: { flex: 1, backgroundColor: Colors.surfaceContainer, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, ...Typography.bodyMd, color: Colors.onSurface },
  addTagBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  addTagBtnDisabled: { backgroundColor: Colors.outlineVariant },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { backgroundColor: Colors.surfaceContainer, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 7 },
  categoryChipSelected: { backgroundColor: Colors.primary },
  categoryChipText: { ...Typography.labelSm, color: Colors.onSurface, fontWeight: '600' },
  categoryChipTextSelected: { color: '#FFFFFF' },
});
