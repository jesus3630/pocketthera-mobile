import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { useMoodStore } from '../../store/mood.store';
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

const TREND_LABEL = { up: 'Improving', down: 'Declining', stable: 'Stable' };
const TREND_COLOR = { up: '#065F46', down: '#991B1B', stable: '#1E40AF' };
const TREND_BG = { up: '#D1FAE5', down: '#FEE2E2', stable: '#DBEAFE' };

function MoodSparkline({ entries }: { entries: { score: number; loggedAt: string }[] }) {
  const W = 320, H = 120, PAD = 16;
  if (entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) =>
    new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
  ).slice(-14);

  const n = sorted.length;
  const points = sorted.map((e, i) => {
    const x = PAD + (i / Math.max(n - 1, 1)) * (W - PAD * 2);
    const y = PAD + ((10 - e.score) / 9) * (H - PAD * 2);
    return { x, y, score: e.score };
  });

  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={spark.wrap}>
      <Text style={spark.title}>Last {n} Check-Ins</Text>
      <View style={spark.labels}>
        <Text style={spark.yLabel}>10</Text>
        <Text style={spark.yLabel}>5</Text>
        <Text style={spark.yLabel}>1</Text>
      </View>
      <Svg width={W} height={H}>
        {/* Grid lines */}
        {[1, 5, 10].map(v => {
          const y = PAD + ((10 - v) / 9) * (H - PAD * 2);
          return (
            <Line key={v} x1={PAD} y1={y} x2={W - PAD} y2={y}
              stroke="#E5E7EB" strokeWidth={1} strokeDasharray="4,4" />
          );
        })}
        <Polyline
          points={polyPoints}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4}
            fill={COLORS.primary} stroke="#fff" strokeWidth={2} />
        ))}
      </Svg>
    </View>
  );
}

const spark = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
  },
  title: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, marginBottom: 8 },
  labels: {
    position: 'absolute', top: 36, left: 8, height: 88,
    justifyContent: 'space-between',
  },
  yLabel: { fontSize: 10, color: COLORS.textLight },
});

export default function InsightsScreen() {
  const isPremium = useAuthStore((s) => s.isPremium());
  const { entries, load: loadMood } = useMoodStore();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadMood();
    if (isPremium) loadAnalysis();
    else setLoading(false);
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
      // silently fail — user may not have enough entries
    } finally {
      setGenerating(false);
    }
  };

  const avgScore = entries.length
    ? Math.round((entries.reduce((s, e) => s + e.score, 0) / entries.length) * 10) / 10
    : null;

  // Free tier — show mood chart + upgrade prompt
  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {entries.length >= 2 ? (
            <>
              <MoodSparkline entries={entries} />
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{avgScore ?? '—'}</Text>
                  <Text style={styles.statLabel}>Avg Mood</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{entries.length}</Text>
                  <Text style={styles.statLabel}>Check-Ins</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{Math.max(...entries.map(e => e.score))}</Text>
                  <Text style={styles.statLabel}>Best</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyHint}>
              <Text style={styles.emptyHintText}>
                Log at least 2 mood check-ins to see your chart here.
              </Text>
            </View>
          )}

          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>AI Insights — Coming Soon</Text>
            <Text style={styles.upgradeBody}>
              Weekly emotional pattern analysis powered by Thera — trend detection, peak day breakdowns, and personalized suggestions.
            </Text>
            {['Weekly AI trend analysis', 'Dominant emotion tracking', 'On-demand deep analysis'].map(f => (
              <Text key={f} style={styles.upgradeFeature}>• {f}</Text>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Premium tier
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={generateAnalysis} disabled={generating}>
          {generating
            ? <ActivityIndicator color={COLORS.primary} size="small" />
            : <Text style={styles.refreshText}>Refresh</Text>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={COLORS.primary} size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {entries.length >= 2 && <MoodSparkline entries={entries} />}

          {!analysis ? (
            <View style={styles.emptyHint}>
              <Text style={styles.emptyTitle}>No analysis yet</Text>
              <Text style={styles.emptyHintText}>
                Log at least 3 mood check-ins to generate your first weekly insight.
              </Text>
              <TouchableOpacity style={styles.generateBtn} onPress={generateAnalysis} disabled={generating}>
                {generating
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.generateBtnText}>Generate Analysis</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.weekLabel}>
                Week of {new Date(analysis.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' – '}
                {new Date(analysis.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{analysis.patterns.avgScore}</Text>
                  <Text style={styles.statLabel}>Avg Score</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: TREND_BG[analysis.patterns.trend] }]}>
                  <Text style={[styles.statValue, { color: TREND_COLOR[analysis.patterns.trend] }]}>
                    {TREND_LABEL[analysis.patterns.trend]}
                  </Text>
                  <Text style={styles.statLabel}>Trend</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{analysis.patterns.peakDay.slice(0, 3)}</Text>
                  <Text style={styles.statLabel}>Best Day</Text>
                </View>
              </View>

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

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thera's Weekly Reflection</Text>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryText}>{analysis.summary}</Text>
                </View>
              </View>
            </>
          )}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  emptyHint: { alignItems: 'center', paddingVertical: 20, marginBottom: 24 },
  emptyHintText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
  generateBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  upgradeCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  upgradeTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  upgradeBody: { fontSize: 14, color: COLORS.textLight, lineHeight: 20, marginBottom: 16 },
  upgradeFeature: { fontSize: 14, color: COLORS.text, marginBottom: 6, lineHeight: 20 },
  upgradeBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  upgradeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
