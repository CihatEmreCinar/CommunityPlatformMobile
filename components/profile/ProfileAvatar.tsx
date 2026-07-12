import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export type ProfileAvatarProps = {
  uri?: string | null;
  /** İsim baş harfleri (fallback) için. */
  name: string;
  /** Avatar boyutu (spec: 110-130px). */
  size?: number;
  editable?: boolean;
  uploading?: boolean;
  onPress?: () => void;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Büyük, dairesel, beyaz çerçeveli avatar. Kapak görselinin üzerine
 * ~%40-50 bindirilecek şekilde tasarlanmıştır (konumlandırma ProfileHeader'da
 * negative margin ile yapılır — bu component sadece görsel gösterimden
 * sorumludur). Basılı tutunca hafif küçülme animasyonu (mobilde "hover"
 * karşılığı) ve mount'ta fade-in içerir.
 */
export function ProfileAvatar({
  uri,
  name,
  size = 116,
  editable = false,
  uploading = false,
  onPress,
}: ProfileAvatarProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [failed, setFailed] = useState(false);

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 6 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  };

  const showImage = !!uri && !failed;
  const ringSize = size + 10; // beyaz çerçeve payı

  const body = (
    <Animated.View
      style={[
        styles.ring,
        {
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={() => setFailed(true)}
          accessible
          accessibilityLabel={`${name} profil fotoğrafı`}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{getInitials(name) || '?'}</Text>
        </View>
      )}

      {editable ? (
        <View style={styles.editBadge}>
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Ionicons name="camera" size={15} color={Colors.white} />
          )}
        </View>
      ) : null}
    </Animated.View>
  );

  if (!editable) return body;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={uploading}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel="Profil fotoğrafını değiştir"
    >
      {body}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ring: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  fallback: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.white,
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
});
