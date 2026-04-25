import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/constants';

export default function TypingIndicator() {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}><Text style={styles.avatarText}>T</Text></View>
      <View style={styles.bubble}>
        <Text style={styles.dots}>...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 6, marginHorizontal: 16, alignItems: 'flex-end' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  bubble: {
    backgroundColor: COLORS.assistantBubble, borderRadius: 18,
    borderBottomLeftRadius: 4, paddingHorizontal: 18, paddingVertical: 12,
  },
  dots: { fontSize: 20, color: COLORS.textLight, letterSpacing: 4 },
});
