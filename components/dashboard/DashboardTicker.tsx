import React from 'react';
import { StyleSheet, View } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import { Colors, Typography } from '../../constants/theme';
import type { TickerItem } from '../../utils/dailyBrief';

interface DashboardTickerProps {
  messages: TickerItem[];
  speed?: number;
}

const SEPARATOR = '     •     ';
const BASE_MS_PER_CHAR = 150;
const MIN_CONTENT_LENGTH = 220;

export function DashboardTicker({ messages, speed = 50 }: DashboardTickerProps) {
  if (messages.length === 0) return null;

  const singleContent = messages.map((m) => m.text).join(SEPARATOR);
  let content = singleContent;
  while (content.length < MIN_CONTENT_LENGTH) {
    content += SEPARATOR + singleContent;
  }

  const msPerChar = BASE_MS_PER_CHAR * (50 / speed);
  const duration = Math.max(2000, content.length * msPerChar);

  return (
    <View style={styles.container} pointerEvents="none">
      <TextTicker
        style={styles.text}
        duration={duration}
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
  // Lüks/pastel yön: solid koyu teal yerine hero ile aynı doygun pastel ton.
  container: {
    height: 36,
    backgroundColor: Colors.primaryLighter,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  text: {
    ...Typography.labelSm,
    color: Colors.primaryDarker,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
