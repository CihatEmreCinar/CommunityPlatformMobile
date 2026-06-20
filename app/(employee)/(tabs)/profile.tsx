import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../services/apiClient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';

interface EmployeeProfile {
  interests: string[];
  hobbies:   string[];
}

export default function EmployeeProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile]       = useState<EmployeeProfile>({ interests: [], hobbies: [] });
  const [isLoading, setIsLoading]   = useState(true);
  const [isSaving, setIsSaving]     = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [newHobby, setNewHobby]       = useState('');

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const { data } = await apiClient.get('/employee/profile');
      setProfile({ interests: data.interests ?? [], hobbies: data.hobbies ?? [] });
    } catch (e) {
      console.log('Profil yüklenemedi', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveProfile() {
    setIsSaving(true);
    try {
      await apiClient.put('/employee/profile', profile);
      Alert.alert('Başarılı', 'Profil güncellendi.');
    } catch (e) {
      Alert.alert('Hata', 'Profil kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  function addInterest() {
    const val = newInterest.trim();
    if (!val || profile.interests.includes(val)) return;
    setProfile(p => ({ ...p, interests: [...p.interests, val] }));
    setNewInterest('');
  }

  function removeInterest(item: string) {
    setProfile(p => ({ ...p, interests: p.interests.filter(i => i !== item) }));
  }

  function addHobby() {
    const val = newHobby.trim();
    if (!val || profile.hobbies.includes(val)) return;
    setProfile(p => ({ ...p, hobbies: [...p.hobbies, val] }));
    setNewHobby('');
  }

  function removeHobby(item: string) {
    setProfile(p => ({ ...p, hobbies: p.hobbies.filter(h => h !== item) }));
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.xpRow}>
            <MaterialIcons name="bolt" size={14} color={Colors.primary} />
            <Text style={styles.xpText}>{user?.xpPoints ?? 0} XP · Seviye {user?.rankLevel ?? 1}</Text>
          </View>
        </View>
      </View>

      {/* Interests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İlgi Alanlarım</Text>
        <View style={styles.chipWrap}>
          {profile.interests.map(item => (
            <TouchableOpacity key={item} style={styles.chip} onPress={() => removeInterest(item)}>
              <Text style={styles.chipText}>{item}</Text>
              <MaterialIcons name="close" size={12} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="İlgi alanı ekle..."
            placeholderTextColor={Colors.outlineVariant}
            value={newInterest}
            onChangeText={setNewInterest}
            onSubmitEditing={addInterest}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addInterest}>
            <MaterialIcons name="add" size={20} color={Colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hobbies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hobilerin</Text>
        <View style={styles.chipWrap}>
          {profile.hobbies.map(item => (
            <TouchableOpacity key={item} style={styles.chip} onPress={() => removeHobby(item)}>
              <Text style={styles.chipText}>{item}</Text>
              <MaterialIcons name="close" size={12} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Hobi ekle..."
            placeholderTextColor={Colors.outlineVariant}
            value={newHobby}
            onChangeText={setNewHobby}
            onSubmitEditing={addHobby}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addHobby}>
            <MaterialIcons name="add" size={20} color={Colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={isSaving} activeOpacity={0.85}>
        {isSaving
          ? <ActivityIndicator color={Colors.onPrimary} />
          : <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
        }
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <MaterialIcons name="logout" size={18} color={Colors.error} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex:    { flex: 1, backgroundColor: Colors.background },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  container: { padding: Spacing.containerMargin, paddingBottom: Spacing.xl },

  userCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    ...Shadows.card,
  },
  avatar: {
    width: 56, height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { ...Typography.h2, color: Colors.primary },
  userInfo:  { flex: 1 },
  userName:  { ...Typography.h3, color: Colors.onSurface },
  userEmail: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  xpRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  xpText:   { ...Typography.labelSm, color: Colors.primary },

  section: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  sectionTitle: { ...Typography.h3, color: Colors.onSurface, fontSize: 15 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  chipText: { ...Typography.labelSm, color: Colors.primary },

  addRow:  { flexDirection: 'row', gap: Spacing.sm },
  addInput: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    ...Typography.bodyMd,
    color: Colors.onSurface,
  },
  addBtn: {
    width: 36, height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  saveBtnText: { ...Typography.h3, color: Colors.onPrimary, fontSize: 15 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
  },
  logoutText: { ...Typography.labelMd, color: Colors.error, fontSize: 13 },
});