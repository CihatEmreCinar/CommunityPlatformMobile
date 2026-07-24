import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../ui/Icon';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
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
              <Icon name={chip.icon} size={13} color={Colors.primaryDarker} />
              <Text style={styles.chipText}>{chip.label}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

export const DashboardHero = React.memo(DashboardHeroBase);

const styles = StyleSheet.create({
  // Tier 1 — hero kart: solid doygun pastel (teal 200-300 tonu), koyu ton metin.
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLighter,
    borderRadius: Radius.xxxl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
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
    backgroundColor: Colors.glassOverlay.medium,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  chipText: { ...Typography.labelSm, color: Colors.primaryDarker, fontWeight: '700' },
});
