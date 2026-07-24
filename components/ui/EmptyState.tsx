import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

export interface EmptyStateProps {
  icon: IconName;
  title?: string;
  description?: string;
  iconSize?: number;
  iconColor?: string;
  /** employer bookings.tsx'te title'ın üstünde ekstra marginTop vardı, cafe'de yoktu —
   *  orijinal farkı korumak için opsiyonel. */
  titleMarginTop?: number;
  /** Açıklama metnine ek stil (ör. bazı ekranlarda paddingHorizontal farkı). */
  descriptionStyle?: StyleProp<TextStyle>;
  /** Aksiyon/tekrar-dene butonu — hem etiket hem onPress verilirse gösterilir. */
  actionLabel?: string;
  onAction?: () => void;
  /** Aksiyon butonunun zemin rengi (rol vurgusu için); default primary. */
  actionColor?: string;
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
  descriptionStyle,
  actionLabel,
  onAction,
  actionColor = Colors.primary,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Icon name={icon} size={iconSize} color={iconColor} />
      {title ? (
        <Text style={[styles.title, titleMarginTop !== undefined && { marginTop: titleMarginTop }]}>
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text style={[styles.description, descriptionStyle]}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: actionColor }]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
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
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  actionText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
  },
});
