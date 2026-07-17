import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Radius } from '../../constants/theme';

export type CoverImageProps = {
  /** Kapak görseli URL'i. null/undefined ise nötr bir placeholder gösterilir. */
  uri?: string | null;
  /** Kapak yüksekliği (spec: 180-240px). */
  height?: number;
  /** Düzenleme modu — true ise sağ altta "kapağı değiştir" rozeti gösterilir. */
  editable?: boolean;
  /** Yükleniyor durumu (yeni kapak upload edilirken). */
  uploading?: boolean;
  /** editable=true iken dokununca çağrılır (galeri açma vb.). */
  onPress?: () => void;
  /** Erişilebilirlik: kapak görselinin ne temsil ettiği. */
  accessibilityLabel?: string;
};

/**
 * Tam genişlikte kapak/banner görseli. Alt köşeleri yuvarlatılmış, üzerinde
 * okunabilirlik için hafif koyu overlay var. Görsel yoksa nötr, "kırık"
 * hissi vermeyen bir placeholder gösterilir. Hem salt-okunur profil
 * görünümünde hem de profil düzenleme ekranında (editable=true) aynı
 * component kullanılır — böylece iki yerde de kapak/avatar konumu birebir
 * aynı ve tutarlı olur.
 */
export function CoverImage({
  uri,
  height = 210,
  editable = false,
  uploading = false,
  onPress,
  accessibilityLabel = 'Kapak görseli',
}: CoverImageProps) {
  const opacity = useRef(new Animated.Value(uri ? 0 : 1)).current;

  const handleLoad = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const [failed, setFailed] = useState(false);
  const showImage = !!uri && !failed;

  const content = (
    <View style={[styles.wrap, { height }]}>
      {showImage ? (
        <Animated.Image
          source={{ uri }}
          style={[styles.image, { opacity }]}
          onLoad={handleLoad}
          onError={() => setFailed(true)}
          accessible
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="image"
        />
      ) : (
        <View style={styles.placeholder}>
          <Icon name="imageOutline" size={30} color={Colors.outlineVariant} />
        </View>
      )}

      {/* Okunabilirlik için hafif koyu overlay (%20-25) */}
      {showImage ? <View style={styles.overlay} pointerEvents="none" /> : null}

      {editable ? (
        <TouchableOpacity
          style={styles.editBadge}
          onPress={onPress}
          disabled={uploading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Kapak görselini değiştir"
        >
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Icon name="camera" size={14} color={Colors.white} />
              <Text style={styles.editBadgeText}>Kapağı Değiştir</Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (!editable) return content;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={uploading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel + ' — değiştirmek için dokun'}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: Radius.xl + 4,
    borderBottomRightRadius: Radius.xl + 4,
    backgroundColor: Colors.surfaceContainer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  editBadge: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,32,29,0.55)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
});
