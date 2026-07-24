import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../../ui/Icon';
import { Colors, Typography, Spacing, Radius } from '../../../constants/theme';
import { CityDistrictPicker } from '../../location/CityDistrictPicker';
import type { LocationSelection } from '../../../types/location';

export type EmployeeProfileEditFormProps = {
  // Hakkında
  bio: string;
  onBioChange: (value: string) => void;
  maxBio?: number;

  // Şehir / İlçe (kayıt konumu)
  location: LocationSelection;
  onLocationChange: (value: LocationSelection) => void;

  // Tercih edilen bölge — atölye keşfinde "Yakınımdakiler" için GPS izni
  // yoksa kullanılan ilk fallback. Kayıt şehrinden farklı olabilir (örn.
  // işe gidip gelinen ilçe).
  preferredLocation: LocationSelection;
  onPreferredLocationChange: (value: LocationSelection) => void;

  // İlgi alanları
  interests: string[];
  interestInput: string;
  onInterestInputChange: (value: string) => void;
  onAddInterest: () => void;
  onRemoveInterest: (tag: string) => void;
  maxInterests?: number;

  // Hobiler
  hobbies: string[];
  hobbyInput: string;
  onHobbyInputChange: (value: string) => void;
  onAddHobby: () => void;
  onRemoveHobby: (tag: string) => void;
  maxHobbies?: number;
};

/**
 * Katılımcı (employee) edit-profile ekranının form gövdesi.
 * ProfileEditForm (Employer) ile aynı görsel dili paylaşır (bölüm başlıkları,
 * input/chip stilleri) ancak alan seti farklı olduğu için (Unvan/Uzmanlık/
 * Kategoriler yerine İlgi Alanları/Hobiler) ayrı bir component olarak
 * tutulur. Veri çekmez/kaydetmez — tamamen controlled'dır; fetch/save mantığı
 * app/(employee)/edit-profile.tsx içinde kalır.
 */
export function EmployeeProfileEditForm({
  bio,
  onBioChange,
  maxBio = 300,
  location,
  onLocationChange,
  preferredLocation,
  onPreferredLocationChange,
  interests,
  interestInput,
  onInterestInputChange,
  onAddInterest,
  onRemoveInterest,
  maxInterests = 12,
  hobbies,
  hobbyInput,
  onHobbyInputChange,
  onAddHobby,
  onRemoveHobby,
  maxHobbies = 12,
}: EmployeeProfileEditFormProps) {
  return (
    <>
      {/* Hakkında */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hakkında</Text>
        <TextInput
          style={styles.bioInput}
          placeholder="Kendinden bahset..."
          placeholderTextColor={Colors.onSurfaceVariant}
          value={bio}
          onChangeText={onBioChange}
          multiline
          maxLength={maxBio}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{bio.length}/{maxBio}</Text>
      </View>

      {/* Şehir / İlçe */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Şehir</Text>
        <CityDistrictPicker value={location} onChange={onLocationChange} />
      </View>

      {/* Tercih Edilen Bölge */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tercih Edilen Bölge</Text>
        <Text style={styles.helperText}>
          Atölye önerilerinde ve "Yakınımdakiler" listesinde konum iznin yoksa
          bu bölge esas alınır.
        </Text>
        <CityDistrictPicker
          value={preferredLocation}
          onChange={onPreferredLocationChange}
          cityLabel="Tercih Edilen Şehir"
          districtLabel="Tercih Edilen İlçe"
        />
      </View>

      {/* İlgi Alanları */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>İlgi Alanları</Text>
        {interests.length > 0 && (
          <View style={styles.tagList}>
            {interests.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.tagChip}
                onPress={() => onRemoveInterest(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.tagText}>{item}</Text>
                <Icon name="closeCircle" size={14} color={Colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        {interests.length < maxInterests && (
          <View style={styles.tagInputRow}>
            <TextInput
              style={styles.tagInput}
              placeholder="Yeni ilgi alanı ekle"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={interestInput}
              onChangeText={onInterestInputChange}
              onSubmitEditing={onAddInterest}
              returnKeyType="done"
              maxLength={30}
            />
            <TouchableOpacity
              style={[styles.addTagBtn, !interestInput.trim() && styles.addTagBtnDisabled]}
              onPress={onAddInterest}
              disabled={!interestInput.trim()}
              accessibilityRole="button"
              accessibilityLabel="İlgi alanı ekle"
            >
              <Icon name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Hobiler */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hobiler</Text>
        {hobbies.length > 0 && (
          <View style={styles.tagList}>
            {hobbies.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.tagChip}
                onPress={() => onRemoveHobby(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.tagText}>{item}</Text>
                <Icon name="closeCircle" size={14} color={Colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        {hobbies.length < maxHobbies && (
          <View style={styles.tagInputRow}>
            <TextInput
              style={styles.tagInput}
              placeholder="Yeni hobi ekle"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={hobbyInput}
              onChangeText={onHobbyInputChange}
              onSubmitEditing={onAddHobby}
              returnKeyType="done"
              maxLength={30}
            />
            <TouchableOpacity
              style={[styles.addTagBtn, !hobbyInput.trim() && styles.addTagBtnDisabled]}
              onPress={onAddHobby}
              disabled={!hobbyInput.trim()}
              accessibilityRole="button"
              accessibilityLabel="Hobi ekle"
            >
              <Icon name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.gutter },
  sectionLabel: { ...Typography.labelMd, color: Colors.onSurfaceVariant, textTransform: 'none', marginBottom: Spacing.sm, letterSpacing: 0 },
  helperText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm, lineHeight: 16 },
  input: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onSurface,
  },
  bioInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onSurface,
    minHeight: 90,
  },
  charCount: { ...Typography.labelSm, color: Colors.onSurfaceVariant, textAlign: 'right', marginTop: 6 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: Colors.primaryLighter,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontSize: 13, color: Colors.primaryDarker, fontWeight: '500' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onSurface,
  },
  addTagBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  addTagBtnDisabled: { backgroundColor: Colors.primaryLighter },
});
