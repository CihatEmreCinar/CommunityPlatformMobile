import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Icon, IconName } from './Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';

export type ButtonVariant = 'solid' | 'tile';
export type ButtonColor = 'primary' | 'danger';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  color?: ButtonColor;
  icon?: IconName;
  iconSize?: number;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'solid',
  color = 'primary',
  icon,
  iconSize = 16,
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  if (variant === 'tile') {
    return (
      <TouchableOpacity style={[styles.tile, style]} activeOpacity={0.85} onPress={onPress} disabled={disabled}>
        {icon && <Icon name={icon} size={20} color={Pastel.teal.text} />}
        <Text style={styles.tileLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }

  // 'solid' = tek gerçek CTA — primary teal doygun kalır (vurgu noktası kuralı).
  const backgroundColor = loading
    ? Colors.outline
    : color === 'danger'
    ? Pastel.coral.text
    : Colors.primary;

  return (
    <TouchableOpacity
      style={[styles.solid, { backgroundColor }, icon ? styles.solidWithIcon : null, style]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.onPrimary} />
      ) : (
        <>
          {icon && <Icon name={icon} size={iconSize} color={Colors.onPrimary} />}
          <Text style={styles.solidLabel}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Flat pastel tile — dashboard hızlı işlemler.
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Pastel.teal.tint,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.sm + 2,
  },
  tileLabel: { ...Typography.labelMd, color: Pastel.teal.text },
  solid: {
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidWithIcon: { flexDirection: 'row', gap: 6 },
  solidLabel: { ...Typography.labelMd, color: Colors.onPrimary },
});
