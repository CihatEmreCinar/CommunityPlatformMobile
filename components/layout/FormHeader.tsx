import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { IconCircleButton } from '../ui/IconCircleButton';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

type FormHeaderProps = {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  saveLabel?: string;
  accentColor?: string;
};

export function FormHeader({
  title,
  onClose,
  onSave,
  saving = false,
  saveLabel = 'Kaydet',
  accentColor = Colors.primary,
}: FormHeaderProps) {
  return (
    <View style={styles.header}>
      <IconCircleButton
        icon="close"
        onPress={onClose}
        accessibilityLabel="Kapat"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: accentColor }, saving && styles.saveBtnDisabled]}
        onPress={onSave}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel={saveLabel}
        accessibilityState={{ disabled: saving, busy: saving }}
      >
        {saving ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.saveBtnText}>{saveLabel}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
  headerTitle: { ...Typography.serifTitle, color: Colors.onSurface },
  saveBtn: { borderRadius: Radius.full, paddingHorizontal: 18, paddingVertical: 8, minWidth: 72, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { ...Typography.labelMd, color: Colors.white },
});
