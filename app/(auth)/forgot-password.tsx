import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui/Icon';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import { authService } from '../../services/authService';

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
          <View style={styles.header}>
            <View style={styles.iconCircle}><Icon name="mailOutline" size={32} color={Colors.accent} /></View>
            <Text style={styles.title}>Parolanı sıfırla</Text>
            <Text style={styles.subtitle}>E-posta adresini gir; sana parola sıfırlama bağlantısı gönderelim.</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>E-posta adresi</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="ad@sirket.com" placeholderTextColor={Colors.outlineVariant} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!isSubmitting} />
            <TouchableOpacity style={[styles.primaryButton, isSubmitting && styles.disabled]} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85}>
              {isSubmitting ? <ActivityIndicator color={Colors.onAccent} /> : <Text style={styles.primaryButtonText}>Sıfırlama Bağlantısı Gönder</Text>}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/login')} disabled={isSubmitting}><Text style={styles.backButtonText}>Giriş ekranına dön</Text></TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.containerMargin, paddingVertical: Spacing.xl },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  iconCircle: { width: 72, height: 72, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryContainer, marginBottom: Spacing.md },
  title: { ...Typography.h1, color: Colors.onSurface, marginBottom: Spacing.sm },
  subtitle: { ...Typography.bodyLg, color: Colors.onSurfaceVariant, textAlign: 'center' },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.surfaceVariant, ...Shadows.card, gap: Spacing.md },
  label: { ...Typography.labelMd, color: Colors.onSurface },
  input: { ...Typography.bodyMd, color: Colors.onSurface, backgroundColor: Colors.surfaceBright, borderWidth: 1, borderColor: Colors.surfaceVariant, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  primaryButton: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', ...Shadows.sm },
  disabled: { opacity: 0.7 },
  primaryButtonText: { ...Typography.labelMd, color: Colors.onAccent, fontSize: 14 },
  backButton: { alignSelf: 'center', marginTop: Spacing.lg, padding: Spacing.sm },
  backButtonText: { ...Typography.labelMd, color: Colors.accent },
});
