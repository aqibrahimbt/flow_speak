import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Flame, Wind, BookOpen, Brain, Dumbbell, CheckCircle2, Circle } from 'lucide-react-native';
import type { Task } from '@/constants/program';
import * as Haptics from 'expo-haptics';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
}

const typeIcons = {
  breathing: Wind,
  speech: Flame,
  reading: BookOpen,
  mindfulness: Brain,
  exercise: Dumbbell,
};

const typeColors = {
  breathing: { bg: '#E8F5FF', border: '#4AC7FF', text: '#0891D1' },
  speech: { bg: '#FFE8F0', border: '#FF4A8B', text: '#D10854' },
  reading: { bg: '#F0E8FF', border: '#A64AFF', text: '#7108D1' },
  mindfulness: { bg: '#E8FFF0', border: '#4AFFAA', text: '#08D171' },
  exercise: { bg: '#FFF8E8', border: '#FFB84A', text: '#D17108' },
};

export default function TaskCard({ task, isCompleted, onToggle }: TaskCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const Icon = typeIcons[task.type];
  const colors = typeColors[task.type];

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: isCompleted ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isCompleted, checkAnim]);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle();
  };

  const checkScale = checkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.1, 1],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.bg, borderColor: colors.border },
          isCompleted && styles.completedCard,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.border }]}>
            <Icon size={20} color="#fff" strokeWidth={2.5} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
            <Text style={styles.duration}>{task.duration} min</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            {isCompleted ? (
              <CheckCircle2 size={28} color={colors.border} strokeWidth={2.5} fill={colors.border} />
            ) : (
              <Circle size={28} color={colors.border} strokeWidth={2.5} />
            )}
          </Animated.View>
        </View>
        <Text style={styles.description}>{task.description}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
  },
  completedCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  duration: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500' as const,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
