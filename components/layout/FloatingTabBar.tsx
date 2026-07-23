import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Icon, IconName } from '../ui/Icon';
import { Colors, Pastel, Radius, Spacing } from '../../constants/theme';

export interface FloatingTabItem {
  key: string;
  icon: IconName;
}

interface FloatingTabBarProps {
  /** Tam olarak 4 eleman: showCreateButton=true iken 2 sol + 2 sağ, false iken 4'ü ortalanmış. */
  tabs: FloatingTabItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
  /** Cafe / Employer(workshop) rollerinde true, Employee'de false. */
  showCreateButton?: boolean;
  onCreatePress?: () => void;
}

// Tab başına sırayla uygulanan pastel aksan — mevcut Pastel tokenlarından.
const ACCENTS = [Pastel.teal, Pastel.coral, Pastel.purple, Pastel.amber];

const FAB_SIZE = 52;

// Ekran içeriğinin (ScrollView/FlatList) FloatingTabBar'ın altında kalmaması için
// tüketen ekranların contentContainerStyle.paddingBottom değerine eklenmesi gereken pay.
export const FLOATING_TAB_BAR_CLEARANCE = FAB_SIZE + Spacing.lg + Spacing.xl;

export function FloatingTabBar({ tabs, activeKey, onTabPress, showCreateButton = false, onCreatePress }: FloatingTabBarProps) {
  const isDark = useColorScheme() === 'dark';

  const islandBg = isDark ? '#1E2321' : '#F5F3EF';
  const mutedIconColor = isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,32,29,0.14)';
  const fabBg = isDark ? Colors.primaryLighter : Colors.primary;
  const fabIconColor = isDark ? Colors.primaryDarkest : Colors.white;

  const colorAnims = useRef<Record<string, Animated.Value>>({}).current;
  // Sekme seçilince kısa bir "pop" sıçraması yapan ölçek — basılı tutma ölçeğinden bağımsız.
  const activeBounceAnims = useRef<Record<string, Animated.Value>>({}).current;
  // Basılı tutulunca hafifçe küçülen, bırakılınca geri açılan ölçek.
  const pressScaleAnims = useRef<Record<string, Animated.Value>>({}).current;

  tabs.forEach((t) => {
    if (!colorAnims[t.key]) colorAnims[t.key] = new Animated.Value(t.key === activeKey ? 1 : 0);
    if (!activeBounceAnims[t.key]) activeBounceAnims[t.key] = new Animated.Value(1);
    if (!pressScaleAnims[t.key]) pressScaleAnims[t.key] = new Animated.Value(1);
  });

  useEffect(() => {
    tabs.forEach((t) => {
      Animated.timing(colorAnims[t.key], {
        toValue: t.key === activeKey ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    });

    const activeBounce = activeBounceAnims[activeKey];
    if (activeBounce) {
      activeBounce.setValue(0.8);
      Animated.spring(activeBounce, { toValue: 1, useNativeDriver: true, friction: 4, tension: 260 }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const handlePressIn = (key: string) => {
    Animated.spring(pressScaleAnims[key], { toValue: 0.88, useNativeDriver: true, friction: 6 }).start();
  };

  const handlePressOut = (key: string) => {
    Animated.spring(pressScaleAnims[key], { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  };

  const renderTab = (tab: FloatingTabItem, idx: number) => {
    const accent = ACCENTS[idx % ACCENTS.length];
    const activeColor = isDark ? accent.hero : accent.text;
    const colorAnim = colorAnims[tab.key];
    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => onTabPress(tab.key)}
        onPressIn={() => handlePressIn(tab.key)}
        onPressOut={() => handlePressOut(tab.key)}
        activeOpacity={0.7}
        style={styles.tabTouchable}
      >
        <Animated.View style={{ transform: [{ scale: pressScaleAnims[tab.key] }] }}>
          <Animated.View style={[styles.iconStack, { transform: [{ scale: activeBounceAnims[tab.key] }] }]}>
            <Icon name={tab.icon} size={22} color={mutedIconColor} />
            <Animated.View style={[StyleSheet.absoluteFill, styles.iconOverlay, { opacity: colorAnim }]}>
              <Icon name={tab.icon} size={22} color={activeColor} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const leftTabs = showCreateButton ? tabs.slice(0, 2) : tabs;
  const rightTabs = showCreateButton ? tabs.slice(2, 4) : [];

  return (
    <View style={styles.wrapper}>
      <View style={[styles.island, { backgroundColor: islandBg }]}>
        <View style={styles.tabsRow}>
          {leftTabs.map(renderTab)}
          {showCreateButton && <View style={styles.fabSpacer} />}
          {rightTabs.map(renderTab)}
        </View>
      </View>

      {showCreateButton && (
        <TouchableOpacity
          onPress={onCreatePress}
          activeOpacity={0.85}
          style={[
            styles.fab,
            {
              backgroundColor: fabBg,
              shadowColor: isDark ? Colors.black : Colors.primary,
            },
          ]}
        >
          <Icon name="add" size={26} color={fabIconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.sm,
    right: Spacing.sm,
    bottom: Spacing.lg,
    alignItems: 'center',
  },
  island: {
    width: '100%',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    // Yüzen ada hissi için kasıtlı istisna — bu bileşende gölge kullanılıyor.
    shadowColor: Colors.primaryDarkest,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconStack: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabSpacer: {
    width: FAB_SIZE - Spacing.md,
  },
  fab: {
    position: 'absolute',
    top: -FAB_SIZE * 0.4,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 8,
    ...Platform.select({ android: { elevation: 8 } }),
  },
});
