import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Icon, IconName } from '../ui/Icon';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface AuthInputProps extends TextInputProps {
  icon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  rightIconAccessibilityLabel?: string;
}

export function AuthInput({ icon, rightIcon, onRightIconPress, rightIconAccessibilityLabel, style, ...rest }: AuthInputProps) {
  return (
    <View style={styles.wrapper}>
      {icon && <Icon name={icon} size={18} color={Colors.outline} style={styles.icon} />}
      <TextInput
        style={[styles.input, rightIcon ? styles.inputWithAction : null, style]}
        placeholderTextColor={Colors.outlineVariant}
        {...rest}
      />
      {rightIcon && (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={onRightIconPress}
          accessibilityRole="button"
          accessibilityLabel={rightIconAccessibilityLabel}
        >
          <Icon name={rightIcon} size={18} color={Colors.outline} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
  },
  icon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    ...Typography.bodyMd,
    color: Colors.onSurface,
    paddingVertical: Spacing.md,
  },
  inputWithAction: { paddingRight: Spacing.xl },
  rightButton: { position: 'absolute', right: Spacing.sm, padding: Spacing.xs },
});
