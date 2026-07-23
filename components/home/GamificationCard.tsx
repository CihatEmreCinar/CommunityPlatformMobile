import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';

interface GamificationCardProps {
  levelLabel: string;
  xp: number;
  progressPercent: number;
  streakDays?: number;
  nextBadgeGoal?: string;
}

export function GamificationCard({
  levelLabel,
  xp,
  progressPercent,
  streakDays,
  nextBadgeGoal,
}: GamificationCardProps) {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  const showStats = streakDays !== undefined || nextBadgeGoal !== undefined;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.xpIconWrap}>
          <Icon name="bolt" size={22} color={Colors.onPrimary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.levelLabel}>{levelLabel}</Text>
          <Text style={styles.xpLabel}>{xp.toLocaleString('tr-TR')} XP</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clamped}%` }]} />
      </View>

      {showStats && (
        <View style={styles.statsRow}>
          {streakDays !== undefined && (
            <View style={styles.statBox}>
              <Icon name="bolt" size={18} color={Pastel.purple.text} />
              <Text style={styles.statValue}>{streakDays}</Text>
              <Text style={styles.statLabel}>Gün Serisi</Text>
            </View>
          )}
          {nextBadgeGoal && (
            <View style={[styles.statBox, styles.statBoxHighlight]}>
              <Icon name="star" size={18} color={Pastel.amber.text} />
              <Text style={[styles.statValue, styles.statValueHighlight]}>{nextBadgeGoal}</Text>
              <Text style={[styles.statLabel, styles.statLabelHighlight]}>Sıradaki Rozete</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Tier 2 — ikincil/istatistik kartı: teal tint, border yok.
  card: {
    backgroundColor: Pastel.teal.tint,
    borderRadius: Radius.xl,
    padding: Spacing.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  xpIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  levelLabel: { ...Typography.labelMd, color: Colors.onSurface },
  xpLabel: { ...Typography.labelSm, color: Pastel.teal.text, fontWeight: '700', marginTop: 2 },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: { height: 8, borderRadius: Radius.full, backgroundColor: Colors.primary },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statBoxHighlight: { backgroundColor: Pastel.amber.tintStrong },
  statValue: { ...Typography.labelMd, color: Colors.onSurface },
  statValueHighlight: { color: Pastel.amber.text },
  statLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant, textAlign: 'center' },
  statLabelHighlight: { color: Pastel.amber.text },
});
