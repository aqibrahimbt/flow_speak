import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Pressable } from 'react-native';
import { Flame, Wind, BookOpen, Brain, Dumbbell, CheckCircle2, Circle } from 'lucide-react-native';
import type { Task } from '@/constants/program';
import * as Haptics from 'expo-haptics';
import { palette, typeChips } from '@/constants/colors';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
  onPressCard?: () => void;
}

const typeIcons = {
  breathing: Wind,
  speech: Flame,
  reading: BookOpen,
  mindfulness: Brain,
  exercise: Dumbbell,
};

export default function TaskCard({ task, isCompleted, onToggle, onPressCard }: TaskCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const Icon = typeIcons[task.type];
  const colors = typeChips[task.type];

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: isCompleted ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isCompleted, checkAnim]);

  const handlePress = () => {
    if (onPressCard) {
      onPressCard();
      return;
    }
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
      <Pressable
        style={[
          styles.card,
          { backgroundColor: colors.bg, borderColor: isCompleted ? colors.ring : '#1F2639', shadowColor: colors.ring },
          isCompleted && styles.completedCard,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.ring }]}>
            <Icon size={20} color="#fff" strokeWidth={2.5} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={[styles.duration, { color: palette.subtleText }]}>{task.duration} min • {task.type}</Text>
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              onToggle();
            }}
            hitSlop={8}
          >
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              {isCompleted ? (
                <CheckCircle2 size={28} color={colors.ring} strokeWidth={2.5} fill={colors.ring} />
              ) : (
                <Circle size={28} color={colors.ring} strokeWidth={2.5} />
              )}
            </Animated.View>
          </Pressable>
        </View>
        <Text style={styles.description} numberOfLines={2}>{task.description}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    backgroundColor: palette.card,
  },
  completedCard: {
    opacity: 0.9,
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
    color: palette.text,
  },
  duration: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  description: {
    fontSize: 13,
    color: palette.subtleText,
    lineHeight: 20,
  },
});
