import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Pastel, Radius, Spacing, Typography } from '../../constants/theme';
import { authService } from '../../services/authService';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';

export default function ResetPasswordScreen() {
  const { token: tokenParam } = useLocalSearchParams<{ token?: string | string[] }>();
  const initialToken = typeof tokenParam === 'string' ? tokenParam : '';
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (!token.trim()) {
      Alert.alert('Token gerekli', 'E-postadaki parola sıfırlama tokenını girin.');
      return;
    }
    if (newPassword.length < 12) {
      Alert.alert('Parola çok kısa', 'Yeni parola en az 12 karakter olmalıdır.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Parolalar eşleşmiyor', 'Yeni parolanı ve parola onayını aynı girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword(token.trim(), newPassword);
      Alert.alert('Parola güncellendi', response.message || 'Parolanız güncellendi. Lütfen yeniden giriş yapın.', [
        { text: 'Giriş yap', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error: any) {
      Alert.alert('Parola güncellenemedi', error?.response?.data?.message || 'Sıfırlama bağlantısı geçersiz veya süresi dolmuş.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <AuthHeader
            variant="icon"
            icon="lockOutline"
            title="Yeni parola oluştur"
            subtitle="E-postadaki tokenı ve yeni parolanı gir."
          />

          <View style={styles.card}>
            <Text style={styles.label}>Sıfırlama tokenı</Text>
            <AuthInput value={token} onChangeText={setToken} placeholder="E-postadaki token" autoCapitalize="none" autoCorrect={false} editable={!isSubmitting} />
            <Text style={styles.label}>Yeni parola</Text>
            <AuthInput value={newPassword} onChangeText={setNewPassword} placeholder="En az 12 karakter" secureTextEntry editable={!isSubmitting} />
            <Text style={styles.label}>Yeni parola (tekrar)</Text>
            <AuthInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Parolanı tekrar gir"
              secureTextEntry
              editable={!isSubmitting}
              onSubmitEditing={handleSubmit}
            />
            <AuthButton label="Parolayı Güncelle" onPress={handleSubmit} loading={isSubmitting} style={styles.submit} />
          </View>

          <AuthButton
            variant="ghost"
            label="Giriş ekranına dön"
            onPress={() => router.replace('/(auth)/login')}
            disabled={isSubmitting}
            style={styles.backButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.containerMargin, paddingVertical: Spacing.xl },
  card: { backgroundColor: Pastel.teal.tint, borderRadius: Radius.xxl, padding: Spacing.lg, gap: Spacing.sm },
  label: { ...Typography.labelMd, color: Colors.onSurface, marginTop: Spacing.xs },
  submit: { marginTop: Spacing.sm },
  backButton: { marginTop: Spacing.lg },
});
