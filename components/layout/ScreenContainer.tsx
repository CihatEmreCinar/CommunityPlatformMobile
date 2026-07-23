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
import { FLOATING_TAB_BAR_CLEARANCE } from './FloatingTabBar';

type ScreenContainerProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  backgroundColor?: string;
  /** true ise, altında FloatingTabBar olan ekranlarda içerik adanın/+ butonunun arkasında kalmasın diye FLOATING_TAB_BAR_CLEARANCE kadar paddingBottom eklenir. */
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
  const clearanceStyle = floatingTabBar ? { paddingBottom: FLOATING_TAB_BAR_CLEARANCE } : null;

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={edges}>
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
