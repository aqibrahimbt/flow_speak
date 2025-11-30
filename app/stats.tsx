import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Target, Award, TrendingUp } from 'lucide-react-native';
import { useFlowSpeak } from '@/contexts/FlowSpeakContext';
import { palette } from '@/constants/colors';

export default function StatsScreen() {
  const {
    progress,
    currentStreak,
    totalCompletedDays,
    currentDayProgram,
    isLoading,
    isHydrated,
    loadError,
    todayCompletedTasks,
    todayExtraPractice,
  } = useFlowSpeak();

  const totalTasks = progress.completedTasks.length;
  const daysActive = progress.currentDay;
  const percentageComplete = ((daysActive / 365) * 100).toFixed(1);
  const recentRatings = progress.ratings.slice(-30);
  const recentMoods = progress.moods.slice(-30);
  const last7Moods = recentMoods.slice(-7);
  const last7Ratings = recentRatings.slice(-7);

  const avg = (arr: number[]) => arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : '—';
  const avgRating30 = avg(recentRatings.map(r => r.rating));
  const moodScore = (mood: string) => {
    switch (mood) {
      case 'great': return 5;
      case 'good': return 4;
      case 'okay': return 3;
      case 'struggling': return 2;
      case 'difficult': return 1;
      default: return 3;
    }
  };
  const avgMood30 = avg(recentMoods.map(m => moodScore(m.mood)));

  const mostSwapped = (() => {
    const map = new Map<string, number>();
    progress.swaps.forEach(s => {
      map.set(s.originalTaskId, (map.get(s.originalTaskId) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  })();

  const stats = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: currentStreak,
      unit: 'days',
      color: '#FF4A8B',
      bg: '#FFE8F0',
    },
    {
      icon: Target,
      label: 'Days Completed',
      value: totalCompletedDays,
      unit: 'of 365',
      color: '#4AFFAA',
      bg: '#E8FFF0',
    },
    {
      icon: Award,
      label: 'Total Tasks',
      value: totalTasks,
      unit: 'tasks',
      color: '#A64AFF',
      bg: '#F0E8FF',
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      value: percentageComplete,
      unit: '%',
      color: '#FFB84A',
      bg: '#FFF8E8',
    },
  ];

  if (loadError) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Couldn&apos;t load your stats</Text>
        <Text style={styles.loadingSubtitle}>{loadError.message}</Text>
      </SafeAreaView>
    );
  }

  if (isLoading || !isHydrated) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Loading stats...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Your Progress',
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
          <View style={styles.mainCard}>
            <Text style={styles.mainTitle}>Day {progress.currentDay}</Text>
            <Text style={styles.mainSubtitle}>{currentDayProgram.phase} Phase</Text>
            <Text style={styles.mainFocus}>{currentDayProgram.focus}</Text>
          </View>

          <View style={styles.statsGrid}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <View
                  key={index}
                  style={[styles.statCard, { backgroundColor: stat.bg }]}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: stat.color },
                    ]}
                  >
                    <Icon size={24} color="#fff" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <View style={styles.statValueContainer}>
                    <Text style={[styles.statValue, { color: stat.color }]}>
                      {stat.value}
                    </Text>
                    <Text style={styles.statUnit}>{stat.unit}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneTitle}>Journey Milestones</Text>
            <View style={styles.milestones}>
              <View style={styles.milestone}>
                <View
                  style={[
                    styles.milestoneCircle,
                    daysActive >= 30 && styles.milestoneCircleComplete,
                  ]}
                >
                  <Text
                    style={[
                      styles.milestoneNumber,
                      daysActive >= 30 && styles.milestoneNumberComplete,
                    ]}
                  >
                    30
                  </Text>
                </View>
                <Text style={styles.milestoneLabel}>Foundation</Text>
              </View>

              <View
                style={[
                  styles.milestoneLine,
                  daysActive >= 30 && styles.milestoneLineComplete,
                ]}
              />

              <View style={styles.milestone}>
                <View
                  style={[
                    styles.milestoneCircle,
                    daysActive >= 90 && styles.milestoneCircleComplete,
                  ]}
                >
                  <Text
                    style={[
                      styles.milestoneNumber,
                      daysActive >= 90 && styles.milestoneNumberComplete,
                    ]}
                  >
                    90
                  </Text>
                </View>
                <Text style={styles.milestoneLabel}>Technique</Text>
              </View>

              <View
                style={[
                  styles.milestoneLine,
                  daysActive >= 90 && styles.milestoneLineComplete,
                ]}
              />

              <View style={styles.milestone}>
                <View
                  style={[
                    styles.milestoneCircle,
                    daysActive >= 180 && styles.milestoneCircleComplete,
                  ]}
                >
                  <Text
                    style={[
                      styles.milestoneNumber,
                      daysActive >= 180 && styles.milestoneNumberComplete,
                    ]}
                  >
                    180
                  </Text>
                </View>
                <Text style={styles.milestoneLabel}>Practice</Text>
              </View>

              <View
                style={[
                  styles.milestoneLine,
                  daysActive >= 180 && styles.milestoneLineComplete,
                ]}
              />

              <View style={styles.milestone}>
                <View
                  style={[
                    styles.milestoneCircle,
                    daysActive >= 365 && styles.milestoneCircleComplete,
                  ]}
                >
                  <Text
                    style={[
                      styles.milestoneNumber,
                      daysActive >= 365 && styles.milestoneNumberComplete,
                    ]}
                  >
                    365
                  </Text>
                </View>
                <Text style={styles.milestoneLabel}>Mastery</Text>
              </View>
            </View>
          </View>

          <View style={styles.trendsCard}>
            <Text style={styles.trendsTitle}>Mood & Ratings</Text>
            <View style={styles.trendsRow}>
              <View style={styles.trendItem}>
                <Text style={styles.trendLabel}>Avg rating (30d)</Text>
                <Text style={styles.trendValue}>{avgRating30}</Text>
              </View>
              <View style={styles.trendItem}>
                <Text style={styles.trendLabel}>Avg mood (30d)</Text>
                <Text style={styles.trendValue}>{avgMood30}</Text>
              </View>
            </View>
            <View style={styles.trendList}>
              <Text style={styles.trendSubheading}>Last 7 moods</Text>
              {last7Moods.length === 0 ? (
                <Text style={styles.trendEmpty}>No moods logged yet.</Text>
              ) : last7Moods.map((m, idx) => (
                <Text key={idx} style={styles.trendEntry}>
                  Day {m.day}: {m.mood}{m.note ? ` — ${m.note}` : ''}
                </Text>
              ))}
              <Text style={[styles.trendSubheading, { marginTop: 10 }]}>Last 7 ratings</Text>
              {last7Ratings.length === 0 ? (
                <Text style={styles.trendEmpty}>No ratings yet.</Text>
              ) : last7Ratings.map((r, idx) => (
                <Text key={idx} style={styles.trendEntry}>
                  Task {r.taskId}: {r.rating}{r.note ? ` — ${r.note}` : ''}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.trendsCard}>
            <Text style={styles.trendsTitle}>Most Swapped Tasks</Text>
            {mostSwapped.length === 0 ? (
              <Text style={styles.trendEmpty}>No swaps yet.</Text>
            ) : mostSwapped.map(([taskId, count]) => (
              <Text key={taskId} style={styles.trendEntry}>
                {taskId}: {count} swap(s)
              </Text>
            ))}
          </View>

          <View style={styles.trendsCard}>
            <Text style={styles.trendsTitle}>Today Snapshot</Text>
            <Text style={styles.trendEntry}>
              Plan tasks done: {todayCompletedTasks.length} / {currentDayProgram.tasks.length}
            </Text>
            <Text style={styles.trendEntry}>
              Extra practice items: {todayExtraPractice.length}
            </Text>
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
  mainCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: palette.text,
  },
  mainSubtitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: palette.accent,
    marginTop: 4,
  },
  mainFocus: {
    fontSize: 15,
    color: palette.subtleText,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: palette.subtleText,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800' as const,
  },
  statUnit: {
    fontSize: 14,
    color: palette.mutedText,
    fontWeight: '600' as const,
  },
  milestoneCard: {
    backgroundColor: palette.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 14,
  },
  milestoneTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: palette.text,
    marginBottom: 24,
  },
  milestones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestone: {
    alignItems: 'center',
  },
  milestoneCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.mutedPanel,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  milestoneCircleComplete: {
    backgroundColor: palette.success,
  },
  milestoneNumber: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: palette.subtleText,
  },
  milestoneNumberComplete: {
    color: '#0F2E22',
  },
  milestoneLabel: {
    fontSize: 11,
    color: palette.subtleText,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  milestoneLine: {
    flex: 1,
    height: 3,
    backgroundColor: palette.border,
    marginHorizontal: 4,
    marginBottom: 32,
  },
  milestoneLineComplete: {
    backgroundColor: palette.success,
  },
  bottomPadding: {
    height: 20,
  },
  trendsCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 14,
  },
  trendsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: palette.text,
    marginBottom: 10,
  },
  trendsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  trendItem: {
    flex: 1,
    backgroundColor: palette.mutedPanel,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  trendLabel: {
    fontSize: 12,
    color: palette.subtleText,
    fontWeight: '600' as const,
  },
  trendValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: palette.text,
    marginTop: 4,
  },
  trendList: {
    marginTop: 12,
    gap: 4,
  },
  trendSubheading: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: palette.text,
  },
  trendEntry: {
    fontSize: 13,
    color: palette.subtleText,
    lineHeight: 18,
  },
  trendEmpty: {
    fontSize: 13,
    color: palette.subtleText,
  },
});
