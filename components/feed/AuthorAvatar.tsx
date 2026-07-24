import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Pastel } from '../../constants/theme';
import type { AuthorAvatarProps } from './types';

export function AuthorAvatar({ url, name, size = 40, variant = 'teal' }: AuthorAvatarProps) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const palette = Pastel[variant];

  if (url) {
    return <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.tintStrong },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36, color: palette.text }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '700' },
});
