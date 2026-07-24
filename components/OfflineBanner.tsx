import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './ui/Icon';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Pastel, Typography, Spacing } from '../constants/theme';

/**
 * İnternet bağlantısı yokken ekranın üstünde sabit bir uyarı şeridi gösterir.
 * Root layout'a eklenir, tüm ekranlarda (auth dahil) görünür.
 */
export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + Spacing.xs }]} pointerEvents="none">
      <Icon name="cloudOfflineOutline" size={14} color={Pastel.amber.text} />
      <Text style={styles.text}>İnternet bağlantısı yok</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingBottom: Spacing.xs,
    backgroundColor: Pastel.amber.tint,
  },
  text: {
    ...Typography.labelSm,
    color: Pastel.amber.text,
    fontWeight: '700',
  },
});
