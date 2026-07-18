import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Typography } from '../../constants/theme';
import type { TickerItem } from '../../utils/dailyBrief';

interface LiveTickerProps {
  items: TickerItem[];
  /** px/saniye cinsinden kayma hızı */
  speed?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Web tasarımındaki `@keyframes ticker` (translateX 100% -> -100%) davranışının
 * RN karşılığı. Ek kütüphane gerekmeden Animated API ile tek geçişlik bir
 * haber bandı oluşturur.
 */
export function LiveTicker({ items, speed = 60 }: LiveTickerProps) {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (!contentWidth) return undefined;

    translateX.setValue(SCREEN_WIDTH);
    const distance = SCREEN_WIDTH + contentWidth;
    const duration = (distance / speed) * 1000;

    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -contentWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentWidth, speed]);

  if (items.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[styles.track, { transform: [{ translateX }] }]}
        onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
      >
        {items.map((item, index) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.item}>
              <Icon name={item.icon as any} size={14} color={Colors.onPrimaryContainer} />
              <Text style={styles.text}>{item.text}</Text>
            </View>
            {index < items.length - 1 && <Text style={styles.dot}>•</Text>}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: Colors.primaryContainer,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  text: { ...Typography.labelSm, color: Colors.onPrimaryContainer, fontWeight: '700' },
  dot: { color: Colors.onPrimaryContainer, opacity: 0.5 },
});
