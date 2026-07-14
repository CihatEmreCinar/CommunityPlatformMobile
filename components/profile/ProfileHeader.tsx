import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { CoverImage } from './CoverImage';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileStats, type ProfileStatItem } from './ProfileStats';
import { ProfileActions, type ProfileActionsProps } from './ProfileActions';

const AVATAR_SIZE = 116;
const AVATAR_OVERLAP_RATIO = 0.46; // spec: avatar kapak üzerine ~%40-50 biner
const AVATAR_LEFT_PADDING = Spacing.lg; // spec: 24px sol boşluk

export type ProfileHeaderProps = {
  coverUrl?: string | null;
  /** Kapak yüksekliğini override eder (default: CoverImage'ın kendi varsayılanı, 210px). */
  coverHeight?: number;
  avatarUrl?: string | null;
  fullName: string;
  /** Organizer / Mentor / Member karşılığı rol etiketi (örn. "Eğitmen", "Kafe", "Katılımcı"). */
  roleLabel: string;
  bio?: string | null;
  city?: string | null;
  stats?: ProfileStatItem[];
  actions?: ProfileActionsProps;
  /** Ek satır — örn. Cafe için yıldız puanı. Stats'ın üstünde render edilir. */
  extra?: React.ReactNode;

  /**
   * Düzenleme modu: true iken kapak/avatar üzerinde kamera rozeti belirir ve
   * dokununca onPickCover/onPickAvatar tetiklenir. Böylece profil düzenleme
   * ekranı, gerçek profil görünümüyle birebir aynı (kapak + üstüne binen
   * avatar) önizlemeyi kullanır — ayrı/bağlantısız iki alan olmaz.
   */
  editable?: boolean;
  onPickCover?: () => void;
  onPickAvatar?: () => void;
  uploadingCover?: boolean;
  uploadingAvatar?: boolean;
};

/**
 * Modern, topluluk/atölye platformuna özgü profil header'ı.
 * Kapak görseli (tam genişlik, alt köşeler yuvarlak) + üzerine binen dairesel
 * avatar (sol alt, beyaz çerçeveli) + isim/rol/bio/konum + istatistik satırı +
 * sağ üstte aksiyon butonları (Düzenle/Paylaş ya da Takip/Mesaj).
 *
 * Hem "kendi profilim" hem "başkasının profili" hem de "profil düzenleme"
 * ekranlarında aynı component kullanılır (variant + editable prop'larıyla).
 */
export function ProfileHeader({
  coverUrl,
  coverHeight,
  avatarUrl,
  fullName,
  roleLabel,
  bio,
  city,
  stats = [],
  actions,
  extra,
  editable = false,
  onPickCover,
  onPickAvatar,
  uploadingCover,
  uploadingAvatar,
}: ProfileHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <CoverImage
        uri={coverUrl}
        height={coverHeight}
        editable={editable}
        uploading={uploadingCover}
        onPress={onPickCover}
        accessibilityLabel={`${fullName} kapak görseli`}
      />

      <View style={styles.avatarRow}>
        <ProfileAvatar
          uri={avatarUrl}
          name={fullName}
          size={AVATAR_SIZE}
          editable={editable}
          uploading={uploadingAvatar}
          onPress={onPickAvatar}
        />
      </View>

      <View style={styles.infoBlock}>
        <View style={styles.topRow}>
          <View style={styles.nameCol}>
            <Text style={styles.fullName} numberOfLines={1}>{fullName}</Text>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>{roleLabel}</Text>
            </View>
          </View>
          {actions ? <ProfileActions {...actions} /> : null}
        </View>

        {bio ? <Text style={styles.bio}>{bio}</Text> : null}

        {city ? (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.onSurfaceVariant} />
            <Text style={styles.locationText}>{city}</Text>
          </View>
        ) : null}

        {extra}

        <ProfileStats stats={stats} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surfaceContainerLowest,
  },
  avatarRow: {
    marginTop: -(AVATAR_SIZE * AVATAR_OVERLAP_RATIO),
    paddingLeft: AVATAR_LEFT_PADDING,
    zIndex: 10,
  },
  infoBlock: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  nameCol: {
    flex: 1,
    gap: 4,
  },
  fullName: {
    ...Typography.h2,
    color: Colors.onSurface,
  },
  roleChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleChipText: {
    ...Typography.labelSm,
    color: Colors.primaryDarker,
    fontWeight: '700',
  },
  bio: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
});
