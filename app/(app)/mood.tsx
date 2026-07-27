import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useMoodStore } from '../../store/mood.store';
import { COLORS, EMOTIONS } from '../../lib/constants';

function scoreColor(n: number) {
  if (n >= 8) return '#10B981';
  if (n >= 5) return '#F59E0B';
  return '#EF4444';
}

export default function MoodScreen() {
  const { entries, loading, load, log } = useMoodStore();
  const [score, setScore] = useState<number | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => { load(); }, []);

  const toggleEmotion = (e: string) => {
    setSelectedEmotions(prev =>
      prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]
    );
  };

  const save = async () => {
    if (score === null) { Alert.alert('Pick a mood score first'); return; }
    setSaving(true);
    try {
      await log(score, selectedEmotions);
      setLogged(true);
      setScore(null);
      setSelectedEmotions([]);
    } catch {
      Alert.alert('Could not save mood');
    } finally {
      setSaving(false);
    }
  };

  const recent = [...entries].reverse().slice(0, 7);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mood Check-In</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {logged && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Mood logged!</Text>
          </View>
        )}

        <Text style={styles.label}>How are you feeling? (1 = very low, 10 = great)</Text>
        <View style={styles.scoreRow}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.scoreBtn, score === n && styles.scoreBtnActive]}
              onPress={() => { setScore(n); setLogged(false); }}
            >
              <Text style={[styles.scoreText, score === n && styles.scoreTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>What emotions are present?</Text>
        <View style={styles.emotionGrid}>
          {EMOTIONS.map(e => (
            <TouchableOpacity
              key={e}
              style={[styles.emotionChip, selectedEmotions.includes(e) && styles.emotionChipActive]}
              onPress={() => toggleEmotion(e)}
            >
              <Text style={[styles.emotionText, selectedEmotions.includes(e) && styles.emotionTextActive]}>
                {e}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving || score === null}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Check-In</Text>}
        </TouchableOpacity>

        {/* Recent entries */}
        {recent.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent Check-Ins</Text>
            {loading && entries.length === 0 ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              recent.map(entry => (
                <View key={entry.id} style={styles.entryRow}>
                  <View style={[styles.scoreBadge, { backgroundColor: scoreColor(entry.score) }]}>
                    <Text style={styles.scoreBadgeText}>{entry.score}</Text>
                  </View>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryDate}>
                      {new Date(entry.loggedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    {entry.emotions.length > 0 && (
                      <Text style={styles.entryEmotions} numberOfLines={1}>
                        {entry.emotions.join(', ')}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
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
  successBanner: {
    backgroundColor: '#D1FAE5', borderRadius: 10, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#6EE7B7',
  },
  successText: { color: '#065F46', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12, marginTop: 8 },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  scoreBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  scoreText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  scoreTextActive: { color: '#fff' },
  emotionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  emotionChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border,
  },
  emotionChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  emotionText: { fontSize: 13, color: COLORS.textLight },
  emotionTextActive: { color: COLORS.primary, fontWeight: '600' },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  historySection: { marginTop: 36 },
  historyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  entryRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  scoreBadge: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  scoreBadgeText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  entryInfo: { flex: 1 },
  entryDate: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  entryEmotions: { fontSize: 12, color: COLORS.textLight },
});
