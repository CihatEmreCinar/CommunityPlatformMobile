import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui/Icon';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import { authService } from '../../services/authService';

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
          <View style={styles.logoSection}>
            <View style={styles.iconCircle}>
              <Icon name="mailOutline" size={32} color={Colors.accent} />
            </View>
            <Text style={styles.title}>E-postanı doğrula</Text>
            <Text style={styles.subtitle}>
              {email ? `${email} adresine bir doğrulama e-postası gönderdik.` : 'E-postana bir doğrulama e-postası gönderdik.'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Doğrulama değeri</Text>
            <TextInput
              style={styles.input}
              value={token}
              onChangeText={setToken}
              placeholder="E-postadaki kod veya token"
              placeholderTextColor={Colors.outlineVariant}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isVerifying}
              textContentType="oneTimeCode"
            />
            <Text style={styles.helperText}>E-postadaki doğrulama değerini kopyalayıp buraya yapıştırabilirsin.</Text>

            <TouchableOpacity style={[styles.primaryButton, isVerifying && styles.disabled]} onPress={handleVerify} disabled={isVerifying} activeOpacity={0.85}>
              {isVerifying ? <ActivityIndicator color={Colors.onAccent} /> : <Text style={styles.primaryButtonText}>E-postayı Doğrula</Text>}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>E-posta gelmedi mi?</Text>
              <TouchableOpacity onPress={handleResend} disabled={isResending || isVerifying}>
                {isResending ? <ActivityIndicator size="small" color={Colors.accent} /> : <Text style={styles.resendLink}>Tekrar gönder</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/register')} disabled={isVerifying || isResending}>
            <Text style={styles.backButtonText}>Farklı bir e-posta ile kayıt ol</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.containerMargin, paddingVertical: Spacing.xl },
  logoSection: { alignItems: 'center', marginBottom: Spacing.xl },
  iconCircle: { width: 72, height: 72, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryContainer, marginBottom: Spacing.md },
  title: { ...Typography.h1, color: Colors.onSurface, marginBottom: Spacing.sm },
  subtitle: { ...Typography.bodyLg, color: Colors.onSurfaceVariant, textAlign: 'center' },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.surfaceVariant, ...Shadows.card, gap: Spacing.md },
  label: { ...Typography.labelMd, color: Colors.onSurface },
  input: { ...Typography.bodyMd, color: Colors.onSurface, backgroundColor: Colors.surfaceBright, borderWidth: 1, borderColor: Colors.surfaceVariant, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  helperText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: -Spacing.sm },
  primaryButton: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  disabled: { opacity: 0.7 },
  primaryButtonText: { ...Typography.labelMd, color: Colors.onAccent, fontSize: 14 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  resendText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  resendLink: { ...Typography.labelMd, color: Colors.accent },
  backButton: { alignSelf: 'center', marginTop: Spacing.lg, padding: Spacing.sm },
  backButtonText: { ...Typography.labelMd, color: Colors.accent },
});
