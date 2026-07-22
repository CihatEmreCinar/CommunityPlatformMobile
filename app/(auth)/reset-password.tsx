import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui/Icon';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import { authService } from '../../services/authService';

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
          <View style={styles.header}>
            <View style={styles.iconCircle}><Icon name="lockOutline" size={32} color={Colors.accent} /></View>
            <Text style={styles.title}>Yeni parola oluştur</Text>
            <Text style={styles.subtitle}>E-postadaki tokenı ve yeni parolanı gir.</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Sıfırlama tokenı</Text>
            <TextInput style={styles.input} value={token} onChangeText={setToken} placeholder="E-postadaki token" placeholderTextColor={Colors.outlineVariant} autoCapitalize="none" autoCorrect={false} editable={!isSubmitting} />
            <Text style={styles.label}>Yeni parola</Text>
            <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="En az 12 karakter" placeholderTextColor={Colors.outlineVariant} secureTextEntry editable={!isSubmitting} />
            <Text style={styles.label}>Yeni parola (tekrar)</Text>
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Parolanı tekrar gir" placeholderTextColor={Colors.outlineVariant} secureTextEntry editable={!isSubmitting} onSubmitEditing={handleSubmit} />
            <TouchableOpacity style={[styles.primaryButton, isSubmitting && styles.disabled]} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85}>
              {isSubmitting ? <ActivityIndicator color={Colors.onAccent} /> : <Text style={styles.primaryButtonText}>Parolayı Güncelle</Text>}
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
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.surfaceVariant, ...Shadows.card, gap: Spacing.sm },
  label: { ...Typography.labelMd, color: Colors.onSurface, marginTop: Spacing.xs },
  input: { ...Typography.bodyMd, color: Colors.onSurface, backgroundColor: Colors.surfaceBright, borderWidth: 1, borderColor: Colors.surfaceVariant, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  primaryButton: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.sm, ...Shadows.sm },
  disabled: { opacity: 0.7 },
  primaryButtonText: { ...Typography.labelMd, color: Colors.onAccent, fontSize: 14 },
  backButton: { alignSelf: 'center', marginTop: Spacing.lg, padding: Spacing.sm },
  backButtonText: { ...Typography.labelMd, color: Colors.accent },
});
