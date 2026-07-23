import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Icon, IconName } from '../ui/Icon';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface AuthHeaderProps {
  /** 'logo' = marka amblemi + serif başlık, arkaplan bloğu yok (login/register).
   *  'icon' = pastel ikon dairesi (forgot/reset/verify). */
  variant?: 'logo' | 'icon';
  title: string;
  subtitle: string;
  icon?: IconName;
  /** yalnızca variant='logo': amblem kutusunun kenar uzunluğu (login: 92, register: 56). */
  logoSize?: number;
}

export function AuthHeader({ variant = 'logo', title, subtitle, icon, logoSize = 92 }: AuthHeaderProps) {
  if (variant === 'icon') {
    return (
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          {icon && <Icon name={icon} size={30} color={Colors.primaryDarker} />}
        </View>
        <Text style={styles.iconTitle}>{title}</Text>
        <Text style={styles.iconSubtitle}>{subtitle}</Text>
      </View>
    );
  }

  // logo boyutu 80px altındaysa (register) daha sıkı boşluklu, kompakt başlık kullanılır.
  const compact = logoSize < 80;

  return (
    <View
      style={[
        styles.logoWrap,
        { paddingTop: compact ? Spacing.lg : Spacing.xl + Spacing.lg, marginBottom: compact ? Spacing.lg : Spacing.xl },
      ]}
    >
      <Image
        source={require('../../assets/splash-icon.png')}
        style={{ width: logoSize, height: logoSize, borderRadius: logoSize * 0.283, marginBottom: compact ? Spacing.sm : Spacing.md }}
        resizeMode="contain"
      />
      <Text style={[compact ? styles.logoTitleCompact : styles.logoTitle, { marginBottom: compact ? 2 : Spacing.xs }]}>
        {title}
      </Text>
      <Text style={[styles.logoSubtitle, !compact && styles.logoSubtitleWide]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoWrap: { alignItems: 'center', paddingHorizontal: Spacing.containerMargin },
  logoTitle: { ...Typography.serifHeading, fontSize: 28, color: Colors.onSurface },
  logoTitleCompact: { ...Typography.serifTitle, color: Colors.onSurface },
  logoSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  logoSubtitleWide: { maxWidth: 230, lineHeight: 20 },
  iconWrap: { alignItems: 'center', marginBottom: Spacing.xl, paddingHorizontal: Spacing.containerMargin },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13,148,136,0.1)',
    marginBottom: Spacing.md,
  },
  iconTitle: { ...Typography.serifTitleLg, color: Colors.onSurface, marginBottom: Spacing.sm },
  iconSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
