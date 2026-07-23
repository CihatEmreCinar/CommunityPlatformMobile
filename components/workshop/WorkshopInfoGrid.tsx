import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, IconName } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';

export interface WorkshopInfoGridProps {
  date: string;
  time: string;
  price: string;
}

function InfoCell({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={18} color={Pastel.teal.text} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function WorkshopInfoGrid({ date, time, price }: WorkshopInfoGridProps) {
  return (
    <View style={styles.row}>
      <InfoCell icon="calendarToday" label="Tarih" value={date} />
      <InfoCell icon="schedule" label="Saat" value={time} />
      <InfoCell icon="payments" label="Fiyat" value={price} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cell: {
    flex: 1,
    backgroundColor: Pastel.teal.tint,
    borderRadius: Radius.xl,
    padding: Spacing.sm,
    gap: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Pastel.teal.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  value: {
    ...Typography.bodyMd,
    fontWeight: '600',
    color: Colors.onSurface,
  },
});
