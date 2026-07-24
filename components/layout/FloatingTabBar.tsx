import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../ui/Icon';
import { Colors, Radius, Spacing } from '../../constants/theme';

export interface FloatingTabItem {
  key: string;
  icon: IconName;
  /** Ekran okuyucular için sekme adı (görsel bir metin göstermiyoruz, sadece a11y). */
  label: string;
}

interface FloatingTabBarProps {
  /** Tam olarak 4 eleman: showCreateButton=true iken 2 sol + 2 sağ, false iken 4'ü ortalanmış. */
  tabs: FloatingTabItem[];
  /**
   * Aktif sekmenin key'i. Görünür sekmelerden hiçbiri aktif değilse (ör. gizli bir
   * ikincil rotadayken) boş string geçilir; bu durumda hiçbir sekme "seçili" görünmez.
   */
  activeKey: string;
  onTabPress: (key: string) => void;
  /** Cafe / Employer(workshop) rollerinde true, Employee'de false. */
  showCreateButton?: boolean;
  onCreatePress?: () => void;
  /** "+" butonunun a11y etiketi (örn. "Gönderi oluştur"). */
  createLabel?: string;
}

const BAR_HEIGHT = 56;
const CREATE_SIZE = 40;
// Yüzen "pill" ekranın kenarlarından bu kadar içeride durur.
const BAR_H_INSET = Spacing.sm;
// İçerik ile pill'in üst kenarı arasında bırakılan görsel boşluk.
const BAR_GAP = Spacing.xl;
// Home indicator olmayan cihazlarda pill'in alttan minimum boşluğu.
const BAR_MIN_BOTTOM = Spacing.sm;

// Pill'in ekran altından ne kadar yukarıda yüzdüğü (home indicator'ı da kapsar).
function useBarBottomOffset() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, BAR_MIN_BOTTOM);
}

/**
 * FloatingTabBar altında olan ekranların scroll içeriğinin (ScrollView/FlatList)
 * contentContainerStyle.paddingBottom değerine BU değer verilmelidir — üstüne
 * başka bir şey EKLENMEZ. Değer safe-area farkını (home indicator) hesaba katar,
 * böylece boşluk her ekranda görsel olarak aynı kalır.
 *
 * Not: Bu ekranlar bottom safe-area kenarını (SafeAreaView edges 'bottom') KULLANMAZ;
 * alt safe-area'yı pill'in kendisi yönetir. ScreenContainer floatingTabBar=true iken
 * 'bottom' kenarını otomatik olarak düşürür.
 */
export function useFloatingTabBarClearance() {
  const bottomOffset = useBarBottomOffset();
  return bottomOffset + BAR_HEIGHT + BAR_GAP;
}

export function FloatingTabBar({ tabs, activeKey, onTabPress, showCreateButton = false, onCreatePress, createLabel = 'Oluştur' }: FloatingTabBarProps) {
  const isDark = useColorScheme() === 'dark';
  const bottomOffset = useBarBottomOffset();

  const barBg = isDark ? Colors.primaryDarkest : Colors.surfaceContainerLowest;
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : Colors.surfaceVariant;
  const mutedIconColor = isDark ? 'rgba(255,255,255,0.45)' : Colors.outline;
  const activeIconColor = isDark ? Colors.white : Colors.onSurface;
  const createBg = isDark ? 'rgba(255,255,255,0.12)' : Colors.surfaceContainerHigh;
  const createIconColor = isDark ? Colors.white : Colors.onSurface;

  // Aktif sekme renk geçişi (opacity crossfade).
  const colorAnims = useRef<Record<string, Animated.Value>>({}).current;
  // Basınca yaylanan ölçek geri bildirimi (spring scale).
  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current;
  tabs.forEach((t) => {
    if (!colorAnims[t.key]) colorAnims[t.key] = new Animated.Value(t.key === activeKey ? 1 : 0);
    if (!scaleAnims[t.key]) scaleAnims[t.key] = new Animated.Value(1);
  });
  const createScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    tabs.forEach((t) => {
      Animated.timing(colorAnims[t.key], {
        toValue: t.key === activeKey ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const pressIn = (v: Animated.Value) => {
    Animated.spring(v, { toValue: 0.88, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };
  const pressOut = (v: Animated.Value) => {
    Animated.spring(v, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  };

  const renderTab = (tab: FloatingTabItem) => {
    const colorAnim = colorAnims[tab.key];
    const scaleAnim = scaleAnims[tab.key];
    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => onTabPress(tab.key)}
        onPressIn={() => pressIn(scaleAnim)}
        onPressOut={() => pressOut(scaleAnim)}
        activeOpacity={0.85}
        style={styles.tabItem}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: tab.key === activeKey }}
      >
        <Animated.View style={[styles.iconStack, { transform: [{ scale: scaleAnim }] }]}>
          <Icon name={tab.icon} size={26} color={mutedIconColor} />
          <Animated.View style={[StyleSheet.absoluteFill, styles.iconOverlay, { opacity: colorAnim }]}>
            <Icon name={tab.icon} size={26} color={activeIconColor} />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const leftTabs = showCreateButton ? tabs.slice(0, 2) : tabs;
  const rightTabs = showCreateButton ? tabs.slice(2, 4) : [];

  return (
    <View style={[styles.container, { backgroundColor: barBg, borderColor, bottom: bottomOffset }]}>
      <View style={styles.row}>
        {leftTabs.map(renderTab)}

        {showCreateButton && (
          <TouchableOpacity
            onPress={onCreatePress}
            onPressIn={() => pressIn(createScale)}
            onPressOut={() => pressOut(createScale)}
            activeOpacity={0.85}
            style={styles.tabItem}
            accessibilityRole="button"
            accessibilityLabel={createLabel}
          >
            <Animated.View style={[styles.createSquare, { backgroundColor: createBg, transform: [{ scale: createScale }] }]}>
              <Icon name="add" size={22} color={createIconColor} />
            </Animated.View>
          </TouchableOpacity>
        )}

        {rightTabs.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Yüzen pill: kenarlardan içeride, tamamen yuvarlatılmış, alt safe-area'nın üstünde.
  container: {
    position: 'absolute',
    left: BAR_H_INSET,
    right: BAR_H_INSET,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStack: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  createSquare: {
    width: CREATE_SIZE,
    height: CREATE_SIZE,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
