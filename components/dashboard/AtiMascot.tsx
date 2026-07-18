import React, { useEffect, useRef } from 'react';
import { Animated, Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

export interface AtiMascotProps {
  size?: number;
  status?: 'live' | 'idle' | 'none';
  statusLabel?: string;
  /**
   * İleride Illustrator'da hazırlanan gerçek maskot geldiğinde buraya
   * verilecek: PNG için require('.../ati.png') veya { uri }, SVG için
   * react-native-svg tabanlı bir wrapper, Lottie için lottie-react-native
   * kaynağı bu prop'un üstüne kolayca eklenebilir (dosya sonundaki nota bak).
   * Verilmezse emoji fallback gösterilir — bu bileşeni kullanan hiçbir yer
   * (DashboardHero dahil) bundan habersizdir.
   */
  source?: ImageSourcePropType;
}

/** <AtiMascot /> — tamamen bağımsız, tek sorumluluğu maskotu göstermek. */
export function AtiMascot({ size = 88, status = 'live', statusLabel = 'CANLI', source }: AtiMascotProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        {source ? (
          <Image source={source} style={{ width: size * 0.7, height: size * 0.7 }} resizeMode="contain" />
        ) : (
          <Text style={{ fontSize: size * 0.42 }}>🦉</Text>
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
        { opacity: active ? opacity : 1, backgroundColor: active ? Colors.primary : Colors.outline },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  circle: {
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surfaceContainerLowest,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...Typography.labelSm, color: Colors.primary, fontWeight: '700', letterSpacing: 1 },
});

/**
 * Lottie'ye geçiş notu: `lottie-react-native` kurulduğunda bu dosyada
 * `source` bir Lottie JSON'ı olduğunda `<LottieView source={source} autoPlay loop />`
 * render eden bir dal eklenir; AtiMascot'u kullanan hiçbir yer (DashboardHero
 * dahil) değişmez, çünkü dışa açık API hâlâ `<AtiMascot source={...} />`.
 */
