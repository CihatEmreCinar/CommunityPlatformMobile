import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';

export interface WorkshopLocationProps {
  isOnline: boolean;
  label: string;
  cityDistrict: string | null;
  onOpenMaps?: () => void;
}

export function WorkshopLocation({ isOnline, label, cityDistrict, onOpenMaps }: WorkshopLocationProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Konum</Text>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Icon name={isOnline ? 'videocam' : 'locationOn'} size={20} color={Pastel.teal.text} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.label}>{label}</Text>
          {cityDistrict ? <Text style={styles.subLabel}>{cityDistrict}</Text> : null}
        </View>
      </View>

      {onOpenMaps ? (
        <TouchableOpacity style={styles.mapButton} onPress={onOpenMaps} activeOpacity={0.8}>
          <Icon name="map" size={16} color={Colors.primary} />
          <Text style={styles.mapButtonText}>Haritada Aç</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.serifTitle,
    color: Colors.onSurface,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Pastel.teal.tint,
    borderRadius: Radius.xxl,
    padding: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Pastel.teal.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...Typography.bodyLg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  subLabel: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  mapButtonText: {
    ...Typography.bodyMd,
    color: Colors.primary,
    fontWeight: '600',
  },
});
