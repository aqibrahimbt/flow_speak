export type TaskType = 'breathing' | 'speech' | 'reading' | 'mindfulness' | 'exercise';
export type TaskDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
export type TaskSetting = 'private' | 'trusted_person' | 'small_group' | 'public';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  duration: number;
  instructions: string[];
  difficulty?: TaskDifficulty;
  quarter?: number;
  setting?: TaskSetting;
  tags?: string[];
  whyItMatters?: string;
  tips?: string[];
}

export interface DayProgram {
  day: number;
  phase: string;
  focus: string;
  tasks: Task[];
}

const createTask = (
  id: string,
  title: string,
  description: string,
  type: TaskType,
  duration: number,
  instructions: string[],
  metadata?: Partial<Pick<Task, 'difficulty' | 'quarter' | 'setting' | 'tags' | 'whyItMatters' | 'tips'>>
): Task => ({
  id,
  title,
  description,
  type,
  duration,
  instructions,
  ...metadata,
});

const phases = [
  { name: 'Foundation', days: 90, focus: 'Building awareness and breathing' },
  { name: 'Technique', days: 90, focus: 'Speech techniques and control' },
  { name: 'Practice', days: 90, focus: 'Real-world application' },
  { name: 'Mastery', days: 95, focus: 'Confidence and fluency' },
];

const taskPool = {
  breathing: [
    createTask(
      'breath-1',
      'Diaphragmatic Breathing',
      'Deep belly breathing to reduce tension',
      'breathing',
      5,
      [
        'Sit or lie down comfortably',
        'Place one hand on your chest, one on your belly',
        'Breathe in slowly through your nose for 4 counts',
        'Feel your belly rise while chest stays still',
        'Exhale slowly through your mouth for 6 counts',
        'Repeat for 5 minutes',
      ],
      {
        difficulty: 'beginner',
        quarter: 1,
        setting: 'private',
        tags: ['breathing', 'relaxation', 'foundation'],
        whyItMatters: 'Proper breathing is the foundation of fluent speech and reduces physical tension',
        tips: ['Practice lying down first to feel the movement', 'Place a book on your belly to see it rise']
      }
    ),
    createTask(
      'breath-2',
      'Box Breathing',
      'Structured breathing for calm and focus',
      'breathing',
      5,
      [
        'Breathe in for 4 counts',
        'Hold for 4 counts',
        'Breathe out for 4 counts',
        'Hold for 4 counts',
        'Repeat the cycle 5-10 times',
      ],
      {
        difficulty: 'easy',
        quarter: 1,
        setting: 'private',
        tags: ['breathing', 'focus', 'anxiety-relief'],
        whyItMatters: 'Box breathing calms the nervous system before speaking situations',
        tips: ['Use this before phone calls or meetings', 'Visualize tracing a square']
      }
    ),
    createTask(
      'breath-3',
      'Prolonged Exhalation',
      'Extend your breath for speech control',
      'breathing',
      5,
      [
        'Breathe in normally for 3 counts',
        'Exhale slowly and steadily for 8-10 counts',
        'Focus on smooth, controlled air release',
        'Repeat 10 times',
      ],
      {
        difficulty: 'easy',
        quarter: 1,
        setting: 'private',
        tags: ['breathing', 'speech-preparation', 'control'],
        whyItMatters: 'Controlled exhalation powers smooth, sustained speech',
        tips: ['Try exhaling on an "sss" sound', 'Imagine your breath is a stream']
      }
    ),
  ],
  speech: [
    createTask(
      'speech-1',
      'Easy Onset',
      'Start words gently and smoothly',
      'speech',
      10,
      [
        'Choose 5 words starting with vowels (e.g., "apple", "open")',
        'Take a breath before each word',
        'Start the word very gently, like a whisper',
        'Gradually increase volume',
        'Practice each word 5 times',
      ],
      {
        difficulty: 'easy',
        quarter: 1,
        setting: 'private',
        tags: ['speech-technique', 'easy-onset', 'vowels'],
        whyItMatters: 'Easy onset prevents hard vocal cord closure, reducing blocks',
        tips: ['Start with "ahhh" and transition to the word', 'Think of breathing out the word']
      }
    ),
    createTask(
      'speech-2',
      'Light Articulatory Contact',
      'Reduce tension in speech muscles',
      'speech',
      10,
      [
        'Practice words with p, b, t, d, k, g sounds',
        'Touch your lips/tongue very lightly',
        'Avoid pressing hard',
        'Say each word slowly: "paper", "table", "good"',
        'Repeat 10 times each',
      ],
      {
        difficulty: 'medium',
        quarter: 2,
        setting: 'private',
        tags: ['speech-technique', 'articulation', 'tension-reduction'],
        whyItMatters: 'Light contact reduces muscle tension that can trigger stuttering',
        tips: ['Imagine your tongue is a feather', 'Practice in slow motion first']
      }
    ),
    createTask(
      'speech-3',
      'Stretched Speech',
      'Slow, continuous speaking',
      'speech',
      10,
      [
        'Choose a simple sentence',
        'Say it very slowly, stretching each word',
        'Keep sound flowing between words',
        'Gradually speed up while maintaining smoothness',
        'Practice 3 sentences',
      ],
      {
        difficulty: 'medium',
        quarter: 2,
        setting: 'private',
        tags: ['speech-technique', 'fluency-shaping', 'continuous-speech'],
        whyItMatters: 'Stretched speech trains smooth transitions between words',
        tips: ['Start very slow - slower than feels natural', 'Connect words like beads on a string']
      }
    ),
    createTask(
      'speech-4',
      'Pausing Practice',
      'Strategic pauses for control',
      'speech',
      10,
      [
        'Read a short paragraph',
        'Deliberately pause after each phrase',
        'Use pauses to breathe and reset',
        'Don\'t rush to fill silence',
        'Practice for 10 minutes',
      ],
      {
        difficulty: 'medium',
        quarter: 2,
        setting: 'private',
        tags: ['speech-technique', 'pausing', 'control'],
        whyItMatters: 'Strategic pausing gives you time to prepare and reduces rush',
        tips: ['Pauses make you sound more confident', 'Count to 2 in your head during pauses']
      }
    ),
    createTask(
      'speech-5',
      'Voluntary Stuttering',
      'Intentionally stutter to reduce fear',
      'speech',
      15,
      [
        'Choose 3 easy words',
        'Intentionally repeat the first sound 2-3 times',
        'Do this calmly and with control',
        'Practice in private first, then with trusted person',
        'Notice how it feels different when controlled',
      ],
      {
        difficulty: 'hard',
        quarter: 2,
        setting: 'private',
        tags: ['desensitization', 'fear-reduction', 'stuttering-management'],
        whyItMatters: 'Voluntary stuttering reduces fear and shame around stuttering',
        tips: ['This feels weird at first - that\'s normal', 'You\'re in control of the stutter']
      }
    ),
    createTask(
      'speech-6',
      'Conversation with Trusted Person',
      'Apply techniques in real conversation',
      'speech',
      15,
      [
        'Choose someone you trust',
        'Have a 10-minute conversation about your day',
        'Use one technique (easy onset or light contact)',
        'Don\'t worry about perfect fluency',
        'Reflect on what felt different',
      ],
      {
        difficulty: 'medium',
        quarter: 3,
        setting: 'trusted_person',
        tags: ['real-world', 'conversation', 'technique-application'],
        whyItMatters: 'Real conversations are where techniques become natural',
        tips: ['Tell them you\'re practicing', 'Focus on connection, not perfection']
      }
    ),
    createTask(
      'speech-7',
      'Phone Call Practice',
      'Call a business with a simple question',
      'speech',
      10,
      [
        'Choose a low-pressure call (store hours, directions)',
        'Write down what you\'ll say',
        'Use box breathing before calling',
        'Apply easy onset to the first word',
        'Celebrate making the call',
      ],
      {
        difficulty: 'hard',
        quarter: 3,
        setting: 'public',
        tags: ['phone-calls', 'real-world', 'challenge'],
        whyItMatters: 'Phone calls are common feared situations - facing them builds confidence',
        tips: ['Script it out first', 'Remember: most calls last under a minute']
      }
    ),
    createTask(
      'speech-8',
      'Ordering Practice',
      'Order something at a cafe or restaurant',
      'speech',
      10,
      [
        'Choose a familiar place',
        'Decide what you\'ll order in advance',
        'Use pausing technique if needed',
        'Make eye contact with the person',
        'Don\'t apologize for stuttering',
      ],
      {
        difficulty: 'hard',
        quarter: 3,
        setting: 'public',
        tags: ['ordering', 'real-world', 'public-speaking'],
        whyItMatters: 'Ordering is a daily situation - mastering it increases independence',
        tips: ['Go at less busy times first', 'The staff wants to help you']
      }
    ),
    createTask(
      'speech-9',
      'Group Conversation',
      'Speak in a small group setting',
      'speech',
      20,
      [
        'Join a 3-4 person conversation',
        'Contribute at least 3 times',
        'Use techniques naturally',
        'If you stutter, keep going',
        'Notice others aren\'t judging',
      ],
      {
        difficulty: 'expert',
        quarter: 4,
        setting: 'small_group',
        tags: ['group-speaking', 'social', 'advanced'],
        whyItMatters: 'Group conversations are complex - success here builds real confidence',
        tips: ['You don\'t have to speak constantly', 'Quality over quantity']
      }
    ),
  ],
  reading: [
    createTask(
      'read-1',
      'Solo Reading Practice',
      'Build fluency through reading aloud',
      'reading',
      15,
      [
        'Choose a text you enjoy',
        'Read aloud at a comfortable pace',
        'Focus on smooth breathing',
        'Don\'t worry about mistakes',
        'Read for 15 minutes',
      ],
      {
        difficulty: 'easy',
        quarter: 1,
        setting: 'private',
        tags: ['reading', 'fluency', 'practice'],
        whyItMatters: 'Reading aloud builds muscle memory for fluent speech patterns',
        tips: ['Choose content that interests you', 'Speed doesn\'t matter']
      }
    ),
    createTask(
      'read-2',
      'Choral Reading',
      'Read along with an audiobook',
      'reading',
      15,
      [
        'Play an audiobook at normal speed',
        'Read along out loud',
        'Match the narrator\'s pace',
        'Notice how fluency feels',
        'Practice for 15 minutes',
      ],
      {
        difficulty: 'easy',
        quarter: 1,
        setting: 'private',
        tags: ['reading', 'choral-reading', 'fluency'],
        whyItMatters: 'Choral reading often produces immediate fluency - it shows what\'s possible',
        tips: ['Use free audiobooks from library apps', 'Start with books you know']
      }
    ),
    createTask(
      'read-3',
      'Phrase Reading',
      'Read in meaningful phrases',
      'reading',
      15,
      [
        'Mark natural pause points in text',
        'Read one phrase at a time',
        'Pause and breathe between phrases',
        'Focus on thought groups',
        'Read for 15 minutes',
      ],
      {
        difficulty: 'medium',
        quarter: 2,
        setting: 'private',
        tags: ['reading', 'phrasing', 'breathing'],
        whyItMatters: 'Phrase reading teaches natural speech rhythm and breathing patterns',
        tips: ['Mark phrases with slashes', 'Think of meaning, not just words']
      }
    ),
    createTask(
      'read-4',
      'Reading to Someone',
      'Read aloud to a trusted person',
      'reading',
      15,
      [
        'Choose a short story or article',
        'Read to a family member or friend',
        'Use your techniques',
        'If you stutter, keep reading',
        'Ask them what they remember from the story',
      ],
      {
        difficulty: 'medium',
        quarter: 3,
        setting: 'trusted_person',
        tags: ['reading', 'audience', 'real-world'],
        whyItMatters: 'Reading to someone adds gentle pressure while staying structured',
        tips: ['They\'re listening to the story, not judging speech', 'Pick engaging content']
      }
    ),
  ],
  mindfulness: [
    createTask(
      'mind-1',
      'Body Scan',
      'Release physical tension',
      'mindfulness',
      10,
      [
        'Lie down or sit comfortably',
        'Close your eyes',
        'Notice tension in jaw, neck, shoulders',
        'Breathe into tense areas',
        'Imagine tension melting away',
        'Scan your whole body for 10 minutes',
      ],
      {
        difficulty: 'beginner',
        quarter: 1,
        setting: 'private',
        tags: ['mindfulness', 'tension-release', 'body-awareness'],
        whyItMatters: 'Physical tension directly affects speech - awareness is the first step to release',
        tips: ['Do this before bed for better sleep', 'Notice where you hold tension']
      }
    ),
    createTask(
      'mind-2',
      'Acceptance Meditation',
      'Accept stuttering without judgment',
      'mindfulness',
      10,
      [
        'Sit quietly for 10 minutes',
        'Notice thoughts about speaking',
        'Acknowledge fears without judgment',
        'Remind yourself: "It\'s okay to stutter"',
        'Practice self-compassion',
      ],
      {
        difficulty: 'medium',
        quarter: 2,
        setting: 'private',
        tags: ['mindfulness', 'acceptance', 'self-compassion'],
        whyItMatters: 'Acceptance reduces the emotional pain of stuttering, which reduces stuttering',
        tips: ['This is hard but powerful', 'You can\'t force acceptance - just practice noticing']
      }
    ),
    createTask(
      'mind-3',
      'Positive Visualization',
      'Imagine fluent, confident speaking',
      'mindfulness',
      10,
      [
        'Close your eyes',
        'Imagine a speaking situation',
        'See yourself speaking calmly and clearly',
        'Feel the confidence in your body',
        'Practice this visualization for 10 minutes',
      ],
      {
        difficulty: 'easy',
        quarter: 1,
        setting: 'private',
        tags: ['mindfulness', 'visualization', 'confidence'],
        whyItMatters: 'Your brain rehearses during visualization - building positive associations',
        tips: ['Make it vivid - add sounds, feelings, details', 'Visualize before challenging situations']
      }
    ),
    createTask(
      'mind-4',
      'Gratitude Practice',
      'Focus on speech successes',
      'mindfulness',
      10,
      [
        'Write down 3 speaking successes from this week',
        'They can be small (said hello, made a call)',
        'Describe how it felt',
        'Thank yourself for the effort',
        'Notice progress over time',
      ],
      {
        difficulty: 'easy',
        quarter: 3,
        setting: 'private',
        tags: ['gratitude', 'reflection', 'progress'],
        whyItMatters: 'Focusing on successes rewires your brain away from fear',
        tips: ['Keep a success journal', 'Small wins count']
      }
    ),
  ],
  exercise: [
    createTask(
      'exercise-1',
      'Recorded Line Practice',
      'Low-pressure phone practice',
      'exercise',
      10,
      [
        'Call a recorded information line (weather, time, etc.)',
        'Practice speaking out loud as if ordering',
        'Focus on techniques you\'ve learned',
        'Build confidence in a safe environment',
      ],
      {
        difficulty: 'easy',
        quarter: 2,
        setting: 'private',
        tags: ['phone-practice', 'low-pressure', 'technique-application'],
        whyItMatters: 'Recorded lines let you practice phone speaking without judgment',
        tips: ['Nobody is listening - it\'s just for you', 'Try different techniques']
      }
    ),
    createTask(
      'exercise-2',
      'Mirror Speaking',
      'Observe yourself speaking',
      'exercise',
      10,
      [
        'Stand in front of a mirror',
        'Talk about your day for 5 minutes',
        'Watch your face and body language',
        'Notice tension and consciously relax',
        'Practice looking confident',
      ],
      {
        difficulty: 'easy',
        quarter: 1,
        setting: 'private',
        tags: ['self-observation', 'body-language', 'awareness'],
        whyItMatters: 'Seeing yourself speak builds awareness and confidence',
        tips: ['You might look more relaxed than you feel', 'Practice smiling']
      }
    ),
    createTask(
      'exercise-3',
      'Challenging Words',
      'Practice your difficult words',
      'exercise',
      10,
      [
        'List 10 words you find challenging',
        'Practice each word 10 times',
        'Use easy onset and light contact',
        'Gradually speed up',
        'Celebrate small victories',
      ],
      {
        difficulty: 'medium',
        quarter: 2,
        setting: 'private',
        tags: ['word-practice', 'feared-words', 'technique-application'],
        whyItMatters: 'Facing feared words directly reduces their power over you',
        tips: ['Your feared words will change over time', 'Practice makes them less scary']
      }
    ),
    createTask(
      'exercise-4',
      'Extended Conversation',
      'Real-world speaking practice',
      'exercise',
      15,
      [
        'Have a 15-minute conversation',
        'With a friend, family member, or yourself',
        'Focus on communication, not perfection',
        'Use your techniques naturally',
        'Reflect on what went well',
      ],
      {
        difficulty: 'medium',
        quarter: 3,
        setting: 'trusted_person',
        tags: ['conversation', 'real-world', 'technique-integration'],
        whyItMatters: 'Extended conversations build stamina and make techniques automatic',
        tips: ['Length matters less than connection', 'Notice when you forget about stuttering']
      }
    ),
    createTask(
      'exercise-5',
      'Ask a Stranger',
      'Ask someone for help or directions',
      'exercise',
      5,
      [
        'Find a friendly-looking stranger',
        'Ask for the time, directions, or a recommendation',
        'Use techniques if needed',
        'Thank them and move on',
        'Celebrate your courage',
      ],
      {
        difficulty: 'hard',
        quarter: 3,
        setting: 'public',
        tags: ['stranger-speaking', 'real-world', 'courage'],
        whyItMatters: 'Strangers show us that most people are kind and patient',
        tips: ['Choose someone who looks relaxed', 'Brief interactions are easiest']
      }
    ),
    createTask(
      'exercise-6',
      'Tell a Story',
      'Share a personal story with someone',
      'exercise',
      15,
      [
        'Choose a simple story from your life',
        'Tell it to a friend or family member',
        'Focus on the emotions and details',
        'Use pausing for emphasis',
        'Notice that they care about the story, not the stuttering',
      ],
      {
        difficulty: 'medium',
        quarter: 4,
        setting: 'trusted_person',
        tags: ['storytelling', 'connection', 'expression'],
        whyItMatters: 'Storytelling is powerful - it shifts focus from speech to message',
        tips: ['Pick a story you love telling', 'Emotion and passion reduce stuttering']
      }
    ),
    createTask(
      'exercise-7',
      'Presentation Practice',
      'Give a short presentation',
      'exercise',
      20,
      [
        'Choose a topic you know well',
        'Prepare a 3-minute talk',
        'Present to 1-2 people',
        'Use notes if needed',
        'Focus on sharing information, not perfect speech',
      ],
      {
        difficulty: 'expert',
        quarter: 4,
        setting: 'small_group',
        tags: ['presentation', 'public-speaking', 'advanced'],
        whyItMatters: 'Presentations are peak challenges - success here is life-changing',
        tips: ['Know your content well', 'Pausing makes you sound authoritative']
      }
    ),
  ],
};

export const generateYearProgram = (): DayProgram[] => {
  const program: DayProgram[] = [];
  let currentDay = 1;

  for (const phase of phases) {
    for (let dayInPhase = 1; dayInPhase <= phase.days; dayInPhase++) {
      const tasks: Task[] = [];
      
      if (currentDay <= 30) {
        tasks.push(taskPool.breathing[0]);
        tasks.push(taskPool.mindfulness[0]);
        tasks.push(taskPool.reading[0]);
      } else if (currentDay <= 60) {
        tasks.push(taskPool.breathing[1]);
        tasks.push(taskPool.speech[0]);
        tasks.push(taskPool.reading[0]);
        tasks.push(taskPool.mindfulness[1]);
      } else if (currentDay <= 90) {
        tasks.push(taskPool.breathing[2]);
        tasks.push(taskPool.speech[1]);
        tasks.push(taskPool.reading[1]);
        tasks.push(taskPool.exercise[0]);
      } else if (currentDay <= 150) {
        tasks.push(taskPool.breathing[currentDay % 3]);
        tasks.push(taskPool.speech[2]);
        tasks.push(taskPool.reading[1]);
        tasks.push(taskPool.exercise[1]);
      } else if (currentDay <= 240) {
        tasks.push(taskPool.breathing[currentDay % 3]);
        tasks.push(taskPool.speech[3]);
        tasks.push(taskPool.reading[2]);
        tasks.push(taskPool.exercise[2]);
      } else {
        tasks.push(taskPool.breathing[currentDay % 3]);
        tasks.push(taskPool.speech[currentDay % 4]);
        tasks.push(taskPool.reading[currentDay % 3]);
        tasks.push(taskPool.exercise[3]);
        tasks.push(taskPool.mindfulness[2]);
      }

      program.push({
        day: currentDay,
        phase: phase.name,
        focus: phase.focus,
        tasks,
      });

      currentDay++;
    }
  }

  return program;
};

export const YEAR_PROGRAM = generateYearProgram();
