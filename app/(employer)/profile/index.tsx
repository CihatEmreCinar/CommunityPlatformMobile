import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { employerService } from '../../../services/employerService';
import { EmployerProfile } from '../../../types/dashboard';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';

export default function EmployerProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [workshopTitle, setWorkshopTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [specializationText, setSpecializationText] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await employerService.getProfile();
      setProfile(data);
      setWorkshopTitle(data.workshopTitle || '');
      setYearsExperience(data.yearsExperience?.toString() || '');
      setSpecializationText(data.specialization?.join(', ') || '');
    } catch (error) {
      Alert.alert('Hata', 'Profil yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!workshopTitle.trim()) {
      Alert.alert('Hata', 'Atölyeci unvanı zorunludur.');
      return;
    }

    setIsSaving(true);
    try {
      const specialization = specializationText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const updated = await employerService.updateProfile({
        workshopTitle: workshopTitle.trim(),
        specialization,
        yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : undefined,
      });

      setProfile(updated);
      setIsEditing(false);
      Alert.alert('Başarılı', 'Profilin güncellendi.');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Profil güncellenemedi.';
      Alert.alert('Hata', message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Atölyeci Profili</Text>
        <TouchableOpacity
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          style={styles.editButton}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <MaterialIcons
              name={isEditing ? 'check' : 'edit'}
              size={20}
              color={Colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarPlaceholder}>
          <MaterialIcons name="business" size={36} color={Colors.primary} />
        </View>
        <View style={styles.rankPill}>
          <MaterialIcons name="workspace-premium" size={14} color={Colors.onPrimary} />
          <Text style={styles.rankPillText}>{profile?.employerRank}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile?.totalWorkshops ?? 0}</Text>
          <Text style={styles.statLabel}>Atölye</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile?.avgRating ? profile.avgRating.toFixed(1) : '—'}
          </Text>
          <Text style={styles.statLabel}>Puan</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile?.yearsExperience ?? '—'}</Text>
          <Text style={styles.statLabel}>Yıl Tecrübe</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Atölyeci Unvanı</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={workshopTitle}
              onChangeText={setWorkshopTitle}
              placeholder="Örn: Seramik Ustası"
              placeholderTextColor={Colors.outlineVariant}
            />
          ) : (
            <Text style={styles.valueText}>{profile?.workshopTitle || 'Belirtilmemiş'}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Deneyim Yılı</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={yearsExperience}
              onChangeText={setYearsExperience}
              placeholder="Örn: 5"
              placeholderTextColor={Colors.outlineVariant}
              keyboardType="number-pad"
            />
          ) : (
            <Text style={styles.valueText}>
              {profile?.yearsExperience ? `${profile.yearsExperience} yıl` : 'Belirtilmemiş'}
            </Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Uzmanlık Alanları</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={specializationText}
              onChangeText={setSpecializationText}
              placeholder="seramik, el sanatları (virgülle ayır)"
              placeholderTextColor={Colors.outlineVariant}
            />
          ) : (
            <View style={styles.tagsRow}>
              {profile?.specialization && profile.specialization.length > 0 ? (
                profile.specialization.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.valueText}>Belirtilmemiş</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Kategori</Text>
          <Text style={styles.valueText}>{profile?.categoryName || 'Belirtilmemiş'}</Text>
        </View>
      </View>

      {isEditing && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.onSurface,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  rankPillText: {
    ...Typography.labelSm,
    color: Colors.onPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.surfaceVariant,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.onSurface,
  },
  statLabel: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  form: {
    gap: Spacing.md,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
  input: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  valueText: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tagText: {
    ...Typography.labelSm,
    color: Colors.onPrimaryContainer,
  },
  cancelButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelButtonText: {
    ...Typography.labelMd,
    color: Colors.error,
  },
});