import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pastel, Typography, Spacing, Radius } from '../../constants/theme';

export interface WorkshopTagsProps {
  tags: string[];
}

export function WorkshopTags({ tags }: WorkshopTagsProps) {
  if (tags.length === 0) return null;

  return (
    <View style={styles.row}>
      {tags.map((tag) => (
        <View key={tag} style={styles.chip}>
          <Text style={styles.chipText}>{tag}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    backgroundColor: Pastel.teal.tintStrong,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  chipText: {
    ...Typography.labelMd,
    color: Pastel.teal.text,
  },
});
