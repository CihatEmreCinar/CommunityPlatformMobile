import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Pastel, Radius, Spacing, Typography } from '../../constants/theme';
import { authService } from '../../services/authService';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';

function getErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || fallback;
}

export default function VerifyEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string | string[] }>();
  const email = typeof emailParam === 'string' ? emailParam : '';
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  async function handleVerify() {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      Alert.alert('Doğrulama değeri gerekli', 'E-postadaki doğrulama değerini girin.');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authService.verifyEmail(email, trimmedToken);
      Alert.alert('E-posta doğrulandı', response.message || 'E-posta adresiniz doğrulandı.', [
        { text: 'Giriş yap', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error: any) {
      Alert.alert('Doğrulama başarısız', getErrorMessage(error, 'Doğrulama değeri geçersiz veya süresi dolmuş.'));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (!email) {
      Alert.alert('E-posta bulunamadı', 'Yeni bir doğrulama e-postası istemek için kayıt ekranına dönün.');
      return;
    }

    setIsResending(true);
    try {
      const response = await authService.resendVerification(email);
      Alert.alert('E-posta gönderildi', response.message || 'Doğrulama e-postası gönderildi.');
    } catch (error: any) {
      Alert.alert('Tekrar gönderilemedi', getErrorMessage(error, 'Doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin.'));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <AuthHeader
            variant="icon"
            icon="mailOutline"
            title="E-postanı doğrula"
            subtitle={email ? `${email} adresine bir doğrulama e-postası gönderdik.` : 'E-postana bir doğrulama e-postası gönderdik.'}
          />

          <View style={styles.card}>
            <Text style={styles.label}>Doğrulama değeri</Text>
            <AuthInput
              value={token}
              onChangeText={setToken}
              placeholder="E-postadaki kod veya token"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isVerifying}
              textContentType="oneTimeCode"
            />

            <View style={styles.helperCard}>
              <Text style={styles.helperText}>E-postadaki doğrulama değerini kopyalayıp buraya yapıştırabilirsin.</Text>
            </View>

            <AuthButton label="E-postayı Doğrula" onPress={handleVerify} loading={isVerifying} />

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>E-posta gelmedi mi?</Text>
              <TouchableOpacity onPress={handleResend} disabled={isResending || isVerifying}>
                {isResending ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.resendLink}>Tekrar gönder</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <AuthButton
            variant="ghost"
            label="Farklı bir e-posta ile kayıt ol"
            onPress={() => router.replace('/(auth)/register')}
            disabled={isVerifying || isResending}
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
  card: { backgroundColor: Pastel.teal.tint, borderRadius: Radius.xxl, padding: Spacing.lg, gap: Spacing.md },
  label: { ...Typography.labelMd, color: Colors.onSurface },
  helperCard: { backgroundColor: Pastel.amber.tint, borderRadius: Radius.lg, padding: Spacing.sm },
  helperText: { ...Typography.bodyMd, color: Pastel.amber.text },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.xs },
  resendText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  resendLink: { ...Typography.labelMd, color: Colors.primary },
  backButton: { marginTop: Spacing.lg },
});
