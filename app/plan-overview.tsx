import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { YEAR_PROGRAM } from '@/constants/program';
import * as Haptics from 'expo-haptics';

const PHASES = [
  { name: 'Foundation', start: 1, end: 90, color: '#4AC7FF', bg: '#E8F5FF' },
  { name: 'Technique', start: 91, end: 180, color: '#FF4A8B', bg: '#FFE8F0' },
  { name: 'Practice', start: 181, end: 270, color: '#A64AFF', bg: '#F0E8FF' },
  { name: 'Mastery', start: 271, end: 365, color: '#4AFFAA', bg: '#E8FFF0' },
];

export default function PlanOverviewScreen() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const togglePhase = (phaseName: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedPhase(expandedPhase === phaseName ? null : phaseName);
    setExpandedDay(null);
  };

  const toggleDay = (day: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedDay(expandedDay === day ? null : day);
  };

  const getPhaseTasksSummary = (start: number, end: number) => {
    const days = YEAR_PROGRAM.filter(d => d.day >= start && d.day <= end);
    const taskTypes = new Set<string>();
    days.forEach(day => {
      day.tasks.forEach(task => taskTypes.add(task.type));
    });
    return Array.from(taskTypes);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Year Plan',
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
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>365-Day Journey</Text>
            <Text style={styles.introText}>
              Your complete year-long program designed to help you build confidence and
              improve speech fluency through structured, evidence-based exercises.
            </Text>
          </View>

          {PHASES.map((phase) => {
            const isExpanded = expandedPhase === phase.name;
            const taskTypes = getPhaseTasksSummary(phase.start, phase.end);
            const days = YEAR_PROGRAM.filter(d => d.day >= phase.start && d.day <= phase.end);

            return (
              <View key={phase.name} style={styles.phaseContainer}>
                <TouchableOpacity
                  style={[styles.phaseHeader, { backgroundColor: phase.bg }]}
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
                      <View style={styles.taskTypesContainer}>
                        {taskTypes.map((type) => (
                          <View
                            key={type}
                            style={[styles.taskTypeBadge, { borderColor: phase.color }]}
                          >
                            <Text style={[styles.taskTypeText, { color: phase.color }]}>
                              {type}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={24} color={phase.color} strokeWidth={2.5} />
                    ) : (
                      <ChevronDown size={24} color={phase.color} strokeWidth={2.5} />
                    )}
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.daysContainer}>
                    {days.map((day) => {
                      const isDayExpanded = expandedDay === day.day;
                      return (
                        <View key={day.day} style={styles.dayContainer}>
                          <TouchableOpacity
                            style={styles.dayHeader}
                            onPress={() => toggleDay(day.day)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.dayHeaderContent}>
                              <Text style={styles.dayNumber}>Day {day.day}</Text>
                              <Text style={styles.dayFocus}>{day.focus}</Text>
                            </View>
                            {isDayExpanded ? (
                              <ChevronUp size={20} color="#888" strokeWidth={2.5} />
                            ) : (
                              <ChevronDown size={20} color="#888" strokeWidth={2.5} />
                            )}
                          </TouchableOpacity>

                          {isDayExpanded && (
                            <View style={styles.tasksContainer}>
                              {day.tasks.map((task, index) => (
                                <View key={task.id} style={styles.taskItem}>
                                  <View style={styles.taskHeader}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <Text style={styles.taskDuration}>{task.duration} min</Text>
                                  </View>
                                  <Text style={styles.taskDescription}>{task.description}</Text>
                                  <View style={styles.taskMeta}>
                                    <View style={[styles.taskTypeBadgeSmall, { 
                                      backgroundColor: getTaskTypeColor(task.type) 
                                    }]}>
                                      <Text style={styles.taskTypeBadgeSmallText}>
                                        {task.type}
                                      </Text>
                                    </View>
                                    <Text style={styles.taskSteps}>
                                      {task.instructions.length} steps
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      );
                    })}
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

const getTaskTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    breathing: '#E8F5FF',
    speech: '#FFE8F0',
    reading: '#F0E8FF',
    mindfulness: '#E8FFF0',
    exercise: '#FFF8E8',
  };
  return colors[type] || '#f8f8f8';
};

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
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  phaseContainer: {
    marginBottom: 16,
  },
  phaseHeader: {
    borderRadius: 20,
    padding: 20,
  },
  phaseHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseName: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  phaseDays: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  taskTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  taskTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  taskTypeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'capitalize',
  },
  daysContainer: {
    marginTop: 12,
    gap: 8,
  },
  dayContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  dayHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayHeaderContent: {
    flex: 1,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  dayFocus: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500' as const,
  },
  tasksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  taskItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    flex: 1,
  },
  taskDuration: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600' as const,
  },
  taskDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskTypeBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskTypeBadgeSmallText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#666',
    textTransform: 'capitalize',
  },
  taskSteps: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500' as const,
  },
  bottomPadding: {
    height: 20,
  },
});
