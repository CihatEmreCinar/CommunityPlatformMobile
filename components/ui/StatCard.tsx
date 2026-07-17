import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';

export interface StatCardProps {
  icon: IconName;
  label: string;
  value: number;
  color: string;
  onPress?: () => void;
}

/**
 * employer/cafe dashboard.tsx'te birebir aynı (byte-identical) tanımlıydı —
 * buraya değişiklik yapılmadan taşındı.
 */
export function StatCard({ icon, label, value, color, onPress }: StatCardProps) {
  const content = (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '1A' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.statCardTouchable}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  statCardTouchable: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h1Mobile,
    color: Colors.onSurface,
  },
  statLabel: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});
