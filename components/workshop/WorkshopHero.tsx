import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../ui/Icon';
import { Colors, Spacing } from '../../constants/theme';

export interface WorkshopHeroProps {
  imageUrl: string | null;
  topInset: number;
  onBack: () => void;
  onShare: () => void;
}

const HERO_HEIGHT = 397;

export function WorkshopHero({ imageUrl, topInset, onBack, onShare }: WorkshopHeroProps) {
  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imageFallback}>
          <View style={styles.fallbackIconWrap}>
            <Icon name="imageOutline" size={32} color={Colors.primary} />
          </View>
        </View>
      )}

      <LinearGradient
        colors={['transparent', Colors.surface]}
        style={styles.gradientFade}
        pointerEvents="none"
      />

      <View style={[styles.topBar, { top: topInset + Spacing.sm }]}>
        <GlassButton icon="arrowBack" onPress={onBack} />
        <GlassButton icon="share" onPress={onShare} />
      </View>
    </View>
  );
}

function GlassButton({ icon, onPress }: { icon: 'arrowBack' | 'share'; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.glassButtonTouchable}>
      <BlurView intensity={40} tint="light" style={styles.glassButton}>
        <Icon name={icon} size={20} color={Colors.onSurface} />
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    width: '100%',
    backgroundColor: Colors.surfaceContainer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
  },
  fallbackIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 128,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
  },
  glassButtonTouchable: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  glassButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
