import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { COLORS } from '../../lib/constants';

const PRIVACY_URL = 'https://pocketthera-production.up.railway.app/privacy';
const TERMS_URL = 'https://pocketthera-production.up.railway.app/terms';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, plan, logout, deleteAccount } = useAuthStore();
  const isGuest = !!user?.isGuest;
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  // Guideline 5.1.1(v): deletion starts and finishes in the app, with one confirmation step.
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your account and everything in it — all conversations, messages, mood check-ins and insights. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Are you sure?', 'Your data will be erased immediately and cannot be recovered.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete Permanently',
                style: 'destructive',
                onPress: async () => {
                  setDeleting(true);
                  try {
                    await deleteAccount();
                  } catch (e: any) {
                    Alert.alert('Could not delete account', e?.response?.data?.message ?? 'Please try again');
                  } finally {
                    setDeleting(false);
                  }
                },
              },
            ]);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{isGuest ? 'Guest — no account' : user?.email}</Text>
          </View>
        </View>

        {/* Guest upgrade — optional, never required to use the app */}
        {isGuest && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.primaryRow} onPress={() => router.push('/(app)/account')}>
              <Text style={styles.primaryRowText}>Create an account</Text>
              <Text style={styles.primaryRowHint}>Keep your history across devices</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Usage</Text>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Messages sent</Text>
            <Text style={styles.usageValue}>
              {user?.dailyMsgCount ?? 0}
              {plan?.limits?.messagesPerDay ? ` / ${plan.limits.messagesPerDay}` : ''}
            </Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              PocketThera is a wellness companion app. Thera is an AI, not a licensed clinician, and the app is
              not therapy, medical care, or diagnosis. If you're in crisis, contact the 988 Suicide & Crisis
              Lifeline by calling or texting 988.
            </Text>
          </View>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(app)/sources')}>
            <Text style={styles.linkRowText}>Sources & Citations</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.linkRowText}>Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={styles.linkRowText}>Terms of Use</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        {!isGuest && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        {/* Delete account */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} disabled={deleting}>
          {deleting
            ? <ActivityIndicator color={COLORS.crisis} />
            : <Text style={styles.deleteText}>Delete Account</Text>}
        </TouchableOpacity>
        <Text style={styles.deleteHint}>
          Permanently erases your account and all conversations, mood check-ins and insights.
        </Text>

        <Text style={styles.version}>PocketThera v1.0.0 · ProtaTECH</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  content: { padding: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  email: { fontSize: 13, color: COLORS.textLight },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  primaryRow: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16,
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  primaryRowText: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 3 },
  primaryRowHint: { fontSize: 12, color: COLORS.textLight },
  linkRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginTop: 10,
  },
  linkRowText: { fontSize: 14, color: COLORS.text },
  chevron: { fontSize: 20, color: COLORS.textLight },
  usageRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  usageLabel: { fontSize: 14, color: COLORS.text },
  usageValue: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  aboutCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  aboutText: { fontSize: 13, color: COLORS.textLight, lineHeight: 20 },
  logoutBtn: {
    borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 20,
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: COLORS.crisis, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 8,
  },
  deleteText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteHint: { textAlign: 'center', color: COLORS.textLight, fontSize: 11, lineHeight: 16, marginBottom: 20 },
  version: { textAlign: 'center', color: COLORS.textLight, fontSize: 11 },
});
