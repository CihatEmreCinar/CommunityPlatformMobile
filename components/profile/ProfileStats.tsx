import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export type ProfileStatItem = {
  label: string;
  value: number;
};

export type ProfileStatsProps = {
  stats: ProfileStatItem[];
};

/**
 * Temiz, yatay bir satırda istatistik listesi (Atölye / Gönderi / Takipçi / Takip vb.).
 * Rol'e göre farklı istatistik setleri geçebilmek için generic {label, value}
 * dizisi kabul eder — böylece Employer/Cafe/Employee aynı component'i kullanır.
 */
export function ProfileStats({ stats }: ProfileStatsProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <View style={styles.row}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.item}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  value: {
    ...Typography.h3,
    color: Colors.onSurface,
  },
  label: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: Colors.outlineVariant,
  },
});
