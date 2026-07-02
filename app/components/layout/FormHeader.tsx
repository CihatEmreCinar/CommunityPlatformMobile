import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FormHeaderProps = {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  saveLabel?: string;
  accentColor?: string;
};

/** Kapat (X) / başlık / Kaydet düzenindeki ortak form header'ı. */
export function FormHeader({
  title,
  onClose,
  onSave,
  saving = false,
  saveLabel = 'Kaydet',
  accentColor = '#0F766E',
}: FormHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={24} color="#374151" />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  saveBtn: { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, minWidth: 72, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
