import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, Info, BookOpen, Dumbbell, Zap, ToggleLeft, ToggleRight } from 'lucide-react-native';
import { useFlowSpeak } from '@/contexts/FlowSpeakContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const { progress, toggleAdaptiveTasks } = useFlowSpeak();

  const handleResetProgress = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Are you sure you want to reset all your progress? This cannot be undone.'
      );
      if (confirmed) {
        performReset();
      }
    } else {
      Alert.alert(
        'Reset Progress',
        'Are you sure you want to reset all your progress? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: () => performReset(),
          },
        ]
      );
    }
  };

  const performReset = async () => {
    try {
      await AsyncStorage.removeItem('@flowspeak_progress');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      if (Platform.OS === 'web') {
        window.location.reload();
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  const startDate = new Date(progress.startDate);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
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
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Your Journey</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Started on</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Day</Text>
              <Text style={styles.infoValue}>{progress.currentDay} / 365</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Tasks</Text>
              <Text style={styles.infoValue}>{progress.completedTasks.length}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Task Generation</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                toggleAdaptiveTasks();
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: progress.useAdaptiveTasks ? '#E8FFF0' : '#f8f8f8' }]}>
                <Zap size={20} color={progress.useAdaptiveTasks ? '#4AFFAA' : '#888'} strokeWidth={2.5} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>Adaptive Tasks</Text>
                <Text style={styles.menuSubtext}>
                  {progress.useAdaptiveTasks 
                    ? 'Tasks adapt to your progress and ratings'
                    : 'Using fixed year-long program'}
                </Text>
              </View>
              {progress.useAdaptiveTasks ? (
                <ToggleRight size={32} color="#4AFFAA" strokeWidth={2.5} />
              ) : (
                <ToggleLeft size={32} color="#E8E8E8" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resources</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/plan-overview')}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#E8F5FF' }]}>
                <BookOpen size={20} color="#4AC7FF" strokeWidth={2.5} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>View Full Program</Text>
                <Text style={styles.menuSubtext}>See the entire year plan</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/practice')}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#F0E8FF' }]}>
                <Dumbbell size={20} color="#A64AFF" strokeWidth={2.5} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>Free Practice</Text>
                <Text style={styles.menuSubtext}>Practice any task anytime</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              onPress={handleResetProgress}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#FFE8F0' }]}>
                <Trash2 size={20} color="#FF4A8B" strokeWidth={2.5} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuText, styles.dangerText]}>Reset Progress</Text>
                <Text style={styles.menuSubtext}>Delete all data and start over</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.aboutCard}>
            <View style={styles.aboutIcon}>
              <Info size={24} color="#5B4FFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.aboutTitle}>About FlowSpeak</Text>
            <Text style={styles.aboutText}>
              FlowSpeak is a year-long program designed to help people who stutter build
              confidence and improve their speech fluency through evidence-based techniques,
              mindfulness, and consistent practice.
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '700' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500' as const,
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: '#FFD7E0',
  },
  dangerText: {
    color: '#FF4A8B',
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  aboutIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});
