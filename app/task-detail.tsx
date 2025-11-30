import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Circle, Star, RefreshCw, Lightbulb, Info } from 'lucide-react-native';
import { useFlowSpeak } from '@/contexts/FlowSpeakContext';
import * as Haptics from 'expo-haptics';
import { palette } from '@/constants/colors';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { day: dayParam } = useLocalSearchParams<{ day?: string }>();
  const {
    currentDayProgram,
    isTaskCompleted,
    completeTask,
    uncompleteTask,
    rateTask,
    getTaskRating,
    swapTask,
    isLoading,
    isHydrated,
    loadError,
    allTasks,
    progress,
  } = useFlowSpeak();

  if (loadError) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Couldn&apos;t load the task</Text>
        <Text style={styles.loadingSubtitle}>{loadError.message}</Text>
      </SafeAreaView>
    );
  }

  if (isLoading || !isHydrated) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Loading task...</Text>
      </SafeAreaView>
    );
  }

  const targetDay = dayParam ? Number(dayParam) : progress.currentDay;
  const taskFromCurrentDay = currentDayProgram.tasks.find(t => t.id === taskId);
  const initialTask = taskFromCurrentDay || allTasks.find(t => t.id === taskId);
  const isCurrentDay = targetDay === progress.currentDay;
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingNote, setRatingNote] = useState('');
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);
  const [activeTask, setActiveTask] = useState(initialTask);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState((initialTask?.duration || 0) * 60);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const existingRating = getTaskRating(taskId || '');

  useEffect(() => {
    setActiveTask(initialTask);
    setCompletedSteps(new Set());
    setSwapSuccess(false);
    setTimerSeconds((initialTask?.duration || 0) * 60);
    setTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [initialTask?.id]);

  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [timerActive]);

  if (!activeTask) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Task Not Found' }} />
        <Text style={{ color: palette.text }}>Task not found</Text>
      </View>
    );
  }

  const completed = isCurrentDay && isTaskCompleted(activeTask.id);

  const typeColors = {
    breathing: { bg: '#0F2437', primary: '#6CC9FF', dark: '#2F9BFF' },
    speech: { bg: '#2A1B2B', primary: '#FF8BC2', dark: '#FF5F8C' },
    reading: { bg: '#1F1B2F', primary: '#C5A6FF', dark: '#9C7CFF' },
    mindfulness: { bg: '#1B2A25', primary: '#9AE6C5', dark: '#4CE5B1' },
    exercise: { bg: '#2B2315', primary: '#FFC857', dark: '#FF9F43' },
  };

  const colors = typeColors[activeTask.type];
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (!isCurrentDay) return;
    if (completed) {
      uncompleteTask(activeTask.id);
    } else {
      completeTask(activeTask);
      setShowRating(true);
    }
  };

  const handleRatingSubmit = () => {
    if (selectedRating > 0 && isCurrentDay) {
      rateTask(activeTask.id, selectedRating, ratingNote || undefined);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowRating(false);
      router.back();
    }
  };

  const handleSkipRating = () => {
    setShowRating(false);
    router.back();
  };

  const handleSwap = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (isCurrentDay) {
      const swapped = swapTask(activeTask.id, 'User requested swap');
      if (swapped) {
        setActiveTask(swapped);
        setSwapSuccess(true);
        setCompletedSteps(new Set());
      }
    }
  };

  const toggleStepCompleted = (idx: number) => {
    const next = new Set(completedSteps);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setCompletedSteps(next);
    setCurrentStep(idx);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: activeTask.title,
          headerStyle: { backgroundColor: palette.bg },
          headerTintColor: palette.text,
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />
      <LinearGradient
        colors={[colors.primary, colors.dark]}
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
          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: palette.text }]}>
                  {activeTask.title}
                </Text>
                <Text style={[styles.duration, { color: palette.subtleText }]}>{activeTask.duration} minutes • {activeTask.type}</Text>
                {!isCurrentDay && (
                  <Text style={styles.readOnlyNote}>Preview only — this task is scheduled for day {targetDay}.</Text>
                )}
              </View>
            </View>
            <Text style={[styles.description, { color: palette.subtleText }]}>{activeTask.description}</Text>
            {swapSuccess && (
              <Text style={styles.swapSuccess}>Task swapped. You’re viewing the replacement.</Text>
            )}
          </View>

          {activeTask.whyItMatters && (
            <View style={[styles.infoCard, { backgroundColor: palette.panel, borderColor: colors.primary }]}>
              <View style={styles.infoHeader}>
                <Info size={20} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.infoTitle, { color: palette.text }]}>Why this matters</Text>
              </View>
              <Text style={[styles.infoText, { color: palette.subtleText }]}>{activeTask.whyItMatters}</Text>
            </View>
          )}

          {activeTask.tips && activeTask.tips.length > 0 && (
            <View style={[styles.infoCard, { backgroundColor: palette.panel, borderColor: colors.primary }]}>
              <View style={styles.infoHeader}>
                <Lightbulb size={20} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.infoTitle, { color: palette.text }]}>Tips for success</Text>
              </View>
              {activeTask.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
                  <Text style={[styles.tipText, { color: palette.subtleText }]}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            {activeTask.instructions.map((instruction, index) => {
              const done = completedSteps.has(index);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.instructionItem,
                    currentStep === index && [
                      styles.instructionItemActive,
                      { borderColor: colors.primary },
                    ],
                    done && styles.instructionItemDone,
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    toggleStepCompleted(index);
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.stepNumber,
                      currentStep === index && [
                        styles.stepNumberActive,
                        { backgroundColor: colors.primary },
                      ],
                      done && { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumberText,
                        (currentStep === index || done) && styles.stepNumberTextActive,
                      ]}
                    >
                      {done ? '✓' : index + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.instructionText,
                      (currentStep === index || done) && styles.instructionTextActive,
                    ]}
                  >
                    {instruction}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!completed && isCurrentDay && (
            <TouchableOpacity
              style={[styles.swapButton, { borderColor: colors.primary }]}
              onPress={() => setShowSwapConfirm(true)}
              activeOpacity={0.8}
            >
              <RefreshCw size={20} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.swapButtonText, { color: colors.primary }]}>
                Swap for different task
              </Text>
            </TouchableOpacity>
          )}

          {showSwapConfirm && isCurrentDay && (
            <View style={styles.swapConfirm}>
              <Text style={styles.swapConfirmText}>
                This will replace this task with a similar one. Continue?
              </Text>
              <View style={styles.swapConfirmButtons}>
                <TouchableOpacity
                  style={[styles.swapConfirmButton, styles.swapCancelButton]}
                  onPress={() => setShowSwapConfirm(false)}
                >
                  <Text style={styles.swapCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.swapConfirmButton, { backgroundColor: colors.primary }]}
                  onPress={handleSwap}
                >
                  <Text style={styles.swapConfirmButtonText}>Swap Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!showRating && isCurrentDay && (
            <TouchableOpacity
              style={[
                styles.completeButton,
                { backgroundColor: colors.primary },
                completed && styles.completeButtonDone,
              ]}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              {completed ? (
                <CheckCircle2 size={24} color="#fff" strokeWidth={2.5} />
              ) : (
                <Circle size={24} color="#fff" strokeWidth={2.5} />
              )}
              <Text style={styles.completeButtonText}>
                {completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              </Text>
            </TouchableOpacity>
          )}

          {showRating && isCurrentDay && (
            <View style={styles.ratingCard}>
              <Text style={styles.ratingTitle}>How did that feel?</Text>
              <Text style={styles.ratingSubtitle}>Rate your comfort level</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setSelectedRating(rating);
                    }}
                    style={styles.ratingStar}
                  >
                    <Star
                      size={40}
                      color={rating <= selectedRating ? colors.primary : palette.border}
                      fill={rating <= selectedRating ? colors.primary : 'transparent'}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.ratingLabels}>
                <Text style={styles.ratingLabelText}>Struggling</Text>
                <Text style={styles.ratingLabelText}>Great!</Text>
              </View>
              <TextInput
                style={styles.ratingInput}
                placeholder="Add a note (optional)..."
                placeholderTextColor={palette.subtleText}
                value={ratingNote}
                onChangeText={setRatingNote}
                multiline
                numberOfLines={3}
              />
              <View style={styles.ratingButtons}>
                <TouchableOpacity
                  style={styles.ratingSkipButton}
                  onPress={handleSkipRating}
                >
                  <Text style={styles.ratingSkipText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.ratingSubmitButton,
                    { backgroundColor: colors.primary },
                    selectedRating === 0 && styles.ratingSubmitButtonDisabled,
                  ]}
                  onPress={handleRatingSubmit}
                  disabled={selectedRating === 0}
                >
                  <Text style={styles.ratingSubmitText}>Submit Rating</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {existingRating && !showRating && (
            <View style={styles.existingRating}>
              <Text style={styles.existingRatingLabel}>Your rating:</Text>
              <View style={styles.existingRatingStars}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    size={20}
                    color={rating <= existingRating.rating ? colors.primary : palette.border}
                    fill={rating <= existingRating.rating ? colors.primary : 'transparent'}
                    strokeWidth={2}
                  />
                ))}
              </View>
              {existingRating.note && (
                <Text style={styles.existingRatingNote}>{existingRating.note}</Text>
              )}
            </View>
          )}

          {activeTask.duration > 0 && (
            <View style={styles.timerCard}>
              <Text style={styles.timerTitle}>Session Timer</Text>
              <Text style={styles.timerValue}>{formatTime(timerSeconds)}</Text>
              <View style={styles.timerButtons}>
                <TouchableOpacity
                  style={[styles.timerButton, timerActive && styles.timerButtonActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setTimerActive(!timerActive);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.timerButtonText}>{timerActive ? 'Pause' : 'Start'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timerButton}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setTimerActive(false);
                    setTimerSeconds((activeTask.duration || 0) * 60);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.timerButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  duration: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  swapSuccess: {
    marginTop: 8,
    color: palette.accent,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  readOnlyNote: {
    marginTop: 4,
    fontSize: 12,
    color: palette.mutedText,
    fontWeight: '600' as const,
  },
  instructionsCard: {
    backgroundColor: palette.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: palette.text,
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    backgroundColor: palette.mutedPanel,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  instructionItemDone: {
    opacity: 0.65,
  },
  instructionItemActive: {
    backgroundColor: palette.card,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumberActive: {
    backgroundColor: palette.accent,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: palette.subtleText,
  },
  stepNumberTextActive: {
    color: palette.text,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: palette.subtleText,
    lineHeight: 22,
  },
  instructionTextActive: {
    color: palette.text,
    fontWeight: '600' as const,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  completeButtonDone: {
    opacity: 0.7,
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  bottomPadding: {
    height: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  infoText: {
    fontSize: 14,
    color: palette.subtleText,
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  tipBullet: {
    fontSize: 16,
    color: palette.subtleText,
    marginRight: 8,
    marginTop: -2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: palette.subtleText,
    lineHeight: 20,
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    backgroundColor: palette.card,
    marginBottom: 12,
    borderWidth: 2,
  },
  swapButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  swapConfirm: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  swapConfirmText: {
    fontSize: 14,
    color: palette.subtleText,
    marginBottom: 16,
    lineHeight: 20,
  },
  swapConfirmButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  swapConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  swapCancelButton: {
    backgroundColor: palette.mutedPanel,
  },
  swapCancelText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: palette.subtleText,
  },
  swapConfirmButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  ratingCard: {
    backgroundColor: palette.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  ratingTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: palette.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  ratingSubtitle: {
    fontSize: 14,
    color: palette.subtleText,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingStar: {
    padding: 4,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  ratingLabelText: {
    fontSize: 12,
    color: palette.subtleText,
    fontWeight: '600' as const,
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: palette.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingSkipButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: palette.mutedPanel,
  },
  ratingSkipText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: palette.subtleText,
  },
  ratingSubmitButton: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  ratingSubmitButtonDisabled: {
    opacity: 0.5,
  },
  ratingSubmitText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  existingRating: {
    backgroundColor: palette.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  existingRatingLabel: {
    fontSize: 13,
    color: palette.subtleText,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  existingRatingStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  existingRatingNote: {
    fontSize: 14,
    color: palette.subtleText,
    lineHeight: 20,
    marginTop: 4,
  },
  timerCard: {
    backgroundColor: palette.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    marginTop: 12,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: palette.text,
    marginBottom: 6,
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: palette.text,
    marginBottom: 10,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  timerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: palette.mutedPanel,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  timerButtonActive: {
    backgroundColor: palette.accent,
  },
  timerButtonText: {
    color: palette.text,
    fontWeight: '700' as const,
  },
});
