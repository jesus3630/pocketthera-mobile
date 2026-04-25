import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { COLORS } from '../../lib/constants';

interface Props {
  onDismiss: () => void;
}

export default function CrisisCard({ onDismiss }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>You're not alone</Text>
      <Text style={styles.body}>
        If you're in crisis or having thoughts of self-harm, please reach out for support right now.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL('tel:988')}>
        <Text style={styles.btnText}>Call or Text 988 — Suicide & Crisis Lifeline</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnOutline} onPress={() => Linking.openURL('sms:741741&body=HOME')}>
        <Text style={styles.btnOutlineText}>Text HOME to 741741 — Crisis Text Line</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDismiss}>
        <Text style={styles.dismiss}>I'm safe, continue the conversation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16, padding: 20, backgroundColor: '#FEF2F2',
    borderRadius: 16, borderWidth: 1, borderColor: '#FECACA',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#991B1B', marginBottom: 8 },
  body: { fontSize: 14, color: '#7F1D1D', lineHeight: 20, marginBottom: 16 },
  btn: {
    backgroundColor: COLORS.crisis, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', marginBottom: 10,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  btnOutline: {
    borderWidth: 1.5, borderColor: COLORS.crisis, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', marginBottom: 14,
  },
  btnOutlineText: { color: COLORS.crisis, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  dismiss: { textAlign: 'center', color: COLORS.textLight, fontSize: 13 },
});
