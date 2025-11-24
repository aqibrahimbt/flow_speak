import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Calendar, TrendingUp, ChevronLeft, ChevronRight, Settings } from 'lucide-react-native';
import { useFlowSpeak } from '@/contexts/FlowSpeakContext';
import TaskCard from '@/components/TaskCard';
import type { Task } from '@/constants/program';
import * as Haptics from 'expo-haptics';

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#C651CD', '#5B4FFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>FlowSpeak</Text>
            <Text style={styles.subGreeting}>Your journey to fluency</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/calendar')}
            >
              <Calendar size={24} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/stats')}
            >
              <TrendingUp size={24} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/settings')}
            >
              <Settings size={24} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.streakContainer}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
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
              color={progress.currentDay <= 1 ? '#ffffff80' : '#fff'}
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
              color={progress.currentDay >= 365 ? '#ffffff80' : '#fff'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Today&apos;s Progress</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progressPercentage)}% complete
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
          <Text style={styles.focusText}>{currentDayProgram.focus}</Text>

          {currentDayProgram.tasks.map(task => (
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

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
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
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
  },
  subGreeting: {
    fontSize: 15,
    color: '#ffffffd0',
    marginTop: 2,
    fontWeight: '500' as const,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#fff',
  },
  streakLabel: {
    fontSize: 13,
    color: '#ffffffd0',
    fontWeight: '600' as const,
    marginTop: -2,
  },
  dayNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  dayInfo: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
  },
  phaseText: {
    fontSize: 14,
    color: '#ffffffd0',
    fontWeight: '600' as const,
    marginTop: 2,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#ffffffd0',
    marginTop: 6,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 6,
  },
  focusText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    fontWeight: '500' as const,
  },
  bottomPadding: {
    height: 40,
  },
  insightContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  insightText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});
