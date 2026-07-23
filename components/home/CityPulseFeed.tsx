import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';
import type { PulseItem } from '../../utils/dailyBrief';

interface CityPulseFeedProps {
  items: PulseItem[];
  onItemPress?: (workshopId: string) => void;
}

const VARIANT_PALETTE: Record<PulseItem['variant'], typeof Pastel.teal> = {
  urgent: Pastel.coral,
  upcoming: Pastel.teal,
};

export function CityPulseFeed({ items, onItemPress }: CityPulseFeedProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Şehrin Nabzı</Text>
      <View style={styles.list}>
        {items.map((item, index) => {
          const [before, after] = item.template.split('{{h}}');
          const palette = VARIANT_PALETTE[item.variant];
          const pressable = Boolean(item.workshopId && onItemPress);
          const isLast = index === items.length - 1;

          return (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.iconColumn}>
                <View style={[styles.iconWrap, { backgroundColor: palette.tintStrong }]}>
                  <Icon name={item.icon as any} size={14} color={palette.text} />
                </View>
                {!isLast && <View style={styles.wire} />}
              </View>
              <Pressable
                style={[styles.itemContent, { backgroundColor: palette.tint }]}
                disabled={!pressable}
                onPress={() => item.workshopId && onItemPress?.(item.workshopId)}
              >
                <Text style={styles.itemText}>
                  {before}
                  <Text style={styles.itemHighlight}>{item.highlight}</Text>
                  {after}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                  {item.actionLabel && <Text style={[styles.actionText, { color: palette.text }]}> · {item.actionLabel}</Text>}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  heading: { ...Typography.serifTitle, color: Colors.onSurface },
  list: {},
  itemRow: { flexDirection: 'row', gap: Spacing.sm },
  iconColumn: { alignItems: 'center', width: 28 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wire: { width: 2, flex: 1, minHeight: 10, backgroundColor: Colors.surfaceVariant, marginVertical: 2 },
  itemContent: { flex: 1, borderRadius: Radius.lg, padding: Spacing.sm, marginBottom: Spacing.xs },
  itemText: { ...Typography.bodyMd, fontSize: 13, color: Colors.onSurface, lineHeight: 18 },
  itemHighlight: { fontWeight: '700' },
  metaRow: { flexDirection: 'row', marginTop: 2 },
  timestamp: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  actionText: { ...Typography.labelSm, fontWeight: '700' },
});
