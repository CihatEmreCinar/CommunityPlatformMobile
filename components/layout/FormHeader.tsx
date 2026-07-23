import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Icon } from '../ui/Icon';
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
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.closeBtn}>
        <Icon name="close" size={19} color={Colors.onSurface} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: accentColor }, saving && styles.saveBtnDisabled]}
        onPress={onSave}
        disabled={saving}
      >
        {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>{saveLabel}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.serifTitle, color: Colors.onSurface },
  saveBtn: { borderRadius: Radius.full, paddingHorizontal: 18, paddingVertical: 8, minWidth: 72, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { ...Typography.labelMd, color: '#FFFFFF' },
});
