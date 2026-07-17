import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FEED_ACCENT_COLOR } from './FeedConfiguration';
import type { AuthorAvatarProps } from './types';

export function AuthorAvatar({ url, name, size = 40 }: AuthorAvatarProps) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  if (url) {
    return <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: FEED_ACCENT_COLOR, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '700' },
});
