import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Typography, Spacing, Radius } from '../../constants/theme';

export interface BadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Jenerik durum rozeti — renk/arkaplan dışarıdan verilir. Domain'e özel
 * (örn. rezervasyon durumu) renk eşlemeleri için bkz. utils/spaceBookingStatus.ts.
 */
export function Badge({ label, color, backgroundColor, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...Typography.labelSm,
    fontWeight: '700',
  },
});
