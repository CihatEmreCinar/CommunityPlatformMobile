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
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';

export type ButtonVariant = 'solid' | 'tile';
export type ButtonColor = 'primary' | 'danger';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  /** 'tile': dashboard hızlı işlem kutucuğu (ikon solda, bordered).
   *  'solid': dolu arkaplanlı aksiyon butonu (varsayılan). */
  variant?: ButtonVariant;
  /** yalnızca variant='solid' için: arkaplan rengini belirler. */
  color?: ButtonColor;
  icon?: IconName;
  iconSize?: number;
  /** true olduğunda: buton metni yerine spinner gösterilir, arkaplan
   *  Colors.outline'a döner (orijinaldeki "submitting" davranışı). */
  loading?: boolean;
  /** yalnızca etkileşimi kapatır, loading'in aksine görünümü DEĞİŞTİRMEZ —
   *  orijinal cancel/approve/reject butonlarının davranışıyla birebir aynı. */
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
        {icon && <Icon name={icon} size={20} color={Colors.primary} />}
        <Text style={styles.tileLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }

  const backgroundColor = loading
    ? Colors.outline
    : color === 'danger'
    ? Colors.error
    : Colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.solid,
        { backgroundColor },
        icon ? styles.solidWithIcon : null,
        style,
      ]}
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
  // ─── variant="tile" (dashboard hızlı işlemler) ────────────────────────────
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
  },
  tileLabel: {
    ...Typography.labelMd,
    color: Colors.primary,
  },
  // ─── variant="solid" (rezervasyon kart aksiyonları) ───────────────────────
  solid: {
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidWithIcon: {
    flexDirection: 'row',
    gap: 6,
  },
  solidLabel: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
  },
});
