import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { Typography, Spacing, Radius } from '../../constants/theme';

export interface StatCardProps {
  icon: IconName;
  label: string;
  value: number;
  color: string;
  onPress?: () => void;
}

function withAlpha(hex: string, alpha: string) {
  return hex.startsWith('#') ? hex + alpha : hex;
}

export function StatCard({ icon, label, value, color, onPress }: StatCardProps) {
  const content = (
    <View style={[styles.statCard, { backgroundColor: withAlpha(color, '14') }]}>
      <View style={[styles.statIconWrap, { backgroundColor: withAlpha(color, '24') }]}>
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
  // Tier 2 — istatistik kartı: renk-koduna göre %8 opasiteli pastel, border yok.
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: Radius.xl,
    padding: Spacing.md,
  },
  statCardTouchable: { flexBasis: '47%', flexGrow: 1 },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: { ...Typography.h1Mobile, color: '#00201D' },
  statLabel: { ...Typography.bodyMd, color: '#5B6A67', marginTop: 2 },
});
