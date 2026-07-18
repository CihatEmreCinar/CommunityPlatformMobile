import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import type { PulseItem } from '../../utils/dailyBrief';

interface CityPulseFeedProps {
  items: PulseItem[];
  onItemPress?: (workshopId: string) => void;
}

const VARIANT_STYLES: Record<PulseItem['variant'], { bg: string; color: string }> = {
  urgent: { bg: Colors.errorContainer, color: Colors.onErrorContainer },
  upcoming: { bg: Colors.primaryContainer, color: Colors.primary },
};

/**
 * NOT: Bu akış şu an gerçek sosyal olaylar (ör. "Ayşe katıldı") DEĞİL,
 * mevcut atölye verisinden (doluluk, başlangıç zamanı) türetilmiş
 * sinyaller gösteriyor. Gerçek "kim ne yaptı" akışı için Faz 2'de
 * bir feed/notification endpoint'i entegre edilmeli (bkz. README_PATCH.md).
 */
export function CityPulseFeed({ items, onItemPress }: CityPulseFeedProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Şehrin Nabzı</Text>
      <View style={styles.list}>
        {items.map((item) => {
          const [before, after] = item.template.split('{{h}}');
          const variant = VARIANT_STYLES[item.variant];
          const pressable = Boolean(item.workshopId && onItemPress);

          return (
            <Pressable
              key={item.id}
              style={styles.item}
              disabled={!pressable}
              onPress={() => item.workshopId && onItemPress?.(item.workshopId)}
            >
              <View style={[styles.iconWrap, { backgroundColor: variant.bg }]}>
                <Icon name={item.icon as any} size={14} color={variant.color} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemText}>
                  {before}
                  <Text style={styles.itemHighlight}>{item.highlight}</Text>
                  {after}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                  {item.actionLabel && <Text style={styles.actionText}> · {item.actionLabel}</Text>}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  heading: { ...Typography.h3, color: Colors.onSurface, marginBottom: Spacing.sm },
  list: { gap: Spacing.sm },
  item: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemContent: { flex: 1 },
  itemText: { ...Typography.bodyMd, fontSize: 13, color: Colors.onSurface, lineHeight: 18 },
  itemHighlight: { fontWeight: '700' },
  metaRow: { flexDirection: 'row', marginTop: 2 },
  timestamp: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  actionText: { ...Typography.labelSm, color: Colors.primary, fontWeight: '700' },
});
