import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Pastel, Radius, Spacing, Typography } from '../../constants/theme';
import { authService } from '../../services/authService';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      Alert.alert('Geçerli bir e-posta girin', 'Parola sıfırlama bağlantısını gönderebilmemiz için geçerli bir e-posta adresi gerekli.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.requestPasswordReset(normalizedEmail);
      Alert.alert('E-postanı kontrol et', response.message || 'Hesap varsa parola sıfırlama e-postası gönderilecektir.', [
        { text: 'Tamam', onPress: () => router.replace('/(auth)/login') },
        { text: 'Token gir', onPress: () => router.replace('/(auth)/reset-password') },
      ]);
    } catch (error: any) {
      Alert.alert('İstek gönderilemedi', error?.response?.data?.message || 'Parola sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.');
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
            icon="mailOutline"
            title="Parolanı sıfırla"
            subtitle="E-posta adresini gir; sana parola sıfırlama bağlantısı gönderelim."
          />

          <View style={styles.card}>
            <Text style={styles.label}>E-posta adresi</Text>
            <AuthInput
              value={email}
              onChangeText={setEmail}
              placeholder="ad@sirket.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
            <AuthButton label="Sıfırlama Bağlantısı Gönder" onPress={handleSubmit} loading={isSubmitting} />
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
  card: { backgroundColor: Pastel.teal.tint, borderRadius: Radius.xxl, padding: Spacing.lg, gap: Spacing.md },
  label: { ...Typography.labelMd, color: Colors.onSurface },
  backButton: { marginTop: Spacing.lg },
});
