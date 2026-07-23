import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  style?: StyleProp<ViewStyle>;
}

export function AuthButton({ label, onPress, loading, disabled, variant = 'primary', style }: AuthButtonProps) {
  if (variant === 'ghost') {
    return (
      <TouchableOpacity style={[styles.ghost, style]} onPress={onPress} disabled={disabled} activeOpacity={0.7}>
        <Text style={styles.ghostLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      style={[styles.primary, (loading || disabled) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.primaryLabel}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.7 },
  primaryLabel: { ...Typography.labelMd, color: Colors.onPrimary, fontSize: 14 },
  ghost: { alignSelf: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  ghostLabel: { ...Typography.labelMd, color: Colors.primary },
});
