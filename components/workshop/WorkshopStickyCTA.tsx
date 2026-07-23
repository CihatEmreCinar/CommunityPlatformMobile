import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Button } from '../ui/Button';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

export interface WorkshopStickyCTAProps {
  price: number;
  buttonText: string;
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
  bottomInset: number;
}

export function WorkshopStickyCTA({
  price,
  buttonText,
  disabled,
  loading,
  onPress,
  bottomInset,
}: WorkshopStickyCTAProps) {
  return (
    <BlurView intensity={50} tint="light" style={styles.wrapper}>
      <View style={[styles.content, { paddingBottom: Spacing.sm + bottomInset }]}>
        <View>
          <Text style={styles.priceLabel}>Fiyat</Text>
          <Text style={styles.priceValue}>{price} ₺</Text>
        </View>
        <Button
          label={buttonText}
          onPress={onPress}
          disabled={disabled}
          loading={loading}
          style={styles.button}
        />
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  // Flat yön: üst hairline kaldırıldı — blur/translucency tek başına ayrıştırıyor.
  wrapper: {
    backgroundColor: 'rgba(253,252,250,0.88)',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.sm,
  },
  priceLabel: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  priceValue: {
    ...Typography.titleLg,
    color: Colors.primary,
  },
  button: {
    height: 52,
    minWidth: 160,
    borderRadius: Radius.full,
    paddingVertical: 0,
  },
});
