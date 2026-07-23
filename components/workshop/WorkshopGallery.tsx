import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

export interface WorkshopGalleryProps {
  imageUrl: string | null;
}

export function WorkshopGallery({ imageUrl }: WorkshopGalleryProps) {
  if (!imageUrl) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Galeri</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.serifTitle,
    color: Colors.onSurface,
  },
  scrollContent: {
    gap: Spacing.sm,
  },
  image: {
    width: 240,
    height: 160,
    borderRadius: Radius.xxl,
    backgroundColor: Colors.surfaceContainer,
  },
});
