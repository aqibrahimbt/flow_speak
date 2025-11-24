import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFlowSpeak } from '@/contexts/FlowSpeakContext';
import { YEAR_PROGRAM } from '@/constants/program';

export default function CalendarScreen() {
  const { progress } = useFlowSpeak();

  const getDayStatus = (day: number): 'future' | 'current' | 'completed' | 'incomplete' => {
    if (day > progress.currentDay) return 'future';
    if (day === progress.currentDay) return 'current';

    const dayTasks = YEAR_PROGRAM.find(p => p.day === day)?.tasks || [];
    const completedTasks = progress.completedTasks.filter(t => t.day === day);

    if (completedTasks.length === dayTasks.length && dayTasks.length > 0) {
      return 'completed';
    }
    return 'incomplete';
  };

  const renderMonth = (monthNum: number) => {
    const startDay = (monthNum - 1) * 30 + 1;
    const endDay = Math.min(monthNum * 30, 365);
    const days = [];

    for (let day = startDay; day <= endDay; day++) {
      days.push(day);
    }

    return (
      <View key={monthNum} style={styles.monthContainer}>
        <Text style={styles.monthTitle}>Month {monthNum}</Text>
        <View style={styles.daysGrid}>
          {days.map(day => {
            const status = getDayStatus(day);
            return (
              <View
                key={day}
                style={[
                  styles.dayCell,
                  status === 'completed' && styles.dayCellCompleted,
                  status === 'current' && styles.dayCellCurrent,
                  status === 'incomplete' && styles.dayCellIncomplete,
                  status === 'future' && styles.dayCellFuture,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    status === 'completed' && styles.dayTextCompleted,
                    status === 'current' && styles.dayTextCurrent,
                  ]}
                >
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const months = Array.from({ length: 13 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Calendar',
          headerStyle: { backgroundColor: '#5B4FFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />
      <LinearGradient
        colors={['#5B4FFF', '#C651CD']}
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
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dayCellCompleted]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dayCellCurrent]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dayCellIncomplete]} />
              <Text style={styles.legendText}>Incomplete</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dayCellFuture]} />
              <Text style={styles.legendText}>Future</Text>
            </View>
          </View>

          {months.map(month => renderMonth(month))}
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
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600' as const,
  },
  monthContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCell: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellCompleted: {
    backgroundColor: '#4AFFAA',
  },
  dayCellCurrent: {
    backgroundColor: '#FF4A8B',
    borderWidth: 2,
    borderColor: '#D10854',
  },
  dayCellIncomplete: {
    backgroundColor: '#FFD7A6',
  },
  dayCellFuture: {
    backgroundColor: '#E8E8E8',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  dayTextCompleted: {
    color: '#08D171',
  },
  dayTextCurrent: {
    color: '#fff',
  },
  bottomPadding: {
    height: 20,
  },
});
