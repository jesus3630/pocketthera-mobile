import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../lib/constants';

interface Source {
  title: string;
  publisher: string;
  detail: string;
  url: string;
}

// Guideline 1.4.1: every health claim the app can surface traces back to one of these.
const SOURCES: Source[] = [
  {
    title: 'Caring for Your Mental Health',
    publisher: 'National Institute of Mental Health (NIMH)',
    detail: 'Self-care, stress, sleep and when to seek professional help — the basis for the general wellness guidance Thera offers.',
    url: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health',
  },
  {
    title: 'Psychotherapies (including CBT)',
    publisher: 'National Institute of Mental Health (NIMH)',
    detail: 'Describes cognitive behavioral therapy and the reframing exercises Thera may walk you through.',
    url: 'https://www.nimh.nih.gov/health/topics/psychotherapies',
  },
  {
    title: 'About Mental Health',
    publisher: 'Centers for Disease Control and Prevention (CDC)',
    detail: 'Definitions, risk factors and population data behind the app\'s mood and wellbeing framing.',
    url: 'https://www.cdc.gov/mental-health/about/',
  },
  {
    title: 'Mental Health',
    publisher: 'World Health Organization (WHO)',
    detail: 'International guidance on mental wellbeing, stress and self-care practices.',
    url: 'https://www.who.int/health-topics/mental-health',
  },
  {
    title: 'Psychology Topics',
    publisher: 'American Psychological Association (APA)',
    detail: 'Evidence summaries on stress, anxiety, emotion regulation and mindfulness.',
    url: 'https://www.apa.org/topics',
  },
  {
    title: 'Cognitive Processing and Grounding Resources',
    publisher: 'U.S. Department of Veterans Affairs — National Center for PTSD',
    detail: 'Source for the grounding and breathing exercises Thera suggests.',
    url: 'https://www.ptsd.va.gov/understand_tx/cognitive_processing.asp',
  },
  {
    title: 'Mindfulness Meditation: What You Need To Know',
    publisher: 'National Center for Complementary and Integrative Health (NIH)',
    detail: 'Evidence review for the mindfulness practices referenced in the app.',
    url: 'https://www.nccih.nih.gov/health/meditation-and-mindfulness-what-you-need-to-know',
  },
  {
    title: '988 Suicide & Crisis Lifeline',
    publisher: '988 Lifeline (SAMHSA)',
    detail: 'The crisis resource the app surfaces. Call or text 988 in the US, 24/7.',
    url: 'https://988lifeline.org',
  },
  {
    title: 'Crisis Text Line',
    publisher: 'Crisis Text Line',
    detail: 'Text HOME to 741741 to reach a trained crisis counselor.',
    url: 'https://www.crisistextline.org',
  },
  {
    title: 'International Crisis Centres',
    publisher: 'International Association for Suicide Prevention (IASP)',
    detail: 'Crisis lines outside the United States.',
    url: 'https://www.iasp.info/resources/Crisis_Centres/',
  },
];

export default function SourcesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sources & Citations</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.introText}>
            PocketThera is a wellness tool — it is not medical care, therapy, or diagnosis, and Thera is an AI,
            not a licensed clinician. Any wellness or coping guidance in the app is drawn from the public health
            and psychology sources below. Tap any source to read it in full.
          </Text>
        </View>

        {SOURCES.map((s) => (
          <TouchableOpacity key={s.url} style={styles.card} onPress={() => Linking.openURL(s.url)}>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardPublisher}>{s.publisher}</Text>
            <Text style={styles.cardDetail}>{s.detail}</Text>
            <Text style={styles.cardUrl}>{s.url}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.footer}>
          If you need medical advice, a diagnosis, or treatment, please speak with a licensed professional.
          In an emergency, call or text 988 (US) or your local emergency number.
        </Text>
      </ScrollView>
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
  back: { color: COLORS.primary, fontSize: 16, fontWeight: '600', width: 70 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  spacer: { width: 70 },
  content: { padding: 20, paddingBottom: 40 },
  intro: { marginBottom: 18 },
  introText: { fontSize: 14, color: COLORS.textLight, lineHeight: 20 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  cardPublisher: { fontSize: 13, fontWeight: '600', color: COLORS.primary, marginBottom: 8 },
  cardDetail: { fontSize: 13, color: COLORS.textLight, lineHeight: 19, marginBottom: 8 },
  cardUrl: { fontSize: 12, color: COLORS.primary },
  footer: { fontSize: 12, color: COLORS.textLight, lineHeight: 18, marginTop: 8, textAlign: 'center' },
});
