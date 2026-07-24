import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { IconCircleButton } from './IconCircleButton';
import { Colors, Typography, Spacing } from '../../constants/theme';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  keyboardAvoiding?: boolean;
}

export function Modal({ visible, onClose, title, children, keyboardAvoiding = true }: ModalProps) {
  const body = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <IconCircleButton icon="closeModal" onPress={onClose} accessibilityLabel="Kapat" />
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );

  return (
    <RNModal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </RNModal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.containerMargin,
  },
  title: { ...Typography.serifTitle, color: Colors.onSurface },
  body: { padding: Spacing.containerMargin, gap: Spacing.sm },
});
