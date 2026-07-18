import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../constants/theme';

/**
 * Ekranın en tepesinde, telefonun status bar / kamera çentiği alanının
 * ALTINDA kalacak şekilde safe-area'ya duyarlı marka başlığı.
 *
 * DashboardTicker'ın hemen üzerinde render edilir; böylece ticker artık
 * status bar/kamera bölgesine taşmaz — kendi safe-area hesaplamasını
 * kendi içinde yapar, kullanan ekran (home.tsx) insets ile uğraşmaz.
 */
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
    backgroundColor: Colors.surfaceContainerLowest,
    paddingBottom: Spacing.sm,
    alignItems: 'center',
  },
  wordmark: {
    ...Typography.h2,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
});
