import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';

interface BentoCardProps {
  icon: string;
  tagLabel: string;
  title: string;
  description: string;
  footerLabel: string;
  footerActionLabel?: string;
  onPress?: () => void;
  /** Kategori rengi: 'teal' (yakın/atölye) veya 'coral' (trend/popüler). */
  variant?: 'teal' | 'coral';
}

export function BentoCard({
  icon,
  tagLabel,
  title,
  description,
  footerLabel,
  footerActionLabel,
  onPress,
  variant = 'teal',
}: BentoCardProps) {
  const palette = Pastel[variant];
  return (
    <Pressable style={({ pressed }) => [styles.card, { backgroundColor: palette.tint }, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={[styles.iconChip, { backgroundColor: palette.tintStrong }]}>
          <Icon name={icon as any} size={20} color={palette.text} />
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
        <Text style={[styles.footerLabel, { color: palette.text }]} numberOfLines={1}>
          {footerLabel}
        </Text>
        {footerActionLabel && (
          <View style={[styles.footerBtn, { backgroundColor: palette.text }]}>
            <Text style={styles.footerBtnText}>{footerActionLabel}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Tier 2 — ikincil kart: kategori pastel tint, border yok.
  card: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.sm,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.6)',
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
  footerLabel: { ...Typography.labelSm, fontWeight: '700', flexShrink: 1 },
  footerBtn: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
  },
  footerBtnText: { ...Typography.labelSm, color: Colors.white, fontWeight: '700' },
});
