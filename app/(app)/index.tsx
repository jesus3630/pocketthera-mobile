import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, FlatList, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { COLORS } from '../../lib/constants';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatInput from '../../components/chat/ChatInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import CrisisCard from '../../components/common/CrisisCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string;
}

export default function ChatScreen() {
  const { user, plan, loadMe } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const listRef = useRef<FlatList>(null);

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/api/conversations');
      setConversations(data);
      if (data.length > 0 && !activeConvId) {
        await selectConversation(data[0].id);
      }
    } catch {}
  }, [activeConvId]);

  useEffect(() => { loadConversations(); }, []);

  const selectConversation = async (id: string) => {
    setActiveConvId(id);
    setMessages([]);
    try {
      const { data } = await api.get(`/api/chat/${id}/messages`);
      setMessages(data);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    } catch {}
  };

  const newConversation = async () => {
    try {
      const { data } = await api.post('/api/conversations');
      setConversations(prev => [data, ...prev]);
      setActiveConvId(data.id);
      setMessages([]);
    } catch (e: any) {
      Alert.alert('Limit reached', e?.response?.data?.message ?? 'Could not create conversation');
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeConvId) {
      await newConversation();
      return;
    }

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    setLoading(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const { data } = await api.post(`/api/chat/${activeConvId}/message`, { content });
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempMsg.id),
        { id: data.message.id, role: 'user', content, createdAt: tempMsg.createdAt },
        { ...data.message, role: 'assistant' as const },
      ]);
      if (data.crisisDetected) setShowCrisis(true);
      await loadMe();
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      const msg = e?.response?.data?.message;
      const limitReached = e?.response?.data?.limitReached;
      if (limitReached) {
        Alert.alert('Daily limit reached', 'Upgrade to Premium for unlimited messages.');
      } else {
        Alert.alert('Error', msg ?? 'Could not send message');
      }
    } finally {
      setLoading(false);
    }
  };

  const messagesPerDay = plan?.limits?.messagesPerDay;
  const used = user?.dailyMsgCount ?? 0;
  const remaining = messagesPerDay !== null && messagesPerDay !== undefined ? messagesPerDay - used : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thera</Text>
        <TouchableOpacity style={styles.newBtn} onPress={newConversation}>
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Message limit banner */}
      {remaining !== null && remaining <= 2 && (
        <View style={styles.limitBanner}>
          <Text style={styles.limitText}>
            {remaining === 0 ? 'Daily limit reached — upgrade to Premium' : `${remaining} message${remaining === 1 ? '' : 's'} left today`}
          </Text>
        </View>
      )}

      {/* Messages */}
      {activeConvId ? (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble role={item.role} content={item.content} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Hi, I'm Thera</Text>
              <Text style={styles.emptyBody}>
                I'm here to listen and support you. How are you feeling today?
              </Text>
            </View>
          }
          ListFooterComponent={loading ? <TypingIndicator /> : null}
          contentContainerStyle={styles.messageList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Welcome to PocketThera</Text>
          <TouchableOpacity style={styles.startBtn} onPress={newConversation}>
            <Text style={styles.startBtnText}>Start a conversation</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Crisis card */}
      {showCrisis && <CrisisCard onDismiss={() => setShowCrisis(false)} />}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        loading={loading}
        disabled={remaining === 0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  newBtn: {
    backgroundColor: COLORS.primaryLight, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  newBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  limitBanner: {
    backgroundColor: '#FEF3C7', paddingVertical: 8, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#FDE68A',
  },
  limitText: { color: '#92400E', fontSize: 13, textAlign: 'center', fontWeight: '500' },
  messageList: { paddingVertical: 12, flexGrow: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  emptyBody: { fontSize: 15, color: COLORS.textLight, textAlign: 'center', lineHeight: 22 },
  startBtn: {
    marginTop: 24, backgroundColor: COLORS.primary, borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
