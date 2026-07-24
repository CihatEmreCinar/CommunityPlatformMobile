import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useFloatingTabBarClearance } from './FloatingTabBar';

type ScreenContainerProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  backgroundColor?: string;
  /**
   * true ise: içerik yüzen tab bar'ın (pill) arkasında kalmasın diye
   * useFloatingTabBarClearance() kadar paddingBottom eklenir ve alt safe-area'yı
   * pill yönettiği için SafeAreaView'den 'bottom' kenarı düşürülür.
   * Tek scroll sahibi ScreenContainer'ın kendi ScrollView'i olan ekranlarda kullanın;
   * içeride ayrı bir ScrollView/FlatList varsa scroll={false} verip clearance'ı ona uygulayın.
   */
  floatingTabBar?: boolean;
};

export function ScreenContainer({
  children,
  header,
  footer,
  scroll = true,
  contentStyle,
  edges = ['top', 'bottom'],
  backgroundColor = Colors.background,
  floatingTabBar = false,
}: ScreenContainerProps) {
  const clearance = useFloatingTabBarClearance();
  const clearanceStyle = floatingTabBar ? { paddingBottom: clearance } : null;
  // Yüzen pill alt safe-area'yı kendi yönettiği için, floatingTabBar iken 'bottom'
  // kenarını düşürüyoruz — aksi halde alt inset iki kez sayılır ve boşluk şişer.
  const effectiveEdges = floatingTabBar ? edges.filter((e) => e !== 'bottom') : edges;

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentStyle, clearanceStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flexContent, contentStyle, clearanceStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={effectiveEdges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {header ? <View style={styles.headerWrap}>{header}</View> : null}
        {body}
        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  flexContent: { flex: 1 },
  headerWrap: { paddingHorizontal: 20, paddingTop: 8 },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
});
