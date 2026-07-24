import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { employerService, type EmployerPublicProfile } from '../../services/employerService';
import { ProfileHeader } from './ProfileHeader';
import { PublicProfileLayout } from './PublicProfileLayout';
import { usePublicProfile } from '../../hooks/usePublicProfile';
import { Colors, Pastel, Typography, Radius } from '../../constants/theme';
import { formatCityDistrict } from '../../utils/locationFormat';

export function EmployerPublicProfileScreen({ employerId }: { employerId: string }) {
  const {
    profile, stats, posts, loadingProfile, loadingStats, loadingPosts, loadingMore,
    followLoading, refreshing, loadMore, refresh, handleFollow, handleLike,
  } = usePublicProfile<EmployerPublicProfile>({
    userId: employerId,
    fetchProfile: (id) => employerService.getPublicProfile(id),
  });

  const handleMessage = useCallback(() => {
    Alert.alert('Yakında', 'Mesajlaşma özelliği yakında eklenecek.');
  }, []);

  const header = (
    <ProfileHeader
      coverUrl={profile?.coverImageUrl}
      avatarUrl={profile?.profileImageUrl}
      fullName={profile ? `${profile.firstName} ${profile.lastName}` : 'Eğitmen Profili'}
      roleLabel="Eğitmen"
      bio={profile?.bio}
      city={formatCityDistrict(profile?.city, profile?.district)}
      stats={[
        { label: 'Atölye', value: profile?.totalWorkshops ?? 0 },
        { label: 'Gönderi', value: stats?.postCount ?? 0 },
        { label: 'Takipçi', value: stats?.followerCount ?? 0 },
        { label: 'Takip', value: stats?.followingCount ?? 0 },
      ]}
      actions={{ variant: 'other', isFollowing: stats?.isFollowedByMe ?? false, followLoading: followLoading || loadingStats, onFollow: handleFollow, onMessage: handleMessage }}
      extra={
        <>
          {profile?.specialization?.length ? (
            <View style={styles.tagRowWrap}>
              {profile.specialization.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.profileChip}><Text style={styles.profileChipText}>{item}</Text></View>
              ))}
            </View>
          ) : null}
          {profile?.categoryNames?.length ? (
            <View style={styles.tagRowWrap}>
              {profile.categoryNames.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.categoryChip}><Text style={styles.categoryChipText}>{item}</Text></View>
              ))}
            </View>
          ) : null}
        </>
      }
    />
  );

  return (
    <PublicProfileLayout
      accent={Pastel.teal}
      shareMessage="Atolium'da bu eğitmeni keşfet!"
      header={header}
      posts={posts}
      loadingProfile={loadingProfile}
      loadingPosts={loadingPosts}
      loadingMore={loadingMore}
      refreshing={refreshing}
      onRefresh={refresh}
      onLoadMore={loadMore}
      onLike={handleLike}
    />
  );
}

const styles = StyleSheet.create({
  tagRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  profileChip: { backgroundColor: Pastel.teal.tintStrong, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  profileChipText: { ...Typography.labelSm, color: Pastel.teal.text, fontWeight: '600' },
  categoryChip: { backgroundColor: Colors.surfaceContainer, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  categoryChipText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, fontWeight: '600' },
});
