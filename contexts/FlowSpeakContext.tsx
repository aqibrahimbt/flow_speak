import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useRef } from 'react';
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

export interface ExtraPractice {
  taskId: string;
  day: number;
  completedAt: number;
}

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
  extraPractice: ExtraPractice[];
  version: number;
}

const STORAGE_KEY = '@flowspeak_progress';
const CURRENT_DATA_VERSION = 1;

const ensureArray = <T,>(value: unknown, fallback: T[]): T[] => {
  return Array.isArray(value) ? (value as T[]) : fallback;
};

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
  extraPractice: [],
  version: CURRENT_DATA_VERSION,
};

const migrateProgress = (stored: unknown): UserProgress => {
  if (!stored || typeof stored !== 'object') {
    return defaultProgress;
  }

  const progress = stored as Partial<UserProgress>;
  const preferences = progress.preferences || defaultProgress.preferences;

  const migrated: UserProgress = {
    ...defaultProgress,
    ...progress,
    preferences: {
      ...defaultProgress.preferences,
      ...preferences,
      fearedSituations: ensureArray(preferences.fearedSituations, []),
      availableTimeSlots: ensureArray(preferences.availableTimeSlots, defaultProgress.preferences.availableTimeSlots),
      supportPeople: ensureArray(preferences.supportPeople, []),
      fearedWords: ensureArray(preferences.fearedWords, []),
      fearedSounds: ensureArray(preferences.fearedSounds, []),
    },
    completedTasks: ensureArray(progress.completedTasks, []),
    moods: ensureArray(progress.moods, []),
    ratings: ensureArray(progress.ratings, []),
    swaps: ensureArray(progress.swaps, []),
    extraPractice: ensureArray(progress.extraPractice, []),
    version: CURRENT_DATA_VERSION,
  };

  return migrated;
};

export const [FlowSpeakProvider, useFlowSpeak] = createContextHook(() => {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const [adaptiveCache, setAdaptiveCache] = useState<Record<number, Task[]>>({});
  const autoAdvanceRef = useRef(false);
  const queryClient = useQueryClient();

  const progressQuery = useQuery({
    queryKey: ['flowspeak-progress'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const migrated = migrateProgress(parsed);
          if ((parsed as { version?: number }).version !== migrated.version) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          }
          return migrated;
        }
        return defaultProgress;
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to load progress');
      }
    },
    retry: 1,
    onError: (error) => {
      setLoadError(error instanceof Error ? error : new Error('Failed to load progress'));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newProgress: UserProgress) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
        return newProgress;
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to save progress');
      }
    },
    onSuccess: (data) => {
      setSaveError(null);
      setProgress(data);
    },
    onError: (error) => {
      setSaveError(error instanceof Error ? error : new Error('Failed to save progress'));
    },
  });

  useEffect(() => {
    if (progressQuery.data) {
      setProgress(progressQuery.data);
      setLoadError(null);
    }
  }, [progressQuery.data]);

  useEffect(() => {
    if (progressQuery.isSuccess) {
      setLoadError(null);
    }
  }, [progressQuery.isSuccess]);

  // Auto-advance day based on calendar time since lastActiveDate
  useEffect(() => {
    if (!progressQuery.isSuccess || saveMutation.isPending) return;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const lastDayIndex = Math.floor(progress.lastActiveDate / dayMs);
    const currentDayIndex = Math.floor(now / dayMs);
    const deltaDays = currentDayIndex - lastDayIndex;

    if (deltaDays > 0 && !autoAdvanceRef.current) {
      autoAdvanceRef.current = true;
      const nextDay = Math.min(365, progress.currentDay + deltaDays);
      const updatedProgress: UserProgress = {
        ...progress,
        currentDay: nextDay,
        lastActiveDate: now,
      };
      setAdaptiveCache({});
      saveMutation.mutate(updatedProgress, {
        onSettled: () => {
          autoAdvanceRef.current = false;
        },
      });
    }
  }, [progress, progressQuery.isSuccess, saveMutation]);

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
    const baseProgram = YEAR_PROGRAM.find(p => p.day === progress.currentDay) || YEAR_PROGRAM[0];

    const cached = progress.useAdaptiveTasks ? adaptiveCache[progress.currentDay] : undefined;
    let tasks = cached || baseProgram.tasks;

    const daySwap = progress.swaps.find(s => s.day === progress.currentDay);
    if (daySwap) {
      const originalTask = allTasks.find(t => t.id === daySwap.originalTaskId);
      const swappedTask = allTasks.find(t => t.id === daySwap.swappedTaskId);
      if (originalTask && swappedTask) {
        tasks = tasks.map(t => (t.id === originalTask.id ? swappedTask : t));
      }
    }

    return {
      ...baseProgram,
      tasks,
    };
  }, [progress.currentDay, progress.useAdaptiveTasks, progress.swaps, adaptiveCache, allTasks, progress.startDate]);

  useEffect(() => {
    if (!progress.useAdaptiveTasks) return;
    if (adaptiveCache[progress.currentDay]) return;

    const baseProgram = YEAR_PROGRAM.find(p => p.day === progress.currentDay) || YEAR_PROGRAM[0];
    const completedTaskIds = progress.completedTasks
      .slice(-20)
      .map(ct => ct.taskId);

    const currentDate = new Date(progress.startDate + (progress.currentDay - 1) * 24 * 60 * 60 * 1000);
    const dayOfWeek = getDayOfWeek(currentDate);

    const generated = generateDailyTasks(
      allTasks,
      progress.currentDay,
      completedTaskIds,
      progress.ratings,
      progress.preferences,
      dayOfWeek
    );

    const tasks = generated.length > 0 ? generated : baseProgram.tasks;

    setAdaptiveCache(prev => ({
      ...prev,
      [progress.currentDay]: tasks,
    }));
  }, [
    progress.currentDay,
    progress.useAdaptiveTasks,
    progress.completedTasks,
    progress.ratings,
    progress.preferences,
    progress.startDate,
    allTasks,
    adaptiveCache,
  ]);

  const todayCompletedTasks = useMemo(() => {
    return progress.completedTasks.filter(t => t.day === progress.currentDay);
  }, [progress.completedTasks, progress.currentDay]);

  const isTaskCompleted = (taskId: string) => {
    return todayCompletedTasks.some(t => t.taskId === taskId);
  };

  const completeTask = (task: Task) => {
    if (isTaskCompleted(task.id)) return;

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

  const todayExtraPractice = useMemo(() => {
    return progress.extraPractice.filter(p => p.day === progress.currentDay);
  }, [progress.extraPractice, progress.currentDay]);

  const isExtraPracticeCompleted = (taskId: string) => {
    return todayExtraPractice.some(t => t.taskId === taskId);
  };

  const completeExtraPractice = (task: Task) => {
    if (isExtraPracticeCompleted(task.id)) return;

    const newEntry: ExtraPractice = {
      taskId: task.id,
      day: progress.currentDay,
      completedAt: Date.now(),
    };

    const updatedProgress: UserProgress = {
      ...progress,
      extraPractice: [...progress.extraPractice, newEntry],
      lastActiveDate: Date.now(),
    };

    saveMutation.mutate(updatedProgress);
  };

  const uncompleteExtraPractice = (taskId: string) => {
    const updatedProgress: UserProgress = {
      ...progress,
      extraPractice: progress.extraPractice.filter(
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

  const swapTask = (originalTaskId: string, reason?: string): Task | null => {
    const originalTask = allTasks.find(t => t.id === originalTaskId);
    if (!originalTask) return null;

    const usedTaskIds = currentDayProgram.tasks.map(t => t.id);
    const alternativeTask = getAlternativeTask(
      originalTask,
      allTasks,
      progress.currentDay,
      usedTaskIds
    );

    if (!alternativeTask) {
      console.log('No alternative task available');
      return null;
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

    setAdaptiveCache(prev => ({
      ...prev,
      [progress.currentDay]: (prev[progress.currentDay] || currentDayProgram.tasks).map(t =>
        t.id === originalTask.id ? alternativeTask : t
      ),
    }));

    saveMutation.mutate(updatedProgress);
    return alternativeTask;
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
    return createDailyInsight(progress.ratings, allTasks, progress.moods);
  }, [progress.ratings, allTasks, progress.moods]);

  const currentQuarter = useMemo(() => {
    return getQuarterForDay(progress.currentDay);
  }, [progress.currentDay]);

  return {
    progress,
    currentDayProgram,
    todayCompletedTasks,
    todayExtraPractice,
    isTaskCompleted,
    isExtraPracticeCompleted,
    completeTask,
    completeExtraPractice,
    uncompleteTask,
    uncompleteExtraPractice,
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
    isHydrated: progressQuery.isSuccess,
    isLoading: progressQuery.isLoading,
    isSaving: saveMutation.isPending,
    loadError,
    saveError,
    resetProgress: async () => {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setAdaptiveCache({});
        setProgress(defaultProgress);
        queryClient.removeQueries({ queryKey: ['flowspeak-progress'] });
        queryClient.setQueryData(['flowspeak-progress'], defaultProgress);
      } catch (error) {
        setLoadError(error instanceof Error ? error : new Error('Failed to reset progress'));
      }
    },
  };
});
