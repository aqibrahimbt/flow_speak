import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFlowSpeak, type MoodType } from '@/contexts/FlowSpeakContext';
import { YEAR_PROGRAM, type Task, type TaskType } from '@/constants/program';
import TaskCard from '@/components/TaskCard';
import { Smile, Meh, Frown, AlertCircle, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const ALL_TASKS: Task[] = [];
YEAR_PROGRAM.forEach((day) => {
  day.tasks.forEach((task) => {
    if (!ALL_TASKS.find(t => t.id === task.id)) {
      ALL_TASKS.push(task);
    }
  });
});

const MOOD_OPTIONS: { mood: MoodType; icon: any; label: string; color: string }[] = [
  { mood: 'great', icon: Sparkles, label: 'Great', color: '#4AFFAA' },
  { mood: 'good', icon: Smile, label: 'Good', color: '#4AC7FF' },
  { mood: 'okay', icon: Meh, label: 'Okay', color: '#FFB84A' },
  { mood: 'struggling', icon: Frown, label: 'Struggling', color: '#FFA64A' },
  { mood: 'difficult', icon: AlertCircle, label: 'Difficult', color: '#FF4A8B' },
];

export default function PracticeScreen() {
  const router = useRouter();
  const { completeTask, isTaskCompleted, uncompleteTask, logMood, getTodayMood } = useFlowSpeak();
  const [selectedFilter, setSelectedFilter] = useState<TaskType | 'all'>('all');
  const [showMoodPrompt, setShowMoodPrompt] = useState(false);

  const todayMood = getTodayMood();

  const filteredTasks = selectedFilter === 'all' 
    ? ALL_TASKS 
    : ALL_TASKS.filter(t => t.type === selectedFilter);

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
    logMood(mood);
    setShowMoodPrompt(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Practice',
          headerStyle: { backgroundColor: '#A64AFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />
      <LinearGradient
        colors={['#A64AFF', '#7108D1']}
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
          {!todayMood && (
            <View style={styles.moodCard}>
              <Text style={styles.moodTitle}>How are you feeling today?</Text>
              <Text style={styles.moodSubtitle}>Log your mood to track your progress</Text>
              <View style={styles.moodOptions}>
                {MOOD_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <TouchableOpacity
                      key={option.mood}
                      style={[styles.moodOption, { borderColor: option.color }]}
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
            </View>
          )}

          {todayMood && (
            <View style={styles.moodCard}>
              <Text style={styles.moodTitle}>Today&apos;s Mood</Text>
              <View style={styles.currentMood}>
                {(() => {
                  const option = MOOD_OPTIONS.find(o => o.mood === todayMood.mood);
                  if (!option) return null;
                  const Icon = option.icon;
                  return (
                    <>
                      <Icon size={32} color={option.color} strokeWidth={2.5} />
                      <Text style={[styles.currentMoodLabel, { color: option.color }]}>
                        {option.label}
                      </Text>
                    </>
                  );
                })()}
              </View>
              <TouchableOpacity
                style={styles.changeMoodButton}
                onPress={() => setShowMoodPrompt(!showMoodPrompt)}
              >
                <Text style={styles.changeMoodText}>Change Mood</Text>
              </TouchableOpacity>
              {showMoodPrompt && (
                <View style={styles.moodOptions}>
                  {MOOD_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <TouchableOpacity
                        key={option.mood}
                        style={[styles.moodOption, { borderColor: option.color }]}
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
          )}

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
              <TouchableOpacity
                key={task.id}
                onPress={() => handleTaskPress(task)}
                activeOpacity={1}
              >
                <TaskCard
                  task={task}
                  isCompleted={isTaskCompleted(task.id)}
                  onToggle={() => {
                    if (isTaskCompleted(task.id)) {
                      uncompleteTask(task.id);
                    } else {
                      completeTask(task);
                    }
                  }}
                />
              </TouchableOpacity>
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
    backgroundColor: '#f8f8f8',
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
  moodCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  moodTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 6,
  },
  moodSubtitle: {
    fontSize: 14,
    color: '#888',
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
    backgroundColor: '#f8f8f8',
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
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
    color: '#5B4FFF',
    fontWeight: '600' as const,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#1a1a1a',
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
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  filterChipActive: {
    borderColor: 'transparent',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#888',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  tasksContainer: {
    gap: 16,
  },
  bottomPadding: {
    height: 20,
  },
});
