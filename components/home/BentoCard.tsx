import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';

interface BentoCardProps {
  icon: string;
  tagLabel: string;
  title: string;
  description: string;
  footerLabel: string;
  footerActionLabel?: string;
  onPress?: () => void;
}

/**
 * NOT: Workshop tipinde henüz bir görsel/foto alanı kullanılmadığı için
 * (mevcut RecommendedCard/NearbyCard da ikon-kutu placeholder kullanıyor),
 * bu bento kart da aynı görsel dili sürdürüyor — gerçek fotoğraf desteği
 * eklendiğinde `imageUri` prop'u ile genişletilebilir.
 */
export function BentoCard({
  icon,
  tagLabel,
  title,
  description,
  footerLabel,
  footerActionLabel,
  onPress,
}: BentoCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.iconChip}>
          <Icon name={icon as any} size={20} color={Colors.primary} />
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tagLabel}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.footerLabel} numberOfLines={1}>
          {footerLabel}
        </Text>
        {footerActionLabel && (
          <View style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>{footerActionLabel}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
    ...Shadows.sm,
  },
  pressed: { opacity: 0.9 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  tagText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  title: { ...Typography.labelMd, fontSize: 15, color: Colors.onSurface, marginBottom: 2 },
  description: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    minHeight: 30,
    marginBottom: Spacing.sm,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel: { ...Typography.labelSm, color: Colors.primary, fontWeight: '700', flexShrink: 1 },
  footerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
  },
  footerBtnText: { ...Typography.labelSm, color: Colors.onPrimary, fontWeight: '700' },
});
