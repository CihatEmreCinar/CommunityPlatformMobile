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
  // Hero (doygun pastel teal) üzerinde okunabilirlik için koyu ton metin.
  greeting: { ...Typography.serifTitleLg, color: Colors.primaryDarker, textAlign: 'center' },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.primaryDark,
    textAlign: 'center',
    lineHeight: 20,
  },
});
