import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Circle, Star, RefreshCw, Lightbulb, Info } from 'lucide-react-native';
import { useFlowSpeak } from '@/contexts/FlowSpeakContext';
import * as Haptics from 'expo-haptics';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const {
    currentDayProgram,
    isTaskCompleted,
    completeTask,
    uncompleteTask,
    rateTask,
    getTaskRating,
    swapTask,
  } = useFlowSpeak();

  const task = currentDayProgram.tasks.find(t => t.id === taskId);
  const [currentStep, setCurrentStep] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingNote, setRatingNote] = useState('');
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);

  const existingRating = getTaskRating(taskId || '');

  if (!task) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Task Not Found' }} />
        <Text>Task not found</Text>
      </View>
    );
  }

  const completed = isTaskCompleted(task.id);

  const typeColors = {
    breathing: { bg: '#E8F5FF', primary: '#4AC7FF', dark: '#0891D1' },
    speech: { bg: '#FFE8F0', primary: '#FF4A8B', dark: '#D10854' },
    reading: { bg: '#F0E8FF', primary: '#A64AFF', dark: '#7108D1' },
    mindfulness: { bg: '#E8FFF0', primary: '#4AFFAA', dark: '#08D171' },
    exercise: { bg: '#FFF8E8', primary: '#FFB84A', dark: '#D17108' },
  };

  const colors = typeColors[task.type];

  const handleComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (completed) {
      uncompleteTask(task.id);
    } else {
      completeTask(task);
      setShowRating(true);
    }
  };

  const handleRatingSubmit = () => {
    if (selectedRating > 0) {
      rateTask(task.id, selectedRating, ratingNote || undefined);
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
    swapTask(task.id, 'User requested swap');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: task.title,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
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
          <View style={[styles.card, { backgroundColor: colors.bg }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.dark }]}>
                  {task.title}
                </Text>
                <Text style={styles.duration}>{task.duration} minutes</Text>
              </View>
            </View>
            <Text style={styles.description}>{task.description}</Text>
          </View>

          {task.whyItMatters && (
            <View style={[styles.infoCard, { backgroundColor: '#FFF9E8', borderColor: colors.primary }]}>
              <View style={styles.infoHeader}>
                <Info size={20} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.infoTitle, { color: colors.dark }]}>Why This Matters</Text>
              </View>
              <Text style={styles.infoText}>{task.whyItMatters}</Text>
            </View>
          )}

          {task.tips && task.tips.length > 0 && (
            <View style={[styles.infoCard, { backgroundColor: '#E8F9FF', borderColor: colors.primary }]}>
              <View style={styles.infoHeader}>
                <Lightbulb size={20} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.infoTitle, { color: colors.dark }]}>Tips for Success</Text>
              </View>
              {task.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            {task.instructions.map((instruction, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.instructionItem,
                  currentStep === index && [
                    styles.instructionItemActive,
                    { borderColor: colors.primary },
                  ],
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setCurrentStep(index);
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
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumberText,
                      currentStep === index && styles.stepNumberTextActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.instructionText,
                    currentStep === index && styles.instructionTextActive,
                  ]}
                >
                  {instruction}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!completed && (
            <TouchableOpacity
              style={styles.swapButton}
              onPress={() => setShowSwapConfirm(true)}
              activeOpacity={0.8}
            >
              <RefreshCw size={20} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.swapButtonText, { color: colors.primary }]}>
                Swap for Different Task
              </Text>
            </TouchableOpacity>
          )}

          {showSwapConfirm && (
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

          {!showRating && (
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

          {showRating && (
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
                      color={rating <= selectedRating ? colors.primary : '#E8E8E8'}
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
                placeholderTextColor="#999"
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
                    color={rating <= existingRating.rating ? colors.primary : '#E8E8E8'}
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
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
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
    color: '#888',
    fontWeight: '600' as const,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  instructionItemActive: {
    backgroundColor: '#fff',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumberActive: {
    backgroundColor: '#FF4A8B',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#999',
  },
  stepNumberTextActive: {
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  instructionTextActive: {
    color: '#1a1a1a',
    fontWeight: '600' as const,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 10,
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
    color: '#555',
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  tipBullet: {
    fontSize: 16,
    color: '#555',
    marginRight: 8,
    marginTop: -2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  swapButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  swapConfirm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  swapConfirmText: {
    fontSize: 14,
    color: '#555',
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
    backgroundColor: '#f8f8f8',
  },
  swapCancelText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#666',
  },
  swapConfirmButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  ratingSubtitle: {
    fontSize: 14,
    color: '#888',
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
    color: '#999',
    fontWeight: '600' as const,
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
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
    backgroundColor: '#f8f8f8',
  },
  ratingSkipText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#666',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  existingRatingLabel: {
    fontSize: 13,
    color: '#888',
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
    color: '#555',
    lineHeight: 20,
    marginTop: 4,
  },
});
