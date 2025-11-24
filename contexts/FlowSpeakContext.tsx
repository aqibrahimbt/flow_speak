import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { YEAR_PROGRAM, type Task } from '@/constants/program';
import type { TaskRating, UserPreferences, TaskSwap } from '@/constants/taskGeneration';
import { 
  generateDailyTasks, 
  getAlternativeTask, 
  getDayOfWeek,
  createDailyInsight,
  getQuarterForDay
} from '@/constants/taskGeneration';

export interface CompletedTask {
  taskId: string;
  day: number;
  completedAt: number;
  rating?: number;
}

export type MoodType = 'great' | 'good' | 'okay' | 'struggling' | 'difficult';

export interface DayMood {
  day: number;
  mood: MoodType;
  note?: string;
  timestamp: number;
}

export interface UserProgress {
  currentDay: number;
  startDate: number;
  completedTasks: CompletedTask[];
  lastActiveDate: number;
  moods: DayMood[];
  ratings: TaskRating[];
  preferences: UserPreferences;
  swaps: TaskSwap[];
  useAdaptiveTasks: boolean;
}

const STORAGE_KEY = '@flowspeak_progress';

const defaultProgress: UserProgress = {
  currentDay: 1,
  startDate: Date.now(),
  completedTasks: [],
  lastActiveDate: Date.now(),
  moods: [],
  ratings: [],
  preferences: {
    fearedSituations: [],
    availableTimeSlots: [5, 10, 15, 20],
    supportPeople: [],
    fearedWords: [],
    fearedSounds: [],
  },
  swaps: [],
  useAdaptiveTasks: false,
};

export const [FlowSpeakProvider, useFlowSpeak] = createContextHook(() => {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  const progressQuery = useQuery({
    queryKey: ['flowspeak-progress'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
      return defaultProgress;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newProgress: UserProgress) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    },
    onSuccess: (data) => {
      setProgress(data);
    },
  });

  useEffect(() => {
    if (progressQuery.data) {
      setProgress(progressQuery.data);
    }
  }, [progressQuery.data]);

  const allTasks = useMemo(() => {
    const tasks: Task[] = [];
    YEAR_PROGRAM.forEach(day => {
      day.tasks.forEach(task => {
        if (!tasks.find(t => t.id === task.id)) {
          tasks.push(task);
        }
      });
    });
    return tasks;
  }, []);

  const currentDayProgram = useMemo(() => {
    if (!progress.useAdaptiveTasks) {
      return YEAR_PROGRAM.find(p => p.day === progress.currentDay) || YEAR_PROGRAM[0];
    }
    
    const baseProgram = YEAR_PROGRAM.find(p => p.day === progress.currentDay) || YEAR_PROGRAM[0];
    const completedTaskIds = progress.completedTasks
      .slice(-20)
      .map(ct => ct.taskId);
    
    const currentDate = new Date(progress.startDate + (progress.currentDay - 1) * 24 * 60 * 60 * 1000);
    const dayOfWeek = getDayOfWeek(currentDate);
    
    const daySwap = progress.swaps.find(s => s.day === progress.currentDay);
    let tasks: Task[];
    
    if (daySwap) {
      const originalTask = allTasks.find(t => t.id === daySwap.originalTaskId);
      const swappedTask = allTasks.find(t => t.id === daySwap.swappedTaskId);
      
      if (originalTask && swappedTask) {
        tasks = baseProgram.tasks.map(t => 
          t.id === originalTask.id ? swappedTask : t
        );
      } else {
        tasks = baseProgram.tasks;
      }
    } else {
      tasks = generateDailyTasks(
        allTasks,
        progress.currentDay,
        completedTaskIds,
        progress.ratings,
        progress.preferences,
        dayOfWeek
      );
      
      if (tasks.length === 0) {
        tasks = baseProgram.tasks;
      }
    }
    
    return {
      ...baseProgram,
      tasks,
    };
  }, [progress.currentDay, progress.useAdaptiveTasks, progress.ratings, progress.preferences, progress.swaps, progress.completedTasks, progress.startDate, allTasks]);

  const todayCompletedTasks = useMemo(() => {
    return progress.completedTasks.filter(t => t.day === progress.currentDay);
  }, [progress.completedTasks, progress.currentDay]);

  const isTaskCompleted = (taskId: string) => {
    return todayCompletedTasks.some(t => t.taskId === taskId);
  };

  const completeTask = (task: Task) => {
    const newCompletedTask: CompletedTask = {
      taskId: task.id,
      day: progress.currentDay,
      completedAt: Date.now(),
    };

    const updatedProgress: UserProgress = {
      ...progress,
      completedTasks: [...progress.completedTasks, newCompletedTask],
      lastActiveDate: Date.now(),
    };

    saveMutation.mutate(updatedProgress);
  };

  const uncompleteTask = (taskId: string) => {
    const updatedProgress: UserProgress = {
      ...progress,
      completedTasks: progress.completedTasks.filter(
        t => !(t.taskId === taskId && t.day === progress.currentDay)
      ),
      lastActiveDate: Date.now(),
    };

    saveMutation.mutate(updatedProgress);
  };

  const goToNextDay = () => {
    if (progress.currentDay < 365) {
      const updatedProgress: UserProgress = {
        ...progress,
        currentDay: progress.currentDay + 1,
        lastActiveDate: Date.now(),
      };
      saveMutation.mutate(updatedProgress);
    }
  };

  const goToPreviousDay = () => {
    if (progress.currentDay > 1) {
      const updatedProgress: UserProgress = {
        ...progress,
        currentDay: progress.currentDay - 1,
        lastActiveDate: Date.now(),
      };
      saveMutation.mutate(updatedProgress);
    }
  };

  const totalTasksToday = currentDayProgram.tasks.length;
  const completedTasksToday = todayCompletedTasks.length;
  const progressPercentage = totalTasksToday > 0 
    ? (completedTasksToday / totalTasksToday) * 100 
    : 0;

  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = progress.currentDay; i >= 1; i--) {
      const dayTasks = YEAR_PROGRAM.find(p => p.day === i)?.tasks || [];
      const dayCompleted = progress.completedTasks.filter(t => t.day === i);
      
      if (dayCompleted.length === dayTasks.length && dayTasks.length > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [progress.completedTasks, progress.currentDay]);

  const totalCompletedDays = useMemo(() => {
    const completedDays = new Set<number>();
    
    for (let day = 1; day <= progress.currentDay; day++) {
      const dayTasks = YEAR_PROGRAM.find(p => p.day === day)?.tasks || [];
      const dayCompleted = progress.completedTasks.filter(t => t.day === day);
      
      if (dayCompleted.length === dayTasks.length && dayTasks.length > 0) {
        completedDays.add(day);
      }
    }
    
    return completedDays.size;
  }, [progress.completedTasks, progress.currentDay]);

  const logMood = (mood: MoodType, note?: string) => {
    const dayMood: DayMood = {
      day: progress.currentDay,
      mood,
      note,
      timestamp: Date.now(),
    };

    const existingMoodIndex = progress.moods.findIndex(m => m.day === progress.currentDay);
    let updatedMoods: DayMood[];

    if (existingMoodIndex >= 0) {
      updatedMoods = [...progress.moods];
      updatedMoods[existingMoodIndex] = dayMood;
    } else {
      updatedMoods = [...progress.moods, dayMood];
    }

    const updatedProgress: UserProgress = {
      ...progress,
      moods: updatedMoods,
      lastActiveDate: Date.now(),
    };

    saveMutation.mutate(updatedProgress);
  };

  const getTodayMood = () => {
    return progress.moods.find(m => m.day === progress.currentDay);
  };

  const rateTask = (taskId: string, rating: number, note?: string) => {
    const taskRating: TaskRating = {
      taskId,
      day: progress.currentDay,
      rating,
      note,
      timestamp: Date.now(),
    };

    const existingRatingIndex = progress.ratings.findIndex(
      r => r.taskId === taskId && r.day === progress.currentDay
    );
    
    let updatedRatings: TaskRating[];
    if (existingRatingIndex >= 0) {
      updatedRatings = [...progress.ratings];
      updatedRatings[existingRatingIndex] = taskRating;
    } else {
      updatedRatings = [...progress.ratings, taskRating];
    }

    const updatedProgress: UserProgress = {
      ...progress,
      ratings: updatedRatings,
      lastActiveDate: Date.now(),
    };

    saveMutation.mutate(updatedProgress);
  };

  const getTaskRating = (taskId: string): TaskRating | undefined => {
    return progress.ratings.find(r => r.taskId === taskId && r.day === progress.currentDay);
  };

  const swapTask = (originalTaskId: string, reason?: string) => {
    const originalTask = allTasks.find(t => t.id === originalTaskId);
    if (!originalTask) return;

    const usedTaskIds = currentDayProgram.tasks.map(t => t.id);
    const alternativeTask = getAlternativeTask(
      originalTask,
      allTasks,
      progress.currentDay,
      usedTaskIds
    );

    if (!alternativeTask) {
      console.log('No alternative task available');
      return;
    }

    const taskSwap: TaskSwap = {
      originalTaskId,
      swappedTaskId: alternativeTask.id,
      day: progress.currentDay,
      reason,
      timestamp: Date.now(),
    };

    const updatedProgress: UserProgress = {
      ...progress,
      swaps: [...progress.swaps, taskSwap],
      lastActiveDate: Date.now(),
    };

    saveMutation.mutate(updatedProgress);
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    const updatedProgress: UserProgress = {
      ...progress,
      preferences: {
        ...progress.preferences,
        ...preferences,
      },
      lastActiveDate: Date.now(),
    };

    saveMutation.mutate(updatedProgress);
  };

  const toggleAdaptiveTasks = () => {
    const updatedProgress: UserProgress = {
      ...progress,
      useAdaptiveTasks: !progress.useAdaptiveTasks,
      lastActiveDate: Date.now(),
    };

    saveMutation.mutate(updatedProgress);
  };

  const dailyInsight = useMemo(() => {
    return createDailyInsight(progress.ratings, allTasks);
  }, [progress.ratings, allTasks]);

  const currentQuarter = useMemo(() => {
    return getQuarterForDay(progress.currentDay);
  }, [progress.currentDay]);

  return {
    progress,
    currentDayProgram,
    todayCompletedTasks,
    isTaskCompleted,
    completeTask,
    uncompleteTask,
    goToNextDay,
    goToPreviousDay,
    progressPercentage,
    currentStreak,
    totalCompletedDays,
    logMood,
    getTodayMood,
    rateTask,
    getTaskRating,
    swapTask,
    updatePreferences,
    toggleAdaptiveTasks,
    dailyInsight,
    currentQuarter,
    allTasks,
    isLoading: progressQuery.isLoading,
    isSaving: saveMutation.isPending,
  };
});
