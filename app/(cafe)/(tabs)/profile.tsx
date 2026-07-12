import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { FormHeader } from '../../../components/layout/FormHeader';
import { ProfileEditForm } from '../../../components/layout/profile/ProfileEditForm';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { cafeProfileService, type CafeProfile } from '../../../services/cafeProfileService';
import { spaceBookingReviewService } from '../../../services/spaceBookingReviewService';
import { postService } from '../../../services/postService';
import type { SpaceBookingReview } from '../../../types/spaceBookingReview';
import type { UserSocialStats } from '../../../types/post.types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { Category } from '../../../types/category';

export default function CafeProfileScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState<CafeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [socialStats, setSocialStats] = useState<UserSocialStats | null>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [reviews, setReviews] = useState<SpaceBookingReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, cats] = await Promise.all([cafeProfileService.getMe(), cafeProfileService.getCategories()]);
        setProfile(p);
        setName(p.name ?? '');
        setBio(p.bio ?? '');
        setCity(p.city ?? '');
        setAddress(p.address ?? '');
        setAvatarUrl(p.avatarUrl ?? null);
        setCoverImageUrl(p.coverImageUrl ?? null);
        setCategories(cats);
        setSelectedCategoryIds(p.categoryIds ?? []);
        loadReviews(p.id);
      } catch (err) {
        console.log('cafe profile load failed', err);
        Alert.alert('Hata', 'Profil yüklenemedi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    postService.getSocialStats(user.id).then(setSocialStats).catch(() => {});
  }, [user?.id]);

  async function loadReviews(cafeProfileId: string) {
    setReviewsLoading(true);
    try {
      const data = await spaceBookingReviewService.getByCafeProfile(cafeProfileId);
      setReviews(data);
    } catch (err) {
      console.log('cafe reviews load failed', err);
    } finally {
      setReviewsLoading(false);
    }
  }

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri izni vermelisin.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    const uri = result.assets[0].uri;
    setAvatarUrl(uri);
    setUploadingPhoto(true);
    try {
      const res = await cafeProfileService.uploadAvatar(uri);
      setAvatarUrl(res.url);
      console.log('Uploaded avatar URL:', res.url);
      Alert.alert('Başarılı', 'Avatar yüklendi.');
    } catch (e) {
      console.log('avatar upload failed', e);
      Alert.alert('Hata', 'Avatar yüklenemedi.');
    } finally {
      setUploadingPhoto(false);
    }
  }, []);

  const handlePickCover = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri izni vermelisin.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 9], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    const uri = result.assets[0].uri;
    setCoverImageUrl(uri);
    setUploadingCoverImage(true);
    try {
      const res = await cafeProfileService.uploadCover(uri);
      setCoverImageUrl(res.url);
      console.log('Uploaded cover image URL:', res.url);
      Alert.alert('Başarılı', 'Kapak görseli yüklendi.');
    } catch (e) {
      console.log('cover upload failed', e);
      Alert.alert('Hata', 'Kapak görseli yüklenemedi.');
    } finally {
      setUploadingCoverImage(false);
    }
  }, []);

  const handleShare = useCallback(() => {
    Share.share({ message: `${name || 'Bu kafeyi'} Atolium'da keşfet!` });
  }, [name]);

  async function handleLogout() {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (e) {
      console.log('logout failed', e);
      Alert.alert('Hata', 'Çıkış yapılamadı.');
    }
  }

  const handleSave = useCallback(async () => {
    if (!name.trim()) { Alert.alert('Ad gerekli', 'Lütfen kafe adını girin.'); return; }
    setSaving(true);
    try {
      const updated = await cafeProfileService.updateMe({
        name: name.trim(),
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      });
      setProfile(updated);
      setName(updated.name ?? '');
      setBio(updated.bio ?? '');
      setCity(updated.city ?? '');
      setAddress(updated.address ?? '');
      setAvatarUrl(updated.avatarUrl ?? avatarUrl);
      setSelectedCategoryIds(updated.categoryIds ?? selectedCategoryIds);
      setEditing(false);
      Alert.alert('Başarılı', 'Profil güncellendi.');
    } catch (err) {
      console.log('profile save failed', err);
      Alert.alert('Hata', 'Profil kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }, [name, bio, city, address, avatarUrl, selectedCategoryIds]);

  if (loading) return <ScreenContainer edges={[ 'top', 'bottom' ]}><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={Colors.primary} /></View></ScreenContainer>;

  return (
    <ScreenContainer edges={[ 'top', 'bottom' ]}>
      {editing ? (
        <FormHeader title="Profili Düzenle" onClose={() => setEditing(false)} onSave={handleSave} saving={saving} />
      ) : (
        <FormHeader title="Profil" onClose={() => router.back()} onSave={() => setEditing(true)} saveLabel="Düzenle" />
      )}

      {editing ? (
        <>
          <ProfileHeader
            editable
            coverUrl={coverImageUrl}
            avatarUrl={avatarUrl}
            fullName={name || 'Kafe'}
            roleLabel="Kafe"
            onPickCover={handlePickCover}
            onPickAvatar={handlePickAvatar}
            uploadingCover={uploadingCoverImage}
            uploadingAvatar={uploadingPhoto}
          />
          <ProfileEditForm
            titleLabel="Kafe Adı"
            titlePlaceholder="Örn. Caffe Verde"
            title={name}
            onTitleChange={setName}
            bio={bio}
            onBioChange={setBio}
            city={city}
            onCityChange={setCity}
            yearsExperience={''}
            onYearsExperienceChange={() => {}}
            specialization={[]}
            specInput={''}
            onSpecInputChange={() => {}}
            onAddSpecialization={() => {}}
            onRemoveSpecialization={() => {}}
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={(id) => setSelectedCategoryIds((prev) =>
              prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
            )}
          />
        </>
      ) : (
        <>
          <ProfileHeader
            coverUrl={profile?.coverImageUrl}
            avatarUrl={profile?.avatarUrl}
            fullName={profile?.name ?? ''}
            roleLabel="Kafe"
            bio={profile?.bio}
            city={profile?.city}
            stats={[
              { label: 'Gönderi', value: socialStats?.postCount ?? 0 },
              { label: 'Takipçi', value: socialStats?.followerCount ?? 0 },
              { label: 'Takip', value: socialStats?.followingCount ?? 0 },
            ]}
            actions={{ variant: 'own', onEditProfile: () => setEditing(true), onShareProfile: handleShare }}
            extra={
              !!profile?.avgRating && profile.avgRating > 0 ? (
                <View style={styles.ratingRow}>
                  <MaterialIcons name="star" size={16} color={Colors.amber} />
                  <Text style={styles.ratingText}>
                    {profile.avgRating.toFixed(1)} ({profile.reviewCount ?? 0} değerlendirme)
                  </Text>
                </View>
              ) : null
            }
          />

          <View style={styles.content}>
            <TouchableOpacity
              style={styles.logoutRow}
              onPress={() =>
                Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
                  { text: 'İptal', style: 'cancel' },
                  { text: 'Çıkış Yap', style: 'destructive', onPress: handleLogout },
                ])
              }
            >
              <Ionicons name="log-out-outline" size={16} color={Colors.onSurfaceVariant} />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.label}>Adres</Text>
              <Text style={styles.value}>{profile?.address || '—'}</Text>
            </View>

            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>
                Değerlendirmeler {reviews.length > 0 ? `(${reviews.length})` : ''}
              </Text>
              {reviewsLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : reviews.length === 0 ? (
                <Text style={styles.value}>Henüz değerlendirme yok.</Text>
              ) : (
                reviews.map((r) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewUserName}>{r.userName}</Text>
                      <View style={{ flexDirection: 'row' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <MaterialIcons
                            key={star}
                            name={star <= r.rating ? 'star' : 'star-border'}
                            size={14}
                            color={Colors.amber}
                          />
                        ))}
                      </View>
                    </View>
                    {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                  </View>
                ))
              )}
            </View>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.md },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  logoutText: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.xs, ...Shadows.sm },
  label: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  value: { ...Typography.bodyMd, color: Colors.onSurface },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  reviewsSection: { gap: Spacing.sm },
  sectionTitle: { ...Typography.h3, color: Colors.onSurface },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
    gap: 4,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUserName: { ...Typography.labelMd, fontSize: 14, color: Colors.onSurface },
  reviewComment: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
});
