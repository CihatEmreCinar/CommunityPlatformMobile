import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

type FeedHeaderProps = {
  showCreateButton: boolean;
  onCreatePress: () => void;
};

export function FeedHeader({ showCreateButton, onCreatePress }: FeedHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Akış</Text>
      {showCreateButton && (
        <TouchableOpacity style={styles.createBtn} onPress={onCreatePress} activeOpacity={0.85}>
          <Icon name="add" size={18} color={Colors.onPrimary} />
          <Text style={styles.createBtnText}>Paylaş</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    ...Typography.serifHeading,
    color: Colors.onSurface,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  createBtnText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
  },
});
