import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<'employee' | 'employer'>('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleRegister() {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Hata', 'Ad, soyad, e-posta ve şifre zorunludur.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ firstName, lastName, email, password, role, city });
      if (role === 'employer') {
        router.replace('/(employer)/dashboard');
      } else {
        router.replace('/(employee)/home');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Kayıt başarısız. Tekrar deneyin.';
      Alert.alert('Hata', message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Header */}
        <View style={styles.logoSection}>
          <Text style={styles.logoTitle}>Community</Text>
          <Text style={styles.logoSubtitle}>Topluluğa katılmak için bilgilerini gir</Text>
        </View>

        {/* Register Card */}
        <View style={styles.card}>
          {/* Role Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Hesap Türü</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'employee' && styles.roleButtonActive]}
                onPress={() => setRole('employee')}
                activeOpacity={0.85}
              >
                <MaterialIcons
                  name="badge"
                  size={18}
                  color={role === 'employee' ? Colors.onAccent : Colors.onSurfaceVariant}
                />
                <Text style={[styles.roleButtonText, role === 'employee' && styles.roleButtonTextActive]}>
                  Katılımcı
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'employer' && styles.roleButtonActive]}
                onPress={() => setRole('employer')}
                activeOpacity={0.85}
              >
                <MaterialIcons
                  name="business"
                  size={18}
                  color={role === 'employer' ? Colors.onAccent : Colors.onSurfaceVariant}
                />
                <Text style={[styles.roleButtonText, role === 'employer' && styles.roleButtonTextActive]}>
                  Atölyeci
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* First / Last Name */}
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.rowItem]}>
              <Text style={styles.label}>Ad</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={18} color={Colors.outline} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ad"
                  placeholderTextColor={Colors.outlineVariant}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={[styles.fieldGroup, styles.rowItem]}>
              <Text style={styles.label}>Soyad</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputNoIcon]}
                  placeholder="Soyad"
                  placeholderTextColor={Colors.outlineVariant}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-posta Adresi</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="mail-outline" size={18} color={Colors.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ad@sirket.com"
                placeholderTextColor={Colors.outlineVariant}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-outline" size={18} color={Colors.outline} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithAction]}
                placeholder="En az 6 karakter"
                placeholderTextColor={Colors.outlineVariant}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={18}
                  color={Colors.outline}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* City */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Şehir (opsiyonel)</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="location-on" size={18} color={Colors.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şehrin"
                placeholderTextColor={Colors.outlineVariant}
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.onAccent} />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Giriş yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.background,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoTitle: {
    ...Typography.display,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  logoSubtitle: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    ...Shadows.card,
    gap: Spacing.md,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
  label: {
    ...Typography.labelMd,
    color: Colors.onSurface,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceBright,
  },
  roleButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  roleButtonText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
  roleButtonTextActive: {
    color: Colors.onAccent,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceBright,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.bodyMd,
    color: Colors.onSurface,
    paddingVertical: Spacing.sm,
  },
  inputNoIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithAction: {
    paddingRight: Spacing.xl,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.sm,
    padding: Spacing.xs,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...Typography.labelMd,
    color: Colors.onAccent,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  footerLink: {
    ...Typography.labelMd,
    color: Colors.accent,
  },
});