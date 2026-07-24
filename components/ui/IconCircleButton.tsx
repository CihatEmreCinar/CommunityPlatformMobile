import React from 'react';
import { Insets, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Colors } from '../../constants/theme';

const DEFAULT_SIZE = 34;
const DEFAULT_ICON_SIZE = 19;

export interface IconCircleButtonProps {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Dairenin çapı (default 34); borderRadius otomatik olarak size/2 olur. */
  size?: number;
  iconSize?: number;
  iconColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  hitSlop?: Insets;
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Yuvarlak ikon butonu — kapat/geri/paylaş gibi header aksiyonlarında tekrar eden
 * "width:34, height:34, borderRadius:17, surfaceContainer zemin, ortalanmış ikon"
 * desenini tek yerde toplar.
 */
export function IconCircleButton({
  icon,
  onPress,
  accessibilityLabel,
  size = DEFAULT_SIZE,
  iconSize = DEFAULT_ICON_SIZE,
  iconColor = Colors.onSurface,
  backgroundColor = Colors.surfaceContainer,
  disabled = false,
  hitSlop,
  activeOpacity = 0.7,
  style,
}: IconCircleButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      activeOpacity={activeOpacity}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, { width: size, height: size, borderRadius: size / 2, backgroundColor }, style]}
    >
      <Icon name={icon} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
});
