import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Target, Award, TrendingUp } from 'lucide-react-native';
import { useFlowSpeak } from '@/contexts/FlowSpeakContext';

export default function StatsScreen() {
  const {
    progress,
    currentStreak,
    totalCompletedDays,
    currentDayProgram,
  } = useFlowSpeak();

  const totalTasks = progress.completedTasks.length;
  const daysActive = progress.currentDay;
  const percentageComplete = ((daysActive / 365) * 100).toFixed(1);

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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Your Progress',
          headerStyle: { backgroundColor: '#FF6B9D' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />
      <LinearGradient
        colors={['#FF6B9D', '#C651CD', '#5B4FFF']}
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
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: '#1a1a1a',
  },
  mainSubtitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FF4A8B',
    marginTop: 4,
  },
  mainFocus: {
    fontSize: 15,
    color: '#666',
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
    color: '#666',
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
    color: '#888',
    fontWeight: '600' as const,
  },
  milestoneCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  milestoneTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
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
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  milestoneCircleComplete: {
    backgroundColor: '#4AFFAA',
  },
  milestoneNumber: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#999',
  },
  milestoneNumberComplete: {
    color: '#08D171',
  },
  milestoneLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  milestoneLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 4,
    marginBottom: 32,
  },
  milestoneLineComplete: {
    backgroundColor: '#4AFFAA',
  },
  bottomPadding: {
    height: 20,
  },
});
