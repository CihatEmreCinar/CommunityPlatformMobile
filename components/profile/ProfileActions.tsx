import React, { useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Radius } from '../../constants/theme';

export type ProfileActionsProps =
  | {
      variant: 'own';
      onEditProfile: () => void;
      onShareProfile: () => void;
    }
  | {
      variant: 'other';
      isFollowing: boolean;
      followLoading?: boolean;
      onFollow: () => void;
      onMessage: () => void;
    };

/** Basılınca hafifçe küçülüp geri açılan (elevation hissi veren) pill buton. */
function AnimatedPillButton({
  onPress,
  disabled,
  style,
  children,
  accessibilityLabel,
}: {
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  children: React.ReactNode;
  accessibilityLabel: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, friction: 6 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={style}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Kendi profilinde: Profili Düzenle + Paylaş.
 * Başkasının profilinde: Takip Et/Takip Ediliyor + Mesaj.
 * Modern, yuvarlak hatlı, mobilde yan yana sığacak şekilde tasarlandı.
 */
export function ProfileActions(props: ProfileActionsProps) {
  if (props.variant === 'own') {
    return (
      <View style={styles.row}>
        <AnimatedPillButton
          style={styles.primaryBtn}
          onPress={props.onEditProfile}
          accessibilityLabel="Profili düzenle"
        >
          <Icon name="createOutline" size={15} color={Colors.white} />
          <Text style={styles.primaryBtnText}>Düzenle</Text>
        </AnimatedPillButton>
        <AnimatedPillButton
          style={styles.secondaryBtn}
          onPress={props.onShareProfile}
          accessibilityLabel="Profili paylaş"
        >
          <Icon name="shareSocialOutline" size={15} color={Colors.primary} />
        </AnimatedPillButton>
      </View>
    );
  }

  const { isFollowing, followLoading, onFollow, onMessage } = props;

  return (
    <View style={styles.row}>
      <AnimatedPillButton
        style={[styles.primaryBtn, isFollowing && styles.primaryBtnOutlined]}
        onPress={onFollow}
        disabled={followLoading}
        accessibilityLabel={isFollowing ? 'Takibi bırak' : 'Takip et'}
      >
        {followLoading ? (
          <ActivityIndicator size="small" color={isFollowing ? Colors.primary : Colors.white} />
        ) : (
          <>
            <Icon
              name={isFollowing ? 'following' : 'follow'}
              size={15}
              color={isFollowing ? Colors.primary : Colors.white}
            />
            <Text style={[styles.primaryBtnText, isFollowing && styles.primaryBtnTextOutlined]}>
              {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
            </Text>
          </>
        )}
      </AnimatedPillButton>
      <AnimatedPillButton
        style={styles.secondaryBtn}
        onPress={onMessage}
        accessibilityLabel="Mesaj gönder"
      >
        <Icon name="chatbubbleEllipsesOutline" size={15} color={Colors.primary} />
      </AnimatedPillButton>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 9,
    minHeight: 36,
    justifyContent: 'center',
  },
  primaryBtnOutlined: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  primaryBtnTextOutlined: {
    color: Colors.primary,
  },
  secondaryBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
});
