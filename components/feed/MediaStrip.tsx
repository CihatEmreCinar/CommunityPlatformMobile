import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet } from 'react-native';
import type { MediaStripProps } from './types';
import { Radius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function MediaStrip({ media }: MediaStripProps) {
  if (!media || media.length === 0) return null;

  if (media.length === 1) {
    return <Image source={{ uri: media[0].url }} style={styles.single} resizeMode="cover" />;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
      {media.map((m) => (
        <Image key={m.id} source={{ uri: m.url }} style={styles.thumb} resizeMode="cover" />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { gap: 4, paddingHorizontal: 2 },
  single: { width: '100%', height: 220, borderRadius: Radius.lg },
  thumb: { width: SCREEN_WIDTH * 0.65, height: 200, borderRadius: Radius.lg },
});
