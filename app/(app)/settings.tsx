import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { COLORS } from '../../lib/constants';

export default function SettingsScreen() {
  const { user, plan, logout } = useAuthStore();
  const isPremium = plan?.id === 'premium';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
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
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        {/* Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Plan</Text>
          <View style={[styles.planCard, isPremium && styles.planCardPremium]}>
            <Text style={[styles.planName, isPremium && styles.planNamePremium]}>
              {isPremium ? 'Premium' : 'Free'}
            </Text>
            {!isPremium && (
              <Text style={styles.planLimit}>5 messages per day · 3 conversations</Text>
            )}
            {isPremium && (
              <Text style={styles.planLimit}>Unlimited messages · All features unlocked</Text>
            )}
          </View>
        </View>

        {/* Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Usage</Text>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Messages sent</Text>
            <Text style={styles.usageValue}>
              {user?.dailyMsgCount ?? 0}
              {!isPremium && ` / ${plan?.limits?.messagesPerDay ?? 5}`}
            </Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              PocketThera is a wellness companion app, not a substitute for professional mental health treatment.
              If you're in crisis, please contact the 988 Suicide & Crisis Lifeline by calling or texting 988.
            </Text>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

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
  planCard: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  planCardPremium: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  planName: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  planNamePremium: { color: COLORS.primary },
  planLimit: { fontSize: 13, color: COLORS.textLight, marginBottom: 14 },
  upgradeBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  upgradeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
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
  version: { textAlign: 'center', color: COLORS.textLight, fontSize: 11 },
});
