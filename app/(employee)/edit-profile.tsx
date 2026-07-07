import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { employeeService } from '../../services/employeeService';
import type { EmployeeProfile } from '../../services/employeeService';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { FormHeader } from '../../components/layout/FormHeader';

const ACCENT = '#6366F1';

export default function EditEmployeeProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [hobbyInput, setHobbyInput] = useState('');

  useEffect(() => {
    employeeService.getProfile()
      .then((profile: EmployeeProfile) => {
        setInterests(profile.interests ?? []);
        setHobbies(profile.hobbies ?? []);
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

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await employeeService.updateProfile({
        interests,
        hobbies,
      });
      router.back();
    } catch {
      Alert.alert('Hata', 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  }, [interests, hobbies, router]);

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
          saving={saving}
          accentColor={ACCENT}
        />
      }
    >
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
  section: { paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 12 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tagChip: { backgroundColor: '#EEF2FF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  tagText: { fontSize: 13, color: '#1D4ED8' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827' },
  addBtn: { backgroundColor: ACCENT, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#FFFFFF', fontWeight: '700' },
  disabledBtn: { opacity: 0.48 },
});
