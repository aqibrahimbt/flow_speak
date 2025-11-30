import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFlowSpeak, type MoodType } from '@/contexts/FlowSpeakContext';
import type { Task, TaskType } from '@/constants/program';
import TaskCard from '@/components/TaskCard';
import { Smile, Meh, Frown, AlertCircle, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { palette } from '@/constants/colors';
import { TextInput } from 'react-native';

const MOOD_OPTIONS: { mood: MoodType; icon: any; label: string; color: string }[] = [
  { mood: 'great', icon: Sparkles, label: 'Great', color: '#4AFFAA' },
  { mood: 'good', icon: Smile, label: 'Good', color: '#4AC7FF' },
  { mood: 'okay', icon: Meh, label: 'Okay', color: '#FFB84A' },
  { mood: 'struggling', icon: Frown, label: 'Struggling', color: '#FFA64A' },
  { mood: 'difficult', icon: AlertCircle, label: 'Difficult', color: '#FF4A8B' },
];

const PRACTICE_PRESETS: Task[] = [
  {
    id: 'practice-reading-1',
    title: 'Read Aloud Warm-up',
    description: 'Read a short passage with slow rate and clear pauses.',
    type: 'reading',
    duration: 10,
    instructions: [
      'Pick a short article or page.',
      'Read aloud with slightly slower rate.',
      'Pause at punctuation; keep airflow steady.',
    ],
    tags: ['reading', 'pausing'],
  },
  {
    id: 'practice-reading-2',
    title: 'Choral Reading',
    description: 'Read along with an audio track to feel smooth flow.',
    type: 'reading',
    duration: 10,
    instructions: [
      'Play an audiobook or article with narration.',
      'Read aloud in sync with the narrator.',
      'Notice how continuous voice feels.',
    ],
    tags: ['reading', 'choral'],
  },
  {
    id: 'practice-mind-1',
    title: 'Body Scan Reset',
    description: 'Reduce tension before speaking.',
    type: 'mindfulness',
    duration: 8,
    instructions: [
      'Sit or lie down; close your eyes.',
      'Notice jaw, shoulders, neck tension.',
      'Breathe into tense spots for 3–4 breaths each.',
    ],
    tags: ['mindfulness', 'tension-release'],
  },
  {
    id: 'practice-mind-2',
    title: 'Acceptance Sit',
    description: 'Practice non-judgmental awareness of stuttering thoughts.',
    type: 'mindfulness',
    duration: 8,
    instructions: [
      'Sit quietly and breathe slowly.',
      'Notice thoughts about speaking; label them “thought”.',
      'Remind yourself: “It’s okay if I stutter.”',
    ],
    tags: ['mindfulness', 'acceptance'],
  },
  {
    id: 'practice-ex-1',
    title: 'Quick Call Rehearsal',
    description: 'Rehearse a 1-minute call with techniques.',
    type: 'exercise',
    duration: 5,
    instructions: [
      'Script a one-question call (hours, availability).',
      'Read it aloud twice with easy onsets and pausing.',
      'Make the call or leave a voice note to yourself.',
    ],
    tags: ['phone', 'rehearsal'],
  },
  {
    id: 'practice-ex-2',
    title: 'Mirror Speaking',
    description: 'Build awareness of body and eye contact.',
    type: 'exercise',
    duration: 8,
    instructions: [
      'Stand or sit in front of a mirror.',
      'Talk about your day for 3–5 minutes.',
      'Watch for tension; keep gaze steady and relaxed.',
    ],
    tags: ['awareness', 'body-language'],
  },
];

export default function PracticeScreen() {
  const router = useRouter();
  const { 
    completeExtraPractice,
    uncompleteExtraPractice,
    isExtraPracticeCompleted,
    isTaskCompleted,
    logMood,
    getTodayMood,
    isLoading,
    isHydrated,
    loadError,
    allTasks,
    currentQuarter,
  } = useFlowSpeak();
  const [selectedFilter, setSelectedFilter] = useState<TaskType | 'all'>('all');
  const [showMoodPrompt, setShowMoodPrompt] = useState(false);
  const [moodNote, setMoodNote] = useState('');

  const todayMood = getTodayMood();

  const practiceTasks = React.useMemo(() => {
    const quarter = currentQuarter ?? 1;
    const map = new Map<string, Task>();

    allTasks.forEach(task => {
      // Skip housekeeping-only items from practice library
      if (task.title === 'Log + Plan' || task.title === 'Micro-Challenge') return;

      // Avoid showing items far beyond current phase to keep list relevant
      if (task.quarter && task.quarter > quarter + 1) return;

      const key = `${task.title}-${task.type}`;
      const existing = map.get(key);
      const taskScore = task.quarter ?? 0;
      if (!existing) {
        map.set(key, task);
      } else {
        const existingScore = existing.quarter ?? 0;
        // Prefer tasks closer to current quarter without going too far ahead
        const isTaskCloser = taskScore <= quarter && taskScore >= existingScore;
        const existingTooHigh = existingScore > quarter && taskScore <= quarter;
        if (isTaskCloser || existingTooHigh) {
          map.set(key, task);
        }
      }
    });

    const baseList = Array.from(map.values());

    const hasType = (type: TaskType) => baseList.some(t => t.type === type);
    const supplemental: Task[] = [];

    if (!hasType('reading')) {
      supplemental.push(...PRACTICE_PRESETS.filter(t => t.type === 'reading'));
    }
    if (!hasType('mindfulness')) {
      supplemental.push(...PRACTICE_PRESETS.filter(t => t.type === 'mindfulness'));
    }
    if (!hasType('exercise')) {
      supplemental.push(...PRACTICE_PRESETS.filter(t => t.type === 'exercise'));
    }

    return baseList.concat(supplemental);
  }, [allTasks, currentQuarter]);

  const filteredTasks = selectedFilter === 'all' 
    ? practiceTasks 
    : practiceTasks.filter(t => t.type === selectedFilter);

  const taskTypes: { type: TaskType | 'all'; label: string; color: string }[] = [
    { type: 'all', label: 'All', color: '#888' },
    { type: 'breathing', label: 'Breathing', color: '#4AC7FF' },
    { type: 'speech', label: 'Speech', color: '#FF4A8B' },
    { type: 'reading', label: 'Reading', color: '#A64AFF' },
    { type: 'mindfulness', label: 'Mindfulness', color: '#4AFFAA' },
    { type: 'exercise', label: 'Exercise', color: '#FFB84A' },
  ];

  const handleTaskPress = (task: Task) => {
    router.push(`/task-detail?taskId=${task.id}`);
  };

  const handleMoodSelect = (mood: MoodType) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    logMood(mood, moodNote || undefined);
    setShowMoodPrompt(false);
    setMoodNote('');
  };

  if (loadError) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Couldn&apos;t load your journey</Text>
        <Text style={styles.loadingSubtitle}>{loadError.message}</Text>
      </SafeAreaView>
    );
  }

  if (isLoading || !isHydrated) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Loading practice...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Practice',
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
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Free Practice</Text>
            <Text style={styles.heroSubtitle}>Browse any exercise, log extra reps, and keep momentum.</Text>
            <View style={styles.heroPills}>
              <View style={styles.heroPill}>
                <Sparkles size={16} color={palette.accent} strokeWidth={2.5} />
                <Text style={styles.heroPillText}>Extra practice doesn&apos;t change today&apos;s plan</Text>
              </View>
              <View style={styles.heroPillMuted}>
                <AlertCircle size={16} color={palette.mutedText} strokeWidth={2.5} />
                <Text style={styles.heroPillMutedText}>Log mood to track how sessions feel</Text>
              </View>
            </View>
          </View>

          <View style={styles.moodCard}>
            <Text style={styles.moodTitle}>{todayMood ? 'Today&apos;s Mood' : 'How are you feeling today?'}</Text>
            <Text style={styles.moodSubtitle}>
              {todayMood ? 'Tap to update how you feel' : 'Log your mood to track your progress'}
            </Text>
            <View style={styles.moodOptions}>
            {MOOD_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = todayMood?.mood === option.mood;
              return (
                <TouchableOpacity
                  key={option.mood}
                  style={[
                    styles.moodOption,
                    { borderColor: active ? option.color : palette.border, backgroundColor: active ? `${option.color}15` : palette.card },
                  ]}
                  onPress={() => handleMoodSelect(option.mood)}
                  activeOpacity={0.7}
                >
                  <Icon size={24} color={option.color} strokeWidth={2.5} />
                  <Text style={[styles.moodLabel, { color: option.color }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={styles.moodInput}
            placeholder="Add a quick note (optional)"
            placeholderTextColor={palette.subtleText}
            value={moodNote}
            onChangeText={setMoodNote}
            multiline
          />
            {todayMood && (
              <TouchableOpacity
                style={styles.changeMoodButton}
                onPress={() => setShowMoodPrompt(!showMoodPrompt)}
              >
                <Text style={styles.changeMoodText}>Change mood</Text>
              </TouchableOpacity>
            )}
            {showMoodPrompt && (
              <View style={[styles.moodOptions, { marginTop: 10 }]}>
                {MOOD_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <TouchableOpacity
                      key={option.mood}
                      style={[styles.moodOption, { borderColor: option.color, backgroundColor: `${option.color}15` }]}
                      onPress={() => handleMoodSelect(option.mood)}
                      activeOpacity={0.7}
                    >
                      <Icon size={24} color={option.color} strokeWidth={2.5} />
                      <Text style={[styles.moodLabel, { color: option.color }]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Choose a Task</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              {taskTypes.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.filterChip,
                    selectedFilter === type.type && [
                      styles.filterChipActive,
                      { backgroundColor: type.color },
                    ],
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSelectedFilter(type.type);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilter === type.type && styles.filterChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.tasksContainer}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPressCard={() => handleTaskPress(task)}
                isCompleted={isTaskCompleted(task.id) || isExtraPracticeCompleted(task.id)}
                onToggle={() => {
                  if (isExtraPracticeCompleted(task.id)) {
                    uncompleteExtraPractice(task.id);
                  } else {
                    completeExtraPractice(task);
                  }
                }}
              />
            ))}
          </View>

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
  hero: {
    backgroundColor: palette.panel,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: palette.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: palette.subtleText,
    lineHeight: 20,
  },
  heroPills: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  heroPillMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  heroPillText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  heroPillMutedText: {
    color: palette.mutedText,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  moodCard: {
    backgroundColor: palette.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: palette.border,
  },
  moodTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: palette.text,
    marginBottom: 6,
  },
  moodSubtitle: {
    fontSize: 14,
    color: palette.subtleText,
    marginBottom: 16,
    fontWeight: '500' as const,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodOption: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.card,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  moodInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 12,
    color: palette.text,
    backgroundColor: palette.card,
    minHeight: 60,
  },
  currentMood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  currentMoodLabel: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  changeMoodButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  changeMoodText: {
    fontSize: 14,
    color: palette.accent,
    fontWeight: '600' as const,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: palette.text,
    marginBottom: 14,
  },
  filterScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterContent: {
    gap: 10,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: palette.card,
    borderWidth: 2,
    borderColor: palette.border,
  },
  filterChipActive: {
    borderColor: 'transparent',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: palette.mutedText,
  },
  filterChipTextActive: {
    color: palette.text,
  },
  tasksContainer: {
    gap: 16,
  },
  bottomPadding: {
    height: 20,
  },
});
