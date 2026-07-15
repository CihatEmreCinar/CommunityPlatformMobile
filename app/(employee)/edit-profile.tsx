import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { employeeService } from '../../services/employeeService';
import type { EmployeeProfile } from '../../services/employeeService';
import { userService } from '../../services/userService';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { FormHeader } from '../../components/layout/FormHeader';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { EmployeeProfileEditForm } from '../../components/layout/profile/EmployeeProfileEditForm';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/theme';
import { EMPTY_LOCATION_SELECTION, type LocationSelection } from '../../types/location';

const MAX_BIO = 300;
const COVER_HEIGHT = 168; // spec: view/edit'teki kapak alanı varsayılan 210px'den biraz kısaltıldı

async function buildImageFormData(uri: string, prefix: string): Promise<FormData> {
  const extension = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: `${prefix}_${Date.now()}.${extension}`,
    type: 'image/jpeg',
  } as any);
  return formData;
}

export default function EditEmployeeProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [bio, setBio] = useState('');
  const [location, setLocation] = useState<LocationSelection>(EMPTY_LOCATION_SELECTION);
  const [preferredLocation, setPreferredLocation] = useState<LocationSelection>(EMPTY_LOCATION_SELECTION);
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [hobbyInput, setHobbyInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    employeeService.getProfile()
      .then((profile: EmployeeProfile) => {
        setBio(profile.bio ?? '');
        setLocation({
          cityId: profile.cityId ?? null,
          cityName: profile.city ?? null,
          districtId: profile.districtId ?? null,
          districtName: profile.district ?? null,
        });
        setPreferredLocation({
          cityId: profile.preferredCityId ?? null,
          cityName: profile.preferredCity ?? null,
          districtId: profile.preferredDistrictId ?? null,
          districtName: profile.preferredDistrict ?? null,
        });
        setInterests(profile.interests ?? []);
        setHobbies(profile.hobbies ?? []);
        setAvatarUrl(profile.avatarUrl ?? user?.avatarUrl ?? null);
        setCoverImageUrl(profile.coverImageUrl ?? null);
      })
      .catch(() => Alert.alert('Hata', 'Profil yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePickAvatar = useCallback(async () => {
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
    setUploadingAvatar(true);
    try {
      const formData = await buildImageFormData(asset.uri, 'avatar');
      const res = await userService.uploadAvatar(formData);
      setAvatarUrl(res.url);
      await refreshUser();
    } catch {
      Alert.alert('Hata', 'Profil fotoğrafı yüklenemedi.');
    } finally {
      setUploadingAvatar(false);
    }
  }, [refreshUser]);

  const handlePickCover = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Kapak görseli seçmek için galeri izni vermelisin.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploadingCover(true);
    try {
      const formData = await buildImageFormData(asset.uri, 'cover');
      const res = await employeeService.uploadEmployeeCover(formData);
      setCoverImageUrl(res.url);
    } catch {
      Alert.alert('Hata', 'Kapak görseli yüklenemedi.');
    } finally {
      setUploadingCover(false);
    }
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
        bio: bio.trim() || undefined,
        cityId: location.cityId ?? undefined,
        districtId: location.districtId ?? undefined,
        preferredCityId: preferredLocation.cityId ?? undefined,
        preferredDistrictId: preferredLocation.districtId ?? undefined,
      });
      await refreshUser();
      router.back();
    } catch {
      Alert.alert('Hata', 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  }, [interests, hobbies, bio, location, preferredLocation, refreshUser, router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
          accentColor={Colors.primary}
        />
      }
    >
      <ProfileHeader
        editable
        coverUrl={coverImageUrl}
        coverHeight={COVER_HEIGHT}
        avatarUrl={avatarUrl}
        fullName={user ? `${user.firstName} ${user.lastName}` : ''}
        roleLabel="Katılımcı"
        onPickCover={handlePickCover}
        onPickAvatar={handlePickAvatar}
        uploadingCover={uploadingCover}
        uploadingAvatar={uploadingAvatar}
      />
      <EmployeeProfileEditForm
        bio={bio}
        onBioChange={setBio}
        maxBio={MAX_BIO}
        location={location}
        onLocationChange={setLocation}
        preferredLocation={preferredLocation}
        onPreferredLocationChange={setPreferredLocation}
        interests={interests}
        interestInput={interestInput}
        onInterestInputChange={setInterestInput}
        onAddInterest={addInterest}
        onRemoveInterest={removeInterest}
        hobbies={hobbies}
        hobbyInput={hobbyInput}
        onHobbyInputChange={setHobbyInput}
        onAddHobby={addHobby}
        onRemoveHobby={removeHobby}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceContainerLowest },
});
