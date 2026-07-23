import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Share } from 'react-native';
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
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { Icon } from '../../../components/ui/Icon';
import type { Category } from '../../../types/category';
import { EMPTY_LOCATION_SELECTION, type LocationSelection } from '../../../types/location';
import { useCurrentLocation } from '../../../hooks/useCurrentLocation';
import { formatCityDistrict, openMapsForCoordinate } from '../../../utils/locationFormat';

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
  const [location, setLocation] = useState<LocationSelection>(EMPTY_LOCATION_SELECTION);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const { getCurrentLocation, loading: locating } = useCurrentLocation();
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
        setLocation({ cityId: p.cityId ?? null, cityName: p.city ?? null, districtId: p.districtId ?? null, districtName: p.district ?? null });
        setAddress(p.address ?? '');
        setLatitude(p.latitude ?? null);
        setLongitude(p.longitude ?? null);
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
      setReviews(await spaceBookingReviewService.getByCafeProfile(cafeProfileId));
    } catch (err) {
      console.log('cafe reviews load failed', err);
    } finally {
      setReviewsLoading(false);
    }
  }

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri izni vermelisin.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    const uri = result.assets[0].uri;
    setAvatarUrl(uri);
    setUploadingPhoto(true);
    try {
      const res = await cafeProfileService.uploadAvatar(uri);
      setAvatarUrl(res.url);
      Alert.alert('Başarılı', 'Avatar yüklendi.');
    } catch (e) {
      Alert.alert('Hata', 'Avatar yüklenemedi.');
    } finally {
      setUploadingPhoto(false);
    }
  }, []);

  const handlePickCover = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri izni vermelisin.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 9], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    const uri = result.assets[0].uri;
    setCoverImageUrl(uri);
    setUploadingCoverImage(true);
    try {
      const res = await cafeProfileService.uploadCover(uri);
      setCoverImageUrl(res.url);
      Alert.alert('Başarılı', 'Kapak görseli yüklendi.');
    } catch (e) {
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
      Alert.alert('Hata', 'Çıkış yapılamadı.');
    }
  }

  const handleUseCurrentLocation = useCallback(async () => {
    const coords = await getCurrentLocation();
    if (!coords) { Alert.alert('Konum alınamadı', 'Konum izni verilmedi veya cihaz konumu okunamadı.'); return; }
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
  }, [getCurrentLocation]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) { Alert.alert('Ad gerekli', 'Lütfen kafe adını girin.'); return; }
    setSaving(true);
    try {
      const updated = await cafeProfileService.updateMe({
        name: name.trim(),
        bio: bio.trim() || undefined,
        cityId: location.cityId ?? undefined,
        districtId: location.districtId ?? undefined,
        address: address.trim() || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      });
      setProfile(updated);
      setName(updated.name ?? '');
      setBio(updated.bio ?? '');
      setLocation({ cityId: updated.cityId ?? null, cityName: updated.city ?? null, districtId: updated.districtId ?? null, districtName: updated.district ?? null });
      setAddress(updated.address ?? '');
      setLatitude(updated.latitude ?? null);
      setLongitude(updated.longitude ?? null);
      setAvatarUrl(updated.avatarUrl ?? avatarUrl);
      setSelectedCategoryIds(updated.categoryIds ?? selectedCategoryIds);
      setEditing(false);
      Alert.alert('Başarılı', 'Profil güncellendi.');
    } catch (err) {
      Alert.alert('Hata', 'Profil kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }, [name, bio, location, address, latitude, longitude, avatarUrl, selectedCategoryIds]);

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']} floatingTabBar>
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
            location={location}
            onLocationChange={setLocation}
            yearsExperience={''}
            onYearsExperienceChange={() => {}}
            showExperience={false}
            specialization={[]}
            specInput={''}
            onSpecInputChange={() => {}}
            onAddSpecialization={() => {}}
            onRemoveSpecialization={() => {}}
            showSpecialization={false}
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={(id) => setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))}
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Adres</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="örn. Bağdat Cad. No:15, Kadıköy"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={address}
              onChangeText={setAddress}
              multiline
              maxLength={200}
            />
            <TouchableOpacity style={styles.locationBtn} onPress={handleUseCurrentLocation} disabled={locating} activeOpacity={0.7}>
              {locating ? <ActivityIndicator size="small" color={Pastel.coral.text} /> : <Icon name="myLocation" size={15} color={Pastel.coral.text} />}
              <Text style={styles.locationBtnText}>{latitude != null && longitude != null ? 'Konumu Güncelle' : 'Konumumu Kullan'}</Text>
            </TouchableOpacity>
            {latitude != null && longitude != null ? (
              <Text style={styles.coordText}>Harita pini ayarlandı ({latitude.toFixed(5)}, {longitude.toFixed(5)})</Text>
            ) : (
              <Text style={styles.coordText}>Harita pini eklemek için "Konumumu Kullan" butonuna basın — kafenizin haritada doğru konumda görünmesini sağlar.</Text>
            )}
          </View>
        </>
      ) : (
        <>
          <ProfileHeader
            coverUrl={profile?.coverImageUrl}
            avatarUrl={profile?.avatarUrl}
            fullName={profile?.name ?? ''}
            roleLabel="Kafe"
            bio={profile?.bio}
            city={formatCityDistrict(profile?.city, profile?.district)}
            stats={[
              { label: 'Gönderi', value: socialStats?.postCount ?? 0 },
              { label: 'Takipçi', value: socialStats?.followerCount ?? 0 },
              { label: 'Takip', value: socialStats?.followingCount ?? 0 },
            ]}
            actions={{ variant: 'own', onEditProfile: () => setEditing(true), onShareProfile: handleShare }}
            extra={
              !!profile?.avgRating && profile.avgRating > 0 ? (
                <View style={styles.ratingRow}>
                  <Icon name="star" size={15} color={Colors.amber} />
                  <Text style={styles.ratingText}>{profile.avgRating.toFixed(1)} ({profile.reviewCount ?? 0} değerlendirme)</Text>
                </View>
              ) : null
            }
          />

          <View style={styles.content}>
            <TouchableOpacity
              style={styles.logoutRow}
              onPress={() => Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
                { text: 'İptal', style: 'cancel' },
                { text: 'Çıkış Yap', style: 'destructive', onPress: handleLogout },
              ])}
            >
              <Icon name="logOutOutline" size={15} color={Pastel.coral.text} />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.label}>Adres</Text>
              <Text style={styles.value}>{profile?.address || '—'}</Text>
              {profile?.latitude != null && profile?.longitude != null && (
                <TouchableOpacity style={styles.mapLinkRow} onPress={() => openMapsForCoordinate(profile.latitude!, profile.longitude!, profile.name)} activeOpacity={0.7}>
                  <Icon name="map" size={15} color={Pastel.coral.text} />
                  <Text style={styles.mapLinkText}>Haritada Göster</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Değerlendirmeler {reviews.length > 0 ? `(${reviews.length})` : ''}</Text>
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
                          <Icon key={star} name={star <= r.rating ? 'star' : 'starEmpty'} size={13} color={Colors.amber} />
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
  section: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.gutter },
  sectionLabel: { ...Typography.labelMd, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm },
  addressInput: { backgroundColor: Colors.surfaceContainer, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.onSurface, minHeight: 60 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: Spacing.sm, paddingHorizontal: Spacing.sm, paddingVertical: 8, borderRadius: Radius.lg, backgroundColor: Pastel.coral.tint },
  locationBtnText: { ...Typography.labelMd, color: Pastel.coral.text },
  coordText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: Spacing.xs, lineHeight: 16 },
  mapLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  mapLinkText: { ...Typography.labelMd, color: Pastel.coral.text },
  content: { padding: Spacing.md, gap: Spacing.md },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: Pastel.coral.tint, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 8 },
  logoutText: { ...Typography.labelMd, color: Pastel.coral.text },
  card: { backgroundColor: Pastel.coral.tint, borderRadius: Radius.xxl, padding: Spacing.md, gap: Spacing.xs },
  label: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  value: { ...Typography.bodyMd, color: Colors.onSurface },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  reviewsSection: { gap: Spacing.sm },
  sectionTitle: { ...Typography.serifTitle, color: Colors.onSurface },
  reviewCard: { backgroundColor: Pastel.coral.tint, borderRadius: Radius.xl, padding: Spacing.sm, gap: 4 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUserName: { ...Typography.labelMd, fontSize: 14, color: Colors.onSurface },
  reviewComment: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
});
