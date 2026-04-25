import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/constants';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && <View style={styles.avatar}><Text style={styles.avatarText}>T</Text></View>}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 6, marginHorizontal: 16, alignItems: 'flex-end' },
  rowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    marginRight: 8, marginBottom: 2,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  bubble: {
    maxWidth: '78%', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12,
  },
  userBubble: { backgroundColor: COLORS.userBubble, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: COLORS.assistantBubble, borderBottomLeftRadius: 4 },
  text: { fontSize: 15, lineHeight: 22, color: COLORS.text },
  textUser: { color: '#fff' },
});
