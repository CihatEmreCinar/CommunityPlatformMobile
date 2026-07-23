import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { ROLES } from '../../constants/roles';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre zorunludur.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === ROLES.EMPLOYER) {
        router.replace('/(employer)/dashboard');
      } else if (user.role === ROLES.EMPLOYEE) {
        router.replace('/(employee)/home');
      } else if (user.role === ROLES.CAFE) {
        router.replace('/(cafe)/(tabs)/dashboard');
      } else if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.';
      Alert.alert('Hata', message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Atolium" subtitle="Yolculuğuna devam etmek için giriş yap" />

          <View style={styles.body}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-posta Adresi</Text>
              <AuthInput
                icon="mailOutline"
                placeholder="ad@sirket.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Şifre</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={styles.forgotText}>Şifremi Unuttum?</Text>
                </TouchableOpacity>
              </View>
              <AuthInput
                icon="lockOutline"
                rightIcon={showPassword ? 'passwordHidden' : 'passwordVisible'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <AuthButton label="Giriş Yap" onPress={handleLogin} loading={isLoading} style={styles.submit} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Kayıt ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingBottom: Spacing.xl },
  body: { paddingHorizontal: Spacing.containerMargin, gap: Spacing.md },
  fieldGroup: { gap: Spacing.sm },
  label: { ...Typography.labelMd, color: Colors.onSurface },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { ...Typography.labelMd, color: Colors.primary },
  submit: { marginTop: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.lg },
  footerText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  footerLink: { ...Typography.labelMd, color: Colors.primary },
});
