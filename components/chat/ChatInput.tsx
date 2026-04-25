import { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../lib/constants';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function ChatInput({ onSend, disabled, loading }: Props) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || loading) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Talk to Thera..."
        placeholderTextColor={COLORS.textLight}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={1000}
        editable={!disabled && !loading}
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <TouchableOpacity
        style={[styles.sendBtn, (!text.trim() || disabled || loading) && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <View style={styles.sendArrow} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  input: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: 22,
    paddingHorizontal: 18, paddingVertical: 12,
    fontSize: 15, color: COLORS.text, maxHeight: 120, marginRight: 10,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
  sendArrow: {
    width: 0, height: 0,
    borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 12,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#fff',
    marginLeft: 3,
  },
});
