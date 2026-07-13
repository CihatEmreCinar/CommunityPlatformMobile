import { ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';

type KeyboardAwareScreenProps = Omit<ScrollViewProps, 'children'> & {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Arama / filtre ekranları için ortak scroll + klavye davranışı.
 *
 * Neden gerekli:
 * Filtreler ve sonuç listesi ayrı ayrı ScrollView'larda olursa, klavye
 * açıldığında sonuç listesinin ayrılan alanı küçülür ve kartlar klavyenin
 * arkasında/altında kaybolur. Bunun yerine TÜM içerik (filtreler + kartlar)
 * tek bir ScrollView içinde akar; klavye açıldığında ekran küçülmez,
 * kullanıcı aşağı kaydırarak sonuçlara ulaşır.
 *
 * Davranışlar:
 * - Klavye açıkken odaklanan input otomatik olarak klavyenin üstünde
 *   görünür kalır (ScrollView'ın yerleşik scroll-to-focused-input'u +
 *   KeyboardAvoidingView).
 * - Boş bir alana dokunmak klavyeyi kapatır (TouchableWithoutFeedback).
 * - Scroll etmeye başlamak da klavyeyi kapatır (keyboardDismissMode="on-drag").
 * - Klavye açıkken bile chip/buton gibi dokunmatik elemanlar TEK dokunuşla
 *   çalışır — persist olmasaydı ilk dokunuş sadece klavyeyi kapatırdı
 *   (keyboardShouldPersistTaps="handled").
 */
export function KeyboardAwareScreen({
  children,
  contentContainerStyle,
  style,
  ...rest
}: KeyboardAwareScreenProps) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={[{ flex: 1 }, style]}
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
