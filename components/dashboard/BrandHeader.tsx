import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../constants/theme';

export function BrandHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xs }]}>
      <Text style={styles.wordmark}>Atolium</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingBottom: Spacing.sm,
    alignItems: 'center',
  },
  wordmark: {
    ...Typography.serifHeading,
    color: Colors.onSurface,
  },
});
