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

type ScreenContainerProps = {
  /** Scroll edilecek asıl içerik (form alanları, liste vb.) */
  children: React.ReactNode;
  /** Scroll dışında sabit kalacak üst kısım (özel header'lar için) */
  header?: React.ReactNode;
  /** Scroll dışında sabit kalacak alt kısım (sabit "Kaydet" butonu vb. için) */
  footer?: React.ReactNode;
  /** İçerik scroll edilsin mi? Form ekranları: true (varsayılan), sabit layout ekranları: false */
  scroll?: boolean;
  /** ScrollView contentContainerStyle'a eklenecek ek stiller */
  contentStyle?: StyleProp<ViewStyle>;
  /** Hangi kenarlarda safe area padding uygulanacağı. Header kendi üst padding'ini
   *  yönetiyorsa (örn. Stack navigator header'ı varsa) 'top' kaldırılabilir. */
  edges?: Edge[];
  backgroundColor?: string;
};

/**
 * Projedeki TÜM form / detay ekranlarının en dış katmanı bu component olmalı.
 * Amaç: "içerik taşıyor / sığmıyor" sorununu tek merkezden, kalıcı olarak çözmek.
 *
 * - SafeAreaView: header'ın status bar / notch altına yapışmasını engeller
 * - KeyboardAvoidingView: text input'lara odaklanınca içerik klavyenin altında kalmaz
 * - ScrollView (contentContainerStyle: flexGrow + paddingBottom): son eleman
 *   ekranın altında kırpılmaz, alt navigation bar ile çakışmaz
 */
export function ScreenContainer({
  children,
  header,
  footer,
  scroll = true,
  contentStyle,
  edges = ['top', 'bottom'],
  backgroundColor = '#FFFFFF',
}: ScreenContainerProps) {
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flexContent, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {header}
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
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
});
