import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sparkles,
  Activity,
} from 'lucide-react-native';
import { useFlowSpeak } from '@/contexts/FlowSpeakContext';
import TaskCard from '@/components/TaskCard';
import type { Task } from '@/constants/program';
import * as Haptics from 'expo-haptics';
import { palette } from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const {
    currentDayProgram,
    isTaskCompleted,
    completeTask,
    uncompleteTask,
    progressPercentage,
    currentStreak,
    goToNextDay,
    goToPreviousDay,
    progress,
    dailyInsight,
    isLoading,
    isHydrated,
    loadError,
  } = useFlowSpeak();

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercentage,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [progressPercentage, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const handleTaskPress = (task: Task) => {
    router.push(`/task-detail?taskId=${task.id}`);
  };

  const handlePreviousDay = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    goToPreviousDay();
  };

  const handleNextDay = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    goToNextDay();
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
        <Text style={styles.loadingText}>Loading your journey...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={palette.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollAll}
          contentContainerStyle={styles.scrollAllContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Flow Speak</Text>
              <Text style={styles.subGreeting}>Small wins, every day.</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push('/stats')}
              >
                <TrendingUp size={22} color={palette.text} strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push('/settings')}
              >
                <Settings size={22} color={palette.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {dailyInsight && (
            <View style={styles.insightContainer}>
              <Text style={styles.insightText}>{dailyInsight}</Text>
            </View>
          )}

          <View style={styles.dayNavigator}>
            <TouchableOpacity
              onPress={handlePreviousDay}
              disabled={progress.currentDay <= 1}
              style={[
                styles.navButton,
                progress.currentDay <= 1 && styles.navButtonDisabled,
              ]}
            >
              <ChevronLeft
                size={24}
                color={progress.currentDay <= 1 ? '#ffffff80' : palette.text}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
            <View style={styles.dayInfo}>
              <Text style={styles.dayNumber}>Day {progress.currentDay}</Text>
              <Text style={styles.phaseText}>{currentDayProgram.phase}</Text>
            </View>
            <TouchableOpacity
              onPress={handleNextDay}
              disabled={progress.currentDay >= 365}
              style={[
                styles.navButton,
                progress.currentDay >= 365 && styles.navButtonDisabled,
              ]}
            >
              <ChevronRight
                size={24}
                color={progress.currentDay >= 365 ? '#ffffff80' : palette.text}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Flow</Text>
            <TouchableOpacity style={styles.smallAction} onPress={() => router.push('/practice')}>
              <Activity size={16} color={palette.text} strokeWidth={2.5} />
              <Text style={styles.smallActionText}>Free practice</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.focusText}>Curated plan • {currentDayProgram.tasks.length} tasks</Text>

          {currentDayProgram.tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isCompleted={isTaskCompleted(task.id)}
              onPressCard={() => handleTaskPress(task)}
              onToggle={() => {
                if (isTaskCompleted(task.id)) {
                  uncompleteTask(task.id);
                } else {
                  completeTask(task);
                }
              }}
            />
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/practice')}
          activeOpacity={0.85}
        >
          <Sparkles size={22} color={palette.text} strokeWidth={2.5} />
          <Text style={styles.fabText}>Quick Practice</Text>
        </TouchableOpacity>
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
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    opacity: 0.5,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: palette.text,
  },
  subGreeting: {
    fontSize: 12,
    color: palette.mutedText,
    marginTop: 4,
    fontWeight: '600' as const,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dayNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  dayInfo: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: palette.text,
  },
  phaseText: {
    fontSize: 14,
    color: palette.mutedText,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  scrollAll: {
    flex: 1,
  },
  scrollAllContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: palette.text,
    marginBottom: 4,
  },
  focusText: {
    fontSize: 15,
    color: palette.subtleText,
    marginBottom: 12,
    fontWeight: '500' as const,
  },
  smallAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  smallActionText: {
    color: palette.text,
    fontWeight: '700' as const,
    fontSize: 13,
  },
  bottomPadding: {
    height: 60,
  },
  insightContainer: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
  },
  insightText: {
    fontSize: 14,
    color: palette.text,
    lineHeight: 20,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  fabText: {
    color: palette.text,
    fontWeight: '800' as const,
    fontSize: 14,
  },
});
