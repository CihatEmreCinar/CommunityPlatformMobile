import React, { useEffect, useRef } from 'react';
import { Animated, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '../ui/Icon';
import { Colors, Typography } from '../../constants/theme';

export interface AtiMascotProps {
  size?: number;
  status?: 'live' | 'idle' | 'none';
  statusLabel?: string;
  source?: ImageSourcePropType;
}

export function AtiMascot({ size = 88, status = 'live', statusLabel = 'CANLI', source }: AtiMascotProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        {source ? (
          <Image source={source} style={{ width: size * 0.7, height: size * 0.7 }} contentFit="contain" />
        ) : (
          <Icon name="aiMatch" size={size * 0.42} color={Colors.primaryDarker} />
        )}
      </View>
      {status !== 'none' && (
        <View style={styles.statusRow}>
          <PulseDot active={status === 'live'} />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      )}
    </View>
  );
}

function PulseDot({ active }: { active: boolean }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, opacity]);

  return (
    <Animated.View
      style={[
        styles.dot,
        { opacity: active ? opacity : 1, backgroundColor: active ? Colors.primaryDarker : Colors.outline },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  // Hero kartın (doygun teal) üzerinde oturuyor — yarı saydam beyaz halka.
  circle: {
    backgroundColor: Colors.glassOverlay.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.glassOverlay.border,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...Typography.labelSm, color: Colors.primaryDarker, fontWeight: '700', letterSpacing: 1 },
});
