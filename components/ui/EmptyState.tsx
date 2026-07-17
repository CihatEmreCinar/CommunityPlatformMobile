import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Colors, Typography, Spacing } from '../../constants/theme';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  iconSize?: number;
  iconColor?: string;
  /** employer bookings.tsx'te title'ın üstünde ekstra marginTop vardı, cafe'de yoktu —
   *  orijinal farkı korumak için opsiyonel. */
  titleMarginTop?: number;
  /** Konteynerin paddingVertical/gap gibi özellikleri ekrandan ekrana farklıydı —
   *  orijinal görünümü birebir korumak için dışarıdan override edilebilir. */
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon,
  title,
  description,
  iconSize = 40,
  iconColor = Colors.outline,
  titleMarginTop,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Icon name={icon} size={iconSize} color={iconColor} />
      <Text style={[styles.title, titleMarginTop !== undefined && { marginTop: titleMarginTop }]}>
        {title}
      </Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: Colors.onSurface,
  },
  description: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
