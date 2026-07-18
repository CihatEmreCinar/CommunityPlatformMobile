import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../ui/Icon';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import { AtiMascot, AtiMascotProps } from './AtiMascot';
import { WelcomeSection } from './WelcomeSection';

export interface DiscoveryChip {
  icon: IconName;
  label: string;
}

interface DashboardHeroProps {
  firstName?: string;
  subtitle?: string;
  chips?: DiscoveryChip[];
  mascotProps?: Partial<AtiMascotProps>;
}

function DashboardHeroBase({ firstName, subtitle, chips = [], mascotProps }: DashboardHeroProps) {
  // Spec: "Hero hafif yukarıdan gelsin" — sayfa açılırken tek seferlik
  // fade + translateY girişi. useNativeDriver: true, JS thread'i bloklamaz.
  const translateY = useRef(new Animated.Value(-16)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 420, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <AtiMascot {...mascotProps} />
      <WelcomeSection firstName={firstName} subtitle={subtitle} />
      {chips.length > 0 && (
        <View style={styles.chipRow}>
          {chips.map((chip, index) => (
            <View key={`${chip.label}-${index}`} style={styles.chip}>
              <Icon name={chip.icon} size={13} color={Colors.primary} />
              <Text style={styles.chipText}>{chip.label}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

// Spec: "Hero component'i gereksiz render olmamalıdır." — parent (DashboardScreen)
// her state güncellemesinde (ör. scroll) yeniden render olsa da, prop'lar
// değişmediği sürece Hero atlanır.
export const DashboardHero = React.memo(DashboardHeroBase);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    ...Shadows.card,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  chipText: { ...Typography.labelSm, color: Colors.onSurfaceVariant, fontWeight: '600' },
});
