import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

export interface WorkshopGalleryProps {
  imageUrl: string | null;
}

/**
 * Stitch tasarımı çoklu fotoğraf galerisi öngörüyor; Atolium'da workshop
 * başına tek `coverImageUrl` var (çoklu galeri alanı backend'de yok).
 * Onaylandığı gibi: tek fotoğraf, aynı kart stiliyle gösteriliyor.
 * Çoklu galeri eklenirse yalnızca `images` prop'u array'e döner, kart stili aynı kalır.
 */
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
    ...Typography.titleLg,
    color: Colors.onSurface,
  },
  scrollContent: {
    gap: Spacing.sm,
  },
  image: {
    width: 240,
    height: 160,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surfaceContainer,
  },
});
