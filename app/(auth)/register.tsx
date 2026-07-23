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
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';
import { ROLES, type RoleValue } from '../../constants/roles';
import { CityDistrictPicker } from '../../components/location/CityDistrictPicker';
import { EMPTY_LOCATION_SELECTION, type LocationSelection } from '../../types/location';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';

const ROLE_OPTIONS: {
  value: RoleValue;
  label: string;
  description: string;
  icon: 'person' | 'business' | 'localCafe';
  palette: keyof typeof Pastel;
  /** seçiliyken ikon dairesinin dolgu rengi — kategori rengi yerine tek, tutarlı "seçili" vurgusu. */
  activeFill: string;
}[] = [
  { value: ROLES.EMPLOYEE, label: 'Katılımcı', description: 'Etkinliklere katıl', icon: 'person', palette: 'teal', activeFill: Colors.primary },
  { value: ROLES.EMPLOYER, label: 'Atölyeci', description: 'Atölye düzenle', icon: 'business', palette: 'purple', activeFill: Pastel.purple.hero },
  { value: ROLES.CAFE, label: 'Kafeci', description: 'Mekan paylaş', icon: 'localCafe', palette: 'coral', activeFill: Pastel.coral.hero },
];

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState<LocationSelection>(EMPTY_LOCATION_SELECTION);
  const [role, setRole] = useState<RoleValue>(ROLES.EMPLOYEE);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleRegister() {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Hata', 'Ad, soyad, e-posta ve şifre zorunludur.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        role,
        cityId: location.cityId ?? undefined,
        districtId: location.districtId ?? undefined,
      });
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim().toLowerCase() },
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Kayıt başarısız. Tekrar deneyin.';
      Alert.alert('Hata', message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Hesap Oluştur" subtitle="Topluluğa katılmak için bilgilerini gir" logoSize={56} />

          <View style={styles.body}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Hesap Türü</Text>
              <View style={styles.roleRow}>
                {ROLE_OPTIONS.map((opt) => {
                  const active = role === opt.value;
                  const palette = Pastel[opt.palette];
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.roleCard, { backgroundColor: active ? palette.tint : Colors.surfaceContainerLow }]}
                      onPress={() => setRole(opt.value)}
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.roleIconCircle,
                          { backgroundColor: active ? opt.activeFill : palette.tintStrong },
                        ]}
                      >
                        <Icon name={opt.icon} size={17} color={active ? Colors.white : palette.text} />
                      </View>
                      <Text style={[styles.roleLabel, { color: active ? palette.text : Colors.onSurface }]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.roleDescription, { color: active ? palette.textSub : Colors.onSurfaceVariant }]}>
                        {opt.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.rowItem]}>
                <Text style={styles.label}>Ad</Text>
                <AuthInput placeholder="Ad" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>
              <View style={[styles.fieldGroup, styles.rowItem]}>
                <Text style={styles.label}>Soyad</Text>
                <AuthInput placeholder="Soyad" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-posta Adresi</Text>
              <AuthInput
                icon="mailInput"
                placeholder="ad@sirket.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Şifre</Text>
              <AuthInput
                icon="lockOutline"
                rightIcon={showPassword ? 'passwordHidden' : 'passwordVisible'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                placeholder="En az 8 karakter"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Konum (opsiyonel)</Text>
              <CityDistrictPicker value={location} onChange={setLocation} />
            </View>

            <AuthButton label="Kayıt Ol" onPress={handleRegister} loading={isLoading} style={styles.submit} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Giriş yap</Text>
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
  row: { flexDirection: 'row', gap: Spacing.sm },
  rowItem: { flex: 1 },
  label: { ...Typography.labelMd, color: Colors.onSurface },
  roleRow: { flexDirection: 'row', gap: Spacing.sm },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.xl,
  },
  roleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  roleLabel: { ...Typography.labelMd, fontSize: 12 },
  roleDescription: { ...Typography.labelSm, fontSize: 10.5, textAlign: 'center', lineHeight: 13 },
  submit: { marginTop: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.lg },
  footerText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  footerLink: { ...Typography.labelMd, color: Colors.primary },
});
