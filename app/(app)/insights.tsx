import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { COLORS } from '../../lib/constants';

interface Analysis {
  weekStart: string;
  weekEnd: string;
  summary: string;
  patterns: {
    avgScore: number;
    peakDay: string;
    lowDay: string;
    dominantEmotions: string[];
    trend: 'up' | 'down' | 'stable';
  };
}

const TREND_EMOJI = { up: 'Improving', down: 'Declining', stable: 'Stable' };
const TREND_COLOR = { up: '#065F46', down: '#991B1B', stable: '#1E40AF' };
const TREND_BG = { up: '#D1FAE5', down: '#FEE2E2', stable: '#DBEAFE' };

export default function InsightsScreen() {
  const isPremium = useAuthStore((s) => s.isPremium());
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isPremium) { setLoading(false); return; }
    loadAnalysis();
  }, [isPremium]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/mood/weekly-analysis');
      setAnalysis(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/api/mood/generate-analysis');
      setAnalysis(data);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Could not generate analysis';
    } finally {
      setGenerating(false);
    }
  };

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
        <View style={styles.gateState}>
          <Text style={styles.gateTitle}>Weekly Emotional Insights</Text>
          <Text style={styles.gateBody}>
            Upgrade to Premium to unlock weekly emotional pattern analysis powered by AI.
          </Text>
          <View style={styles.gateFeatures}>
            {['Weekly trend analysis', 'Dominant emotion tracking', 'Personalized suggestions', 'On-demand analysis'].map(f => (
              <Text key={f} style={styles.gateFeature}>• {f}</Text>
            ))}
          </View>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade to Premium — $9.99/mo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={generateAnalysis} disabled={generating}>
          {generating ? <ActivityIndicator color={COLORS.primary} size="small" /> : <Text style={styles.refreshText}>Refresh</Text>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={COLORS.primary} size="large" /></View>
      ) : !analysis ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No analysis yet</Text>
          <Text style={styles.emptyBody}>Log at least 3 mood check-ins to generate your first weekly insight.</Text>
          <TouchableOpacity style={styles.generateBtn} onPress={generateAnalysis} disabled={generating}>
            {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateBtnText}>Generate Analysis</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.weekLabel}>
            Week of {new Date(analysis.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(analysis.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{analysis.patterns.avgScore}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: TREND_BG[analysis.patterns.trend] }]}>
              <Text style={[styles.statValue, { color: TREND_COLOR[analysis.patterns.trend] }]}>
                {TREND_EMOJI[analysis.patterns.trend]}
              </Text>
              <Text style={styles.statLabel}>Trend</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{analysis.patterns.peakDay.slice(0,3)}</Text>
              <Text style={styles.statLabel}>Best Day</Text>
            </View>
          </View>

          {/* Dominant emotions */}
          {analysis.patterns.dominantEmotions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Most Common Emotions</Text>
              <View style={styles.emotionRow}>
                {analysis.patterns.dominantEmotions.map(e => (
                  <View key={e} style={styles.emotionChip}>
                    <Text style={styles.emotionText}>{e}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* AI Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thera's Weekly Reflection</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{analysis.summary}</Text>
            </View>
          </View>
        </ScrollView>
      )}
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  refreshBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  refreshText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  content: { padding: 20 },
  weekLabel: { fontSize: 13, color: COLORS.textLight, marginBottom: 16, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '500' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  emotionRow: { flexDirection: 'row', gap: 8 },
  emotionChip: {
    backgroundColor: COLORS.primaryLight, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  emotionText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  summaryCard: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryText: { fontSize: 15, color: COLORS.text, lineHeight: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  generateBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  gateState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  gateTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  gateBody: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  gateFeatures: { alignSelf: 'stretch', marginBottom: 28 },
  gateFeature: { fontSize: 14, color: COLORS.text, marginBottom: 8, lineHeight: 20 },
  upgradeBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 16, alignSelf: 'stretch', alignItems: 'center',
  },
  upgradeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
