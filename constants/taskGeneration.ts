import { Task, TaskType, TaskDifficulty, DayOfWeek } from './program';

export interface TaskRating {
  taskId: string;
  day: number;
  rating: number;
  timestamp: number;
  note?: string;
}

export interface UserPreferences {
  fearedSituations: string[];
  availableTimeSlots: number[];
  supportPeople: string[];
  fearedWords: string[];
  fearedSounds: string[];
}

export interface TaskSwap {
  originalTaskId: string;
  swappedTaskId: string;
  day: number;
  reason?: string;
  timestamp: number;
}

const dayOfWeekRotation: Record<DayOfWeek, TaskType> = {
  'Monday': 'breathing',
  'Tuesday': 'speech',
  'Wednesday': 'reading',
  'Thursday': 'mindfulness',
  'Friday': 'exercise',
  'Saturday': 'speech',
  'Sunday': 'mindfulness',
};

export const getDayOfWeek = (date: Date): DayOfWeek => {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

export const getQuarterForDay = (day: number): number => {
  if (day <= 90) return 1;
  if (day <= 180) return 2;
  if (day <= 270) return 3;
  return 4;
};

export const calculateAverageDifficultyComfort = (ratings: TaskRating[], allTasks: Task[]): TaskDifficulty => {
  if (ratings.length === 0) return 'beginner';
  
  const last10Ratings = ratings.slice(-10);
  const avgRating = last10Ratings.reduce((sum, r) => sum + r.rating, 0) / last10Ratings.length;
  
  const ratedTaskDifficulties = last10Ratings
    .map(r => allTasks.find(t => t.id === r.taskId)?.difficulty)
    .filter(Boolean) as TaskDifficulty[];
  
  if (avgRating >= 4.5 && ratedTaskDifficulties.some(d => d === 'expert')) return 'expert';
  if (avgRating >= 4) return 'hard';
  if (avgRating >= 3.5) return 'medium';
  if (avgRating >= 2.5) return 'easy';
  return 'beginner';
};

export const shouldIncreaseDifficulty = (ratings: TaskRating[]): boolean => {
  const recent = ratings.slice(-5);
  if (recent.length < 3) return false;
  const avgRating = recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
  return avgRating >= 4;
};

export const shouldDecreaseDifficulty = (ratings: TaskRating[]): boolean => {
  const recent = ratings.slice(-5);
  if (recent.length < 3) return false;
  const avgRating = recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
  return avgRating < 2.5;
};

export const filterTasksByQuarter = (tasks: Task[], quarter: number): Task[] => {
  return tasks.filter(task => 
    !task.quarter || task.quarter <= quarter
  );
};

export const filterTasksByDifficulty = (
  tasks: Task[], 
  targetDifficulty: TaskDifficulty,
  allowRange: boolean = true
): Task[] => {
  if (!allowRange) {
    return tasks.filter(task => task.difficulty === targetDifficulty);
  }
  
  const difficultyOrder: TaskDifficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
  const targetIndex = difficultyOrder.indexOf(targetDifficulty);
  
  const minIndex = Math.max(0, targetIndex - 1);
  const maxIndex = Math.min(difficultyOrder.length - 1, targetIndex + 1);
  
  const allowedDifficulties = difficultyOrder.slice(minIndex, maxIndex + 1);
  
  return tasks.filter(task => 
    !task.difficulty || allowedDifficulties.includes(task.difficulty)
  );
};

export const filterTasksByPreferences = (tasks: Task[], preferences: UserPreferences): Task[] => {
  return tasks.filter(task => {
    if (preferences.availableTimeSlots.length > 0) {
      if (!preferences.availableTimeSlots.includes(task.duration) && 
          !preferences.availableTimeSlots.some(slot => slot >= task.duration)) {
        return false;
      }
    }
    return true;
  });
};

export const avoidRecentTasks = (tasks: Task[], recentTaskIds: string[]): Task[] => {
  const recent5 = recentTaskIds.slice(-5);
  return tasks.filter(task => !recent5.includes(task.id));
};

export const selectRandomTask = (tasks: Task[]): Task | null => {
  if (tasks.length === 0) return null;
  return tasks[Math.floor(Math.random() * tasks.length)];
};

export const selectByDayOfWeek = (
  tasks: Task[], 
  dayOfWeek: DayOfWeek, 
  preferredType?: TaskType
): Task | null => {
  const type = preferredType || dayOfWeekRotation[dayOfWeek];
  const filtered = tasks.filter(task => task.type === type);
  return selectRandomTask(filtered);
};

export const generateDailyTasks = (
  allTasks: Task[],
  day: number,
  completedTaskIds: string[],
  ratings: TaskRating[],
  preferences: UserPreferences,
  dayOfWeek: DayOfWeek
): Task[] => {
  const quarter = getQuarterForDay(day);
  const targetDifficulty = calculateAverageDifficultyComfort(ratings, allTasks);
  
  let availableTasks = filterTasksByQuarter(allTasks, quarter);
  availableTasks = filterTasksByDifficulty(availableTasks, targetDifficulty);
  availableTasks = filterTasksByPreferences(availableTasks, preferences);
  availableTasks = avoidRecentTasks(availableTasks, completedTaskIds);
  
  const selectedTasks: Task[] = [];
  
  const coreTask = selectByDayOfWeek(availableTasks, dayOfWeek);
  if (coreTask) {
    selectedTasks.push(coreTask);
    availableTasks = availableTasks.filter(t => t.id !== coreTask.id);
  }
  
  const breathingTasks = availableTasks.filter(t => t.type === 'breathing');
  const breathingTask = selectRandomTask(breathingTasks);
  if (breathingTask && !selectedTasks.find(t => t.id === breathingTask.id)) {
    selectedTasks.push(breathingTask);
    availableTasks = availableTasks.filter(t => t.id !== breathingTask.id);
  }
  
  const bonus1 = selectRandomTask(availableTasks);
  if (bonus1) {
    selectedTasks.push(bonus1);
    availableTasks = availableTasks.filter(t => t.id !== bonus1.id);
  }
  
  if (day % 7 === 0) {
    const wildcard = selectRandomTask(allTasks.filter(t => 
      !selectedTasks.find(st => st.id === t.id) &&
      filterTasksByQuarter([t], quarter).length > 0
    ));
    if (wildcard) {
      selectedTasks.push(wildcard);
    }
  }
  
  return selectedTasks;
};

export const getAlternativeTask = (
  currentTask: Task,
  allTasks: Task[],
  day: number,
  alreadyUsedTaskIds: string[]
): Task | null => {
  const quarter = getQuarterForDay(day);
  
  let alternatives = allTasks.filter(task => 
    task.id !== currentTask.id &&
    task.title !== currentTask.title &&
    task.type === currentTask.type &&
    !alreadyUsedTaskIds.includes(task.id)
  );
  
  alternatives = filterTasksByQuarter(alternatives, quarter);
  
  if (currentTask.difficulty) {
    const sameDifficulty = alternatives.filter(t => t.difficulty === currentTask.difficulty);
    if (sameDifficulty.length > 0) {
      alternatives = sameDifficulty;
    }
  }
  
  return selectRandomTask(alternatives);
};

export const createDailyInsight = (
  ratings: TaskRating[],
  tasks: Task[],
  moods: { day: number; mood: string }[]
): string => {
  const recentRatings = ratings.slice(-7);
  const recentMoods = moods.slice(-7);

  const avgRating = recentRatings.length
    ? recentRatings.reduce((sum, r) => sum + r.rating, 0) / recentRatings.length
    : null;

  const moodScore = (mood: string) => {
    switch (mood) {
      case 'great': return 5;
      case 'good': return 4;
      case 'okay': return 3;
      case 'struggling': return 2;
      case 'difficult': return 1;
      default: return 3;
    }
  };

  const avgMood = recentMoods.length
    ? recentMoods.reduce((sum, m) => sum + moodScore(m.mood), 0) / recentMoods.length
    : null;

  const typeAverages: Record<string, number> = {};
  recentRatings.forEach(r => {
    const task = tasks.find(t => t.id === r.taskId);
    if (task) {
      typeAverages[task.type] = (typeAverages[task.type] || 0) + r.rating;
    }
  });
  Object.keys(typeAverages).forEach(key => {
    const count = recentRatings.filter(r => tasks.find(t => t.id === r.taskId)?.type === key).length;
    if (count > 0) typeAverages[key] = typeAverages[key] / count;
  });

  const bestType = Object.entries(typeAverages).sort((a, b) => b[1] - a[1])[0];
  const bestTypeText = bestType ? `Your ${bestType[0]} tasks feel strongest lately.` : null;

  if (!avgRating && !avgMood) {
    return "You're just getting started. Focus on building consistency.";
  }

  let moodText = '';
  if (avgMood !== null) {
    if (avgMood >= 4.5) moodText = 'Mood is high—bottle this confidence.';
    else if (avgMood >= 3.5) moodText = 'Mood is steady—keep the routines going.';
    else if (avgMood >= 2.5) moodText = 'Some rough patches—pace yourself and stay curious.';
    else moodText = 'Tough week—double down on breathing and gentle starts.';
  }

  let ratingText = '';
  if (avgRating !== null) {
    if (avgRating >= 4.5) ratingText = 'Technique feels easy—ready for bigger challenges.';
    else if (avgRating >= 3.5) ratingText = 'Solid progress—stay with the plan and exposures.';
    else if (avgRating >= 2.5) ratingText = 'Mixed results—focus on one tool per task.';
    else ratingText = 'Hard stretch—slow down, use pull-outs, and lower pressure.';
  }

  const parts = [ratingText, moodText, bestTypeText].filter(Boolean);
  return parts.join(' ');
};
