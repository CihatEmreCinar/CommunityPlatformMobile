import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';

export interface WorkshopHeaderProps {
  title: string;
  employerName: string;
  onEmployerPress: () => void;
  locationLabel: string | null;
  avgRating: number;
  reviewCount: number;
  matchPercentage?: number;
}

export function WorkshopHeader({
  title,
  employerName,
  onEmployerPress,
  locationLabel,
  avgRating,
  reviewCount,
  matchPercentage = 95,
}: WorkshopHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.matchBadge}>
        <Icon name="aiMatch" size={14} color={Pastel.purple.text} />
        <Text style={styles.matchBadgeText}>%{matchPercentage} eşleşme</Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Eğitmen: </Text>
        <TouchableOpacity onPress={onEmployerPress} hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}>
          <Text style={styles.metaLink}>{employerName}</Text>
        </TouchableOpacity>
        {locationLabel ? (
          <Text style={styles.metaText}> {'\u2022'} {locationLabel}</Text>
        ) : null}
        {avgRating > 0 ? (
          <View style={styles.ratingInline}>
            <Text style={styles.metaText}> {'\u2022'} </Text>
            <Icon name="star" size={14} color={Colors.amber} />
            <Text style={styles.metaText}> {avgRating.toFixed(1)} ({reviewCount} değerlendirme)</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Pastel.purple.tintStrong,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginBottom: Spacing.xs,
  },
  matchBadgeText: {
    ...Typography.labelMd,
    color: Pastel.purple.text,
  },
  title: {
    ...Typography.serifHeading,
    fontSize: 26,
    lineHeight: 32,
    color: Colors.onSurface,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  metaLink: {
    ...Typography.bodyMd,
    color: Colors.primary,
    fontWeight: '600',
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
