import React from 'react';
import { StyleSheet, View } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import { Colors, Typography } from '../../constants/theme';
import type { TickerItem } from '../../utils/dailyBrief';

interface DashboardTickerProps {
  messages: TickerItem[];
  /** Kayma hızı — büyüdükçe daha hızlı kayar (karakter/sn benzeri bir katsayı) */
  speed?: number;
}

const SEPARATOR = '     •     ';
// Kabaca "ms / karakter" — react-native-text-ticker'ın kendi varsayılan
// formülü de (150ms * karakter sayısı) şeklinde, biz `speed` ile bunu
// ayarlanabilir kılıyoruz. speed büyüdükçe msPerChar küçülür -> daha hızlı.
const BASE_MS_PER_CHAR = 150;

// Kütüphane, metin container genişliğine sığıyorsa animasyonu HİÇ
// başlatmıyor (bkz. calculateMetrics() -> contentFits). animationType
// "scroll" olsa bile bu kontrolden önce geçemiyor. Bunu önlemek için
// tek satırlık içeriği, herhangi bir ekran genişliğine sığmayacak kadar
// (tablet dahil) tekrarlayarak garantiye alıyoruz — gerçek haber bandı
// zaten mesajı arka arkaya tekrarlayarak akar, görsel olarak da doğru.
const MIN_CONTENT_LENGTH = 220;

export function DashboardTicker({ messages, speed = 50 }: DashboardTickerProps) {
  if (messages.length === 0) return null;

  const singleContent = messages.map((m) => m.text).join(SEPARATOR);
  let content = singleContent;
  while (content.length < MIN_CONTENT_LENGTH) {
    content += SEPARATOR + singleContent;
  }

  // speed=50 (varsayılan) -> msPerChar ~150 (kütüphanenin kendi varsayılanı)
  // content tekrarlandığı için uzunluk artıyor, duration da orantılı
  // arttığından görünen kayma HIZI değişmiyor, sadece bir döngü daha
  // uzun sürüyor.
  const msPerChar = BASE_MS_PER_CHAR * (50 / speed);
  const duration = Math.max(2000, content.length * msPerChar);

  return (
    <View style={styles.container} pointerEvents="none">
      <TextTicker
        style={styles.text}
        duration={duration}
        // 'scroll' -> her zaman kesintisiz, tek yönlü, sonsuz kayar.
        // 'auto' (varsayılan) metin container'a sığıyorsa HİÇ animasyon
        // başlatmıyor — ticker'ın "hiç oynamıyor" görünmesinin sebebi
        // muhtemelen buydu.
        animationType="scroll"
        loop
        repeatSpacer={60}
        marqueeDelay={0}
        marqueeOnMount
        useNativeDriver
      >
        {content}
      </TextTicker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  text: {
    ...Typography.labelSm,
    color: Colors.onPrimary,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});