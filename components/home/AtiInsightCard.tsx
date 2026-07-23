import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';

interface AtiInsightCardProps {
  message: string;
  onViewRecommendations: () => void;
  onDismiss: () => void;
}

export function AtiInsightCard({ message, onViewRecommendations, onDismiss }: AtiInsightCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        <Icon name="aiMatch" size={28} color={Pastel.teal.text} />
      </View>
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <Icon name="star" size={12} color={Pastel.teal.text} />
          <Text style={styles.badgeText}>ATI ÖNERİLERİ</Text>
          <PulseDot />
        </View>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={onViewRecommendations}
          >
            <Text style={styles.primaryBtnText}>Önerileri Gör</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={onDismiss}
          >
            <Text style={styles.secondaryBtnText}>Kapat</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PulseDot() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.pulseDot, { opacity }]} />;
}

const styles = StyleSheet.create({
  // Aktivite/öneri katmanı — border'sız, %8 opasiteli pastel.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Pastel.teal.tint,
    borderRadius: Radius.xxl,
    padding: Spacing.md,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Pastel.teal.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: Spacing.xs },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeText: { ...Typography.labelSm, color: Pastel.teal.text, fontWeight: '700', letterSpacing: 1 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Pastel.teal.text },
  message: { ...Typography.serifTitle, fontSize: 17, lineHeight: 22, color: Colors.onSurface },
  actions: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs, flexWrap: 'wrap' },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  primaryBtnText: { ...Typography.labelSm, color: Colors.onPrimary, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  secondaryBtnText: { ...Typography.labelSm, color: Colors.onSurface, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
