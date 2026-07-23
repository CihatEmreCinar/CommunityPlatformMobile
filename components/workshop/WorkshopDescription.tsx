import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export interface WorkshopDescriptionProps {
  description: string | null;
}

const COLLAPSED_LINES = 4;

export function WorkshopDescription({ description }: WorkshopDescriptionProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (!description) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Açıklama</Text>
      <Text style={styles.body} numberOfLines={expanded ? undefined : COLLAPSED_LINES}>
        {description}
      </Text>
      <TouchableOpacity onPress={() => setExpanded((v) => !v)} hitSlop={{ top: 6, bottom: 6, left: 0, right: 6 }}>
        <Text style={styles.readMore}>{expanded ? 'Daha az göster' : 'Devamını oku'}</Text>
      </TouchableOpacity>
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
  body: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
  },
  readMore: {
    ...Typography.bodyMd,
    color: Colors.primary,
    fontWeight: '600',
  },
});
