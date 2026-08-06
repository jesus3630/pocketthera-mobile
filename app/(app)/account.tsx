import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { COLORS } from '../../lib/constants';

// Optional upgrade path for guests — same user row, so conversations and mood history carry over.
export default function AccountScreen() {
  const router = useRouter();
  const { user, upgradeAccount } = useAuthStore();
  const [name, setName] = useState(user?.name === 'Friend' ? '' : (user?.name ?? ''));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!name || !email || !password) return;
    if (password.length < 8) { Alert.alert('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await upgradeAccount(email.trim().toLowerCase(), password, name.trim());
      Alert.alert('Account created', 'Your conversations and mood history are now saved to your account.');
      router.back();
    } catch (e: any) {
      Alert.alert('Could not create account', e?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.intro}>
            You're using PocketThera as a guest — nothing here requires an account. Adding one lets you keep
            your conversations and mood history if you change devices or reinstall the app.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={COLORS.textLight}
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
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
            placeholder="Password (min 8 characters)"
            placeholderTextColor={COLORS.textLight}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.btn} onPress={handleUpgrade} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            You can delete your account and all of its data at any time from Settings.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  back: { color: COLORS.primary, fontSize: 16, fontWeight: '600', width: 70 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  spacer: { width: 70 },
  content: { padding: 20, paddingBottom: 40 },
  intro: { fontSize: 14, color: COLORS.textLight, lineHeight: 20, marginBottom: 20 },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: COLORS.text, marginBottom: 14,
  },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 6, marginBottom: 16,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disclaimer: { textAlign: 'center', color: COLORS.textLight, fontSize: 12, lineHeight: 17 },
});
