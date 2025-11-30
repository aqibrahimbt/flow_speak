import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useFlowSpeak } from '@/contexts/FlowSpeakContext';
import * as Haptics from 'expo-haptics';
import { palette } from '@/constants/colors';

const PHASES = [
  { name: 'Foundation', start: 1, end: 90, color: '#4AC7FF', bg: '#E8F5FF' },
  { name: 'Build the Toolset', start: 91, end: 180, color: '#FF4A8B', bg: '#FFE8F0' },
  { name: 'Transfer & Desensitize', start: 181, end: 270, color: '#A64AFF', bg: '#F0E8FF' },
  { name: 'High-Stakes & Maintenance', start: 271, end: 365, color: '#4AFFAA', bg: '#E8FFF0' },
];

const PHASE_CONTENT: Record<string, { summary: string; daily: string[]; weekly: string[]; months: string[] }> = {
  Foundation: {
    summary: 'Months 1–3: awareness, breath, slow/prolonged speech, easy onsets, light contacts, gentle desensitization.',
    daily: [
      'Body + breath reset; slow/prolonged speech; easy onset/light contacts; simple monologue/reading; a few voluntary stutters.',
      'Short log: stuttering/tension/avoidance scores + one win/one challenge/one micro-challenge.',
    ],
    weekly: [
      'Low-pressure micro-challenges: greet + question daily, first short calls, order in person with pausing.',
      'Review one recording per week; note tension and thoughts.',
    ],
    months: [
      'Month 1: Install slow/prolonged + pausing.',
      'Month 2: Add easy onsets + light contacts.',
      'Month 3: Alternate onsets/contacts + phrasing; begin safe voluntary stutters.',
    ],
  },
  'Build the Toolset': {
    summary: 'Months 4–6: tool chaining, pull-outs, cancellations, mock dialogues, mini-presentations, start CBT/mindfulness.',
    daily: [
      'Rotate shaping drills (onset/contacts/pausing) with over-learned slow reads.',
      'Practice pull-outs/cancellations in reading/monologues; short CBT/mindful check-ins 2x/week.',
    ],
    weekly: [
      'Scripted medium-stakes calls; one mini-presentation/week (record & review).',
      'Daily voluntary stutter; use a pull-out in a live conversation.',
    ],
    months: [
      'Month 4: Tool chaining + scripted calls.',
      'Month 5: Live pull-outs; daily voluntary stutters.',
      'Month 6: Mini-presentations; deliberate “hard” situation each week.',
    ],
  },
  'Transfer & Desensitize': {
    summary: 'Months 7–9: move tools into real conversations, disclose when helpful, cut avoidance.',
    daily: [
      'Real conversations as “structured task” 3x/week; mini-presentations on tougher topics.',
      'Use pull-outs/cancellations in real interactions; log one example after.',
    ],
    weekly: [
      'Planned participation in a meeting/group; use disclosure at least once/week.',
      'Public voluntary stutters; pick one avoidance situation and do it, then reflect.',
    ],
    months: [
      'Month 7: Speak once in a group/meeting weekly; start disclosure.',
      'Month 8: Talk 5–10 min to 2+ people weekly; public voluntary stutters.',
      'Month 9: Face one avoidance target per week; 10-min reflection after.',
    ],
  },
  'High-Stakes & Maintenance': {
    summary: 'Months 10–12: on-demand tool switching in higher pressure, big projects, build your long-term plan.',
    daily: [
      'Short tool refresh (onsets/contacts/pausing); practice rapid tool switching.',
      'Choose mildly uncomfortable tasks 3x/week (speak up, make the call, ask follow-ups).',
    ],
    weekly: [
      'No escape behaviors: use pull-outs/cancellations calmly; log presence vs avoidance.',
      'Values check: define “good communication” beyond fluency; plan for maintenance.',
    ],
    months: [
      'Month 10: Prepare/deliver a 10–15 min talk; outline → practice → deliver → review.',
      'Month 11: Enter feared settings (meeting/interview practice); speak twice; disclose if appropriate.',
      'Month 12: Write your maintenance plan (weekly routine, warning signs, response steps).',
    ],
  },
};

export default function PlanOverviewScreen() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const { isLoading, isHydrated, loadError } = useFlowSpeak();

  const togglePhase = (phaseName: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedPhase(expandedPhase === phaseName ? null : phaseName);
  };

  if (loadError) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Couldn&apos;t load the plan</Text>
        <Text style={styles.loadingSubtitle}>{loadError.message}</Text>
      </SafeAreaView>
    );
  }

  if (isLoading || !isHydrated) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Loading plan...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Year Plan',
          headerStyle: { backgroundColor: palette.bg },
          headerTintColor: palette.text,
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />
      <LinearGradient
        colors={palette.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>365-Day Journey</Text>
            <Text style={styles.introText}>
              A phased roadmap that grows from core fluency control into real-world transfer and high-stakes speaking.
              Each phase keeps the same daily skeleton but shifts focus, challenges, and exposure level.
            </Text>
          </View>

          {PHASES.map((phase) => {
            const isExpanded = expandedPhase === phase.name;
            const content = PHASE_CONTENT[phase.name];

            return (
              <View key={phase.name} style={styles.phaseContainer}>
                <TouchableOpacity
                  style={styles.phaseHeader}
                  onPress={() => togglePhase(phase.name)}
                  activeOpacity={0.7}
                >
                  <View style={styles.phaseHeaderContent}>
                    <View>
                      <Text style={[styles.phaseName, { color: phase.color }]}>
                        {phase.name} Phase
                      </Text>
                      <Text style={styles.phaseDays}>
                        Days {phase.start} - {phase.end}
                      </Text>
                      <Text style={styles.phaseSummary}>{content?.summary}</Text>
                    </View>
                    <View style={styles.phaseArrow}>
                      {isExpanded ? (
                        <ChevronUp size={20} color={palette.text} strokeWidth={2.5} />
                      ) : (
                        <ChevronDown size={20} color={palette.text} strokeWidth={2.5} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.phaseDetailCard}>
                    <Text style={styles.detailHeading}>Daily focus</Text>
                    {content?.daily.map((line, idx) => (
                      <Text key={idx} style={styles.detailText}>• {line}</Text>
                    ))}
                    <Text style={[styles.detailHeading, { marginTop: 12 }]}>Weekly challenges</Text>
                    {content?.weekly.map((line, idx) => (
                      <Text key={idx} style={styles.detailText}>• {line}</Text>
                    ))}
                    <Text style={[styles.detailHeading, { marginTop: 12 }]}>Month-by-month</Text>
                    {content?.months.map((line, idx) => (
                      <Text key={idx} style={styles.detailText}>• {line}</Text>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: palette.mutedText,
    fontWeight: '600' as const,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: palette.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: palette.subtleText,
    textAlign: 'center',
    lineHeight: 20,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  introCard: {
    backgroundColor: palette.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: palette.text,
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    color: palette.subtleText,
    lineHeight: 24,
  },
  phaseContainer: {
    marginBottom: 16,
  },
  phaseHeader: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
  },
  phaseHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  phaseName: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 4,
    color: palette.text,
  },
  phaseDays: {
    fontSize: 14,
    color: palette.subtleText,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  phaseSummary: {
    fontSize: 13,
    color: palette.subtleText,
    lineHeight: 20,
    marginTop: 6,
  },
  phaseArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.mutedPanel,
    borderWidth: 1,
    borderColor: palette.border,
  },
  phaseDetailCard: {
    backgroundColor: palette.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 6,
    marginTop: 10,
  },
  detailHeading: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: palette.text,
  },
  detailText: {
    fontSize: 13,
    color: palette.subtleText,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
});
