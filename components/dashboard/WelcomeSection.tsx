import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface WelcomeSectionProps {
  firstName?: string;
  subtitle?: string;
}

const DEFAULT_SUBTITLE = 'Bugün çevrende keşfedebileceğin yeni workshopları senin için hazırladım.';

export function WelcomeSection({ firstName, subtitle = DEFAULT_SUBTITLE }: WelcomeSectionProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.greeting}>Merhaba {firstName ?? ''} 👋</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md },
  greeting: { ...Typography.h2, color: Colors.primary, textAlign: 'center' },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
});
