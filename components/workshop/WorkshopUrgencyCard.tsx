import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';

export interface WorkshopUrgencyCardProps {
  capacity: number;
  enrolledCount: number;
}

const PLACEHOLDER_AVATAR_PALETTES = [Pastel.teal, Pastel.purple, Pastel.amber];

export function WorkshopUrgencyCard({ capacity, enrolledCount }: WorkshopUrgencyCardProps) {
  const remaining = Math.max(capacity - enrolledCount, 0);
  const isFull = remaining <= 0;
  const isUrgent = !isFull && remaining <= 3;

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isFull && !isUrgent) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isFull, isUrgent, pulse]);

  const urgentState = isFull || isUrgent;
  const statusColor = urgentState ? Pastel.coral.text : Colors.onSurfaceVariant;
  const statusText = isFull
    ? 'Kapasite doldu'
    : isUrgent
    ? `Son ${remaining} koltuk`
    : `${enrolledCount}/${capacity} kişi kayıtlı`;

  return (
    <View style={[styles.card, { backgroundColor: urgentState ? Pastel.coral.tint : Pastel.teal.tint }]}>
      <View style={styles.statusRow}>
        {urgentState && <Animated.View style={[styles.pulseDot, { opacity: pulse }]} />}
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
      </View>

      <View style={styles.friendsRow}>
        <View style={styles.avatarStack}>
          {PLACEHOLDER_AVATAR_PALETTES.map((palette, i) => (
            <View
              key={i}
              style={[styles.avatar, { backgroundColor: palette.hero, marginLeft: i === 0 ? 0 : -8 }]}
            >
              <Icon name="person" size={12} color={palette.heroText} />
            </View>
          ))}
          <View style={[styles.avatar, styles.avatarOverflow, { marginLeft: -8 }]}>
            <Text style={styles.avatarOverflowText}>+5</Text>
          </View>
        </View>
        <Text style={styles.friendsText}>8 arkadaşın katıldı</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Pastel.coral.text,
  },
  statusText: {
    ...Typography.labelMd,
    fontSize: 13,
  },
  friendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverflow: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  avatarOverflowText: {
    ...Typography.labelSm,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
  },
  friendsText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
});
