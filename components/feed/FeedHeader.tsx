import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';
import { FEED_ACCENT_COLOR } from './FeedConfiguration';

type FeedHeaderProps = {
  showCreateButton: boolean;
  onCreatePress: () => void;
};

export function FeedHeader({ showCreateButton, onCreatePress }: FeedHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Akış</Text>
      {showCreateButton && (
        <TouchableOpacity style={styles.createBtn} onPress={onCreatePress}>
          <Icon name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createBtnText}>Paylaş</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: FEED_ACCENT_COLOR, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  createBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});
