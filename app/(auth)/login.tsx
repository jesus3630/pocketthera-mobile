import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { COLORS } from '../../lib/constants';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuest = async () => {
    setGuestLoading(true);
    try {
      await continueAsGuest();
    } catch (e: any) {
      Alert.alert('Could not start', e?.response?.data?.message ?? 'Please try again');
    } finally {
      setGuestLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.message ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>PocketThera</Text>
        <Text style={styles.tagline}>Your AI wellness companion</Text>

        {/* No account required — talk to Thera, track your mood, see your insights. */}
        <TouchableOpacity style={styles.guestBtn} onPress={handleGuest} disabled={guestLoading}>
          {guestLoading
            ? <ActivityIndicator color={COLORS.primary} />
            : <Text style={styles.guestBtnText}>Continue without an account</Text>}
        </TouchableOpacity>
        <Text style={styles.guestHint}>
          Use the full app — no email, name, or password needed. You can add an account later to keep your
          history across devices.
        </Text>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign in</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textLight}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          PocketThera is a wellness tool, not a substitute for professional mental health treatment.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  logo: { fontSize: 34, fontWeight: '700', color: COLORS.primary, textAlign: 'center', marginBottom: 6 },
  tagline: { fontSize: 15, color: COLORS.textLight, textAlign: 'center', marginBottom: 28 },
  guestBtn: {
    backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 10,
  },
  guestBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  guestHint: {
    textAlign: 'center', color: COLORS.textLight, fontSize: 12,
    lineHeight: 17, marginBottom: 22, paddingHorizontal: 4,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textLight, fontSize: 12, marginHorizontal: 10 },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: COLORS.text, marginBottom: 14,
  },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginBottom: 20,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: COLORS.textLight, fontSize: 14, marginBottom: 32 },
  linkBold: { color: COLORS.primary, fontWeight: '600' },
  disclaimer: { textAlign: 'center', color: COLORS.textLight, fontSize: 11, lineHeight: 16 },
});
