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
  dayOfWeek: DayOfWeek;
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

const phaseMap = [
  { name: 'Foundation', start: 1, end: 90, focus: 'Awareness, breath, rate, easy onset, light contacts' },
  { name: 'Build the Toolset', start: 91, end: 180, focus: 'Tool chaining, pull-outs, cancellations, CBT/mindfulness' },
  { name: 'Transfer & Desensitize', start: 181, end: 270, focus: 'Real conversations, disclosure, reducing avoidance' },
  { name: 'High-Stakes & Maintenance', start: 271, end: 365, focus: 'Group/meetings, talks, long-term maintenance' },
];

const monthFocus: Record<number, string> = {
  1: 'Install slow/prolonged speech + breath awareness',
  2: 'Add easy onsets + light contacts',
  3: 'Blend onsets/contacts with pausing; medium micro-challenges',
  4: 'Tool chaining; scripted calls; start pull-outs/cancellations',
  5: 'Pull-outs in live speech; daily voluntary stutters',
  6: 'Mini-presentations; deliberate “hard” situations',
  7: 'Transfer to real conversations; start disclosure',
  8: 'Talks to 2+ people; public voluntary stuttering',
  9: 'Attack avoidance situations; reflect after',
  10: 'Prep and deliver 10–15 min talk; on-demand tool switching',
  11: 'Practice feared settings; use disclosure; stay with stutters',
  12: 'Design maintenance plan; watch for early warning signs',
};

const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const difficultyByMonth: Record<number, TaskDifficulty> = {
  1: 'beginner',
  2: 'easy',
  3: 'easy',
  4: 'medium',
  5: 'medium',
  6: 'medium',
  7: 'hard',
  8: 'hard',
  9: 'hard',
  10: 'expert',
  11: 'expert',
  12: 'expert',
};

const settingByMonth: Record<number, TaskSetting> = {
  1: 'trusted_person',
  2: 'trusted_person',
  3: 'public',
  4: 'public',
  5: 'public',
  6: 'public',
  7: 'public',
  8: 'public',
  9: 'public',
  10: 'public',
  11: 'public',
  12: 'public',
};

const getQuarter = (day: number) => {
  if (day <= 90) return 1;
  if (day <= 180) return 2;
  if (day <= 270) return 3;
  return 4;
};

const dayNames: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getMonthForDay = (day: number) => {
  let remaining = day;
  for (let i = 0; i < monthLengths.length; i++) {
    if (remaining <= monthLengths[i]) {
      return i + 1;
    }
    remaining -= monthLengths[i];
  }
  return 12;
};

const techniqueBlockForMonth = (month: number) => {
  switch (month) {
    case 1:
      return createTask(
        'technique-m1',
        'Technique Drill: Prolonged + Pausing',
        'Install slow, prolonged speech with deliberate pausing.',
        'speech',
        12,
        [
          '5 min: prolonged speech on single words → short phrases (10–20 simple phrases).',
          '5–7 min: read aloud very slowly; pause at punctuation; keep airflow steady.',
          'Stay relaxed; aim for smooth, slightly slower-than-normal speech.',
        ],
        { difficulty: 'beginner', quarter: 1, tags: ['rate', 'pausing', 'awareness'], whyItMatters: 'Slow, deliberate speech builds breath-sound coordination and reduces rush that fuels blocks.' }
      );
    case 2:
      return createTask(
        'technique-m2',
        'Technique Drill: Easy Onset + Light Contacts',
        'Add gentle voice starts and soft consonant contacts.',
        'speech',
        12,
        [
          '5 min: easy onsets on vowel-initial words/phrases (“hhh-apple”).',
          '5 min: light contacts on plosives (p, b, t, d, k, g) with soft touch.',
          'Combine in reading: slow rate + pausing + easy onset.',
        ],
        { difficulty: 'easy', quarter: 1, tags: ['easy-onset', 'light-contact', 'pausing'], whyItMatters: 'Gentle voice starts and soft consonants reduce vocal fold and articulator tension that triggers blocks.' }
      );
    case 3:
      return createTask(
        'technique-m3',
        'Technique Drill: Alternating Focus',
        'Alternate between onsets + prolonged speech and light contacts + phrasing.',
        'speech',
        12,
        [
          'Day A: easy onset + prolonged voice across 2–3 words.',
          'Day B: light contacts + pausing/phrasing (4–7 word groups).',
          'Keep breath low/steady; aim for relaxed rhythm.',
        ],
        { difficulty: 'easy', quarter: 1, tags: ['alternating', 'phrasing'], whyItMatters: 'Switching focus keeps skills flexible and prepares you to combine them naturally.' }
      );
    case 4:
      return createTask(
        'technique-m4',
        'Technique Drill: Tool Chaining',
        'Chain shaping tools smoothly.',
        'speech',
        12,
        [
          'Pattern: easy onset → prolonged voice across 2–3 words → light contacts → pause → repeat.',
          '1–2 min each: run the pattern on short phrases.',
          'Finish with 3–5 minutes of “over-learned” slow reading (exaggerate the pattern).',
        ],
        { difficulty: 'medium', quarter: 2, tags: ['tool-chaining', 'pausing'], whyItMatters: 'Chaining skills builds automaticity so you can call on multiple tools in real speech.' }
      );
    case 5:
      return createTask(
        'technique-m5',
        'Technique Drill: Over-Learning + Pull-outs',
        'Blend shaping with first pull-outs.',
        'speech',
        12,
        [
          '5 min: extremely slow reading with over-clear onsets/contacts.',
          '5 min: simulate a block, then exit with pull-out (reduce tension, slow/prolong, light contact).',
          'End with normal-speed sentence while keeping airflow smooth.',
        ],
        { difficulty: 'medium', quarter: 2, tags: ['pull-out', 'over-learning'], whyItMatters: 'Practicing exits from mock blocks teaches you to stay present and release tension instead of forcing through.' }
      );
    case 6:
      return createTask(
        'technique-m6',
        'Technique Drill: Mixed Tools',
        'Mix shaping and modification in one run.',
        'speech',
        12,
        [
          '5 min: slow → moderate rate reading while keeping easy onsets and pausing.',
          '5–7 min: insert 3–5 intentional pull-outs/cancellations in reading.',
          'Stay calm; let airflow lead, not effort.',
        ],
        { difficulty: 'medium', quarter: 2, tags: ['pull-out', 'cancellation', 'rate'], whyItMatters: 'Mixing shaping and modification simulates real-life needs to adjust mid-sentence.' }
      );
    case 7:
    case 8:
    case 9:
      return createTask(
        'technique-m7',
        'Technique Drill: Naturalness & Control',
        'Speed up while keeping smoothness and low tension.',
        'speech',
        12,
        [
          'Start exaggerated slow; gradually move to natural rate across 3–4 minutes.',
          'Randomly add pauses and restart with easy onset.',
          'Include 2–3 light pull-outs in reading or monologue.',
        ],
        { difficulty: 'hard', quarter: 3, tags: ['naturalness', 'rate', 'pull-out'], whyItMatters: 'Brings fluency tools to a more natural pace while keeping control available on demand.' }
      );
    default:
      return createTask(
        'technique-m10',
        'Technique Drill: On-Demand Switching',
        'Quickly switch tools in higher-pressure prep.',
        'speech',
        10,
        [
          'Randomly cue yourself: “slow for this sentence,” “easy onset start,” “light contact on consonants.”',
          'Restart mid-sentence with gentle onset after a deliberate pause.',
          'End with 60 seconds of normal-rate speech while keeping tension low.',
        ],
        { difficulty: 'expert', quarter: 4, tags: ['on-demand', 'rate', 'restart'], whyItMatters: 'Practices rapid tool switching under higher demand so you can stay composed in tougher contexts.' }
      );
  }
};

const speakingBlockForMonth = (month: number) => {
  if (month === 1) {
    return createTask(
      'speak-m1',
      'Structured Speaking: Monologue + Reading',
      'Low-pressure monologue and reading with recording.',
      'speech',
      12,
      [
        '5 min monologue alone about your day; record on phone.',
        '5–7 min reading aloud (news/book) using slow rate + pauses.',
        'Pick one clip per week to replay and note tension spots.',
      ],
      { difficulty: 'beginner', quarter: 1, tags: ['monologue', 'recording'], whyItMatters: 'Private practice lets you build control without social pressure while hearing your own improvements.' }
    );
  }
  if (month === 2) {
    return createTask(
      'speak-m2',
      'Structured Speaking: Recorded Monologue',
      'Build consistency with daily recordings.',
      'speech',
      12,
      [
        '10–12 min monologue on a topic (what you did last week).',
        'Use slow rate + pausing + easy onset; keep airflow steady.',
        'Once per week, listen back and jot 2 wins / 2 tension moments.',
      ],
      { difficulty: 'easy', quarter: 1, tags: ['monologue', 'recording', 'review'], whyItMatters: 'Recording and reviewing helps you spot tension patterns and notice progress objectively.' }
    );
  }
  if (month === 3) {
    return createTask(
      'speak-m3',
      'Structured Speaking: Alternate Focus',
      'Alternate onsets/contacts focus across days.',
      'speech',
      12,
      [
        'Day A: monologue with easy onset + prolonged flow.',
        'Day B: monologue with light contacts + phrasing.',
        'Record 2–3 times per week; review weekly.',
      ],
      { difficulty: 'easy', quarter: 1, tags: ['monologue', 'alternating'], whyItMatters: 'Alternating focus builds flexibility so you can combine tools smoothly later.' }
    );
  }
  if (month === 4 || month === 5) {
    return createTask(
      'speak-m4',
      'Structured Speaking: Dialogues + Mini-Presos',
      'Mix monologues, mock dialogues, and mini-presentations.',
      'speech',
      12,
      [
        '2–3 days/week: recorded monologue (10–12 min).',
        '2–3 days/week: mock conversations (write 5–10 lines, read both parts).',
        '1 day/week: 5 min recorded “teach someone” mini-presentation.',
      ],
      { difficulty: 'medium', quarter: 2, tags: ['dialogue', 'presentation', 'recording'], whyItMatters: 'Moving into dialogues and teaching builds interaction skills and prepares you for real conversations.' }
    );
  }
  if (month === 6) {
    return createTask(
      'speak-m6',
      'Structured Speaking: Present & Review',
      'Practice mini-presentations and reviews.',
      'speech',
      12,
      [
        '3 days/week: mock conversations or role-plays (booking, requesting).',
        '2 days/week: 5–10 min mini-presentation; record one.',
        'Weekly: re-listen, note pull-out/cancellation attempts.',
      ],
      { difficulty: 'medium', quarter: 2, tags: ['presentation', 'role-play'], whyItMatters: 'Role-plays and presentations simulate real pressure and let you rehearse tool use before going live.' }
    );
  }
  if (month === 7 || month === 8 || month === 9) {
    return createTask(
      'speak-m7',
      'Structured Speaking: Real Conversations',
      'Use real conversations as the structured task.',
      'speech',
      12,
      [
        '3 days/week: real conversation as the “structured” task (meetings, neighbors, coworkers).',
        '2 days/week: mini-presentation recorded on a tougher topic.',
        'After each real interaction: note one tool you used or could have used.',
      ],
      { difficulty: 'hard', quarter: 3, tags: ['conversation', 'transfer', 'recording'], whyItMatters: 'Using the structured slot for real conversations accelerates transfer and desensitization.' }
    );
  }
  return createTask(
    'speak-m10',
    'Structured Speaking: High-Stakes Reps',
    'Practice for talks, meetings, and harder calls.',
    'speech',
    12,
    [
      'At least 3 days/week: mildly uncomfortable task (speak in group, make a call, ask a follow-up question).',
      'Prep lines, then deliver with tools on demand.',
      'If prepping a talk: outline → practice daily → deliver → review video.',
    ],
    { difficulty: 'expert', quarter: 4, tags: ['high-stakes', 'meeting', 'talk'], whyItMatters: 'Higher-stakes practice cements your ability to stay present, use tools quickly, and avoid old escape behaviors.' }
  );
};

const modificationBlockForMonth = (month: number) => {
  if (month === 1 || month === 2) {
    return createTask(
      'mod-m1',
      'Stuttering Modification: Voluntary Stuttering',
      'Reduce fear via gentle pseudostuttering.',
      'speech',
      6,
      [
        '5 gentle voluntary stutters per day in practice (alone/reading).',
        'Pick one word like “s-s-speak”; keep it calm and controlled.',
        'Goal: feel a stutter without extra tension or self-criticism.',
      ],
      { difficulty: 'beginner', quarter: 1, tags: ['voluntary-stutter', 'desensitization'], whyItMatters: 'Intentional stutters reduce fear and teach you to stay relaxed when a block starts.' }
    );
  }
  if (month === 3) {
    return createTask(
      'mod-m3',
      'Stuttering Modification: Light Desensitization',
      'Blend voluntary stuttering into practice with calm continuations.',
      'speech',
      6,
      [
        '5 voluntary stutters; continue speaking without backing off.',
        'Notice body tension; let shoulders/jaw stay loose.',
        'Remind yourself: goal is control, not perfection.',
      ],
      { difficulty: 'easy', quarter: 1, tags: ['voluntary-stutter', 'awareness'], whyItMatters: 'Keeping your place after a deliberate stutter builds resilience and reduces avoidance.' }
    );
  }
  if (month === 4 || month === 5) {
    return createTask(
      'mod-m4',
      'Stuttering Modification: Pull-outs + Cancellations',
      'Practice exiting or redoing stutters calmly.',
      'speech',
      8,
      [
        'In reading/monologue: when you stutter, decrease tension and slide out with prolonged speech (pull-out).',
        'If the stutter was big: pause 1–2s, breathe, repeat the word with easy onset (cancellation).',
        'Simulate blocks if none occur; do 3–5 reps.',
      ],
      { difficulty: 'medium', quarter: 2, tags: ['pull-out', 'cancellation'], whyItMatters: 'Practicing exits and redo’s trains calm responses instead of force or avoidance.' }
    );
  }
  if (month === 6) {
    return createTask(
      'mod-m6',
      'Stuttering Modification: Live Pull-outs',
      'Bring modification into role-plays and presentations.',
      'speech',
      8,
      [
        'Role-play or mini-presentation: if you stutter, keep eye contact and use pull-out or cancellation.',
        'After the task, note one instance to improve next time.',
        'Stay in the moment; no word swaps.',
      ],
      { difficulty: 'medium', quarter: 2, tags: ['pull-out', 'presentation'], whyItMatters: 'Applying modification tools in simulated pressure bridges practice to real use.' }
    );
  }
  if (month === 7 || month === 8 || month === 9) {
    return createTask(
      'mod-m7',
      'Stuttering Modification: Real Life Reps',
      'Use modification tools during real conversations.',
      'speech',
      8,
      [
        'In today’s real interaction, allow at least one pull-out or cancellation instead of pushing through.',
        'Log one example (success or miss) right after.',
        'Keep eye contact; avoid escape behaviors.',
      ],
      { difficulty: 'hard', quarter: 3, tags: ['pull-out', 'real-life'], whyItMatters: 'Using tools during real conversations is the key to desensitization and control in daily life.' }
    );
  }
  return createTask(
    'mod-m10',
    'Stuttering Modification: High-Stakes Calm',
    'Quality of response over perfection.',
    'speech',
    8,
    [
      'In higher-pressure tasks, aim for: no word swaps, no escape behaviors.',
      'If you stutter: soften tension, use pull-out or cancellation, continue the message.',
      'Log how often you stayed present versus avoided.',
    ],
    { difficulty: 'expert', quarter: 4, tags: ['high-stakes', 'pull-out', 'cancellation'], whyItMatters: 'In tougher settings, responding calmly to stutters preserves communication and confidence.' }
  );
};

const microChallengeForMonth = (month: number, day: number) => {
  const baseInstructions = [
    'Pick one real-life micro-challenge for today and do it intentionally.',
    'Use your tools (slow rate, pausing, onsets/contacts) and allow stutters without hiding.',
  ];

  let options: string[] = [];
  if (month === 1) {
    options = [
      'Say hello + one sentence to a shop assistant.',
      'Ask a simple question like “What time do you close?”',
      'Make one short call to friend/family (week 3–4).',
    ];
  } else if (month === 2) {
    options = [
      'One planned interaction using slow rate + pausing.',
      'Order something in person while allowing pauses.',
    ];
  } else if (month === 3) {
    options = [
      'Two short phone calls this week; do one today if pending.',
      'Deliberately stutter mildly on one word in a safe setting.',
    ];
  } else if (month === 4) {
    options = [
      'Make a scripted medium-stakes call (doctor/restaurant).',
      'Read your script once, then call using tools.',
    ];
  } else if (month === 5) {
    options = [
      'Use a pull-out in a live 5–10 min conversation.',
      'Do one voluntary stutter in public today.',
    ];
  } else if (month === 6) {
    options = [
      'Deliver a 5–10 min mini-presentation to someone (or record).',
      'Pick a “hard” situation (ask a stranger for directions) and do it.',
    ];
  } else if (month === 7) {
    options = [
      'Speak once in a meeting/group; plan line → deliver.',
      'Use your disclosure script once this week (do it today if pending).',
    ];
  } else if (month === 8) {
    options = [
      'Talk 5–10 min to 2+ people (friends/coworkers/online).',
      'Do 1–2 voluntary stutters in a public interaction.',
    ];
  } else if (month === 9) {
    options = [
      'Pick one avoidance situation and do it (call instead of email).',
      'Afterward, spend 10 min reflecting: what happened vs feared?',
    ];
  } else if (month === 10) {
    options = [
      'Work on your 10–15 min talk: outline/practice/deliver/review (pick today’s step).',
      'In any conversation, switch tools on demand (slow a sentence, easy onset restart).',
    ];
  } else if (month === 11) {
    options = [
      'Enter a feared setting (formal meeting/interview practice); speak at least twice.',
      'Use your disclosure line once if appropriate.',
    ];
  } else {
    options = [
      'Draft or refine your maintenance plan (weekly routine, warning signs, response plan).',
      'Do one exposure + one technique refresh to keep skills alive.',
    ];
  }

  return createTask(
    `micro-${month}-${day}`,
    'Micro-Challenge',
    'Short real-world action to build transfer and desensitization.',
    'exercise',
    5,
    [...baseInstructions, ...options],
    { difficulty: difficultyByMonth[month], setting: settingByMonth[month], quarter: getQuarter(day), tags: ['challenge', 'transfer'] }
  );
};

const breathBlock = (day: number) =>
  createTask(
    `breath-${day}`,
    'Body + Breath Reset',
    'Loosen tension and anchor breath support.',
    'breathing',
    5,
    [
      '2 min: neck/shoulder/jaw loosening (slow rolls, gentle stretches).',
      '3 min: diaphragmatic breathing: in 4, hold 1, out 6–8; belly moves, chest stays quieter.',
    ],
    { difficulty: day <= 180 ? 'beginner' : 'easy', quarter: getQuarter(day), setting: 'private', tags: ['breath', 'tension-release'] }
  );

const logBlock = (day: number) =>
  createTask(
    `log-${day}`,
    'Log + Plan',
    'Reflect to reinforce learning.',
    'mindfulness',
    5,
    [
      'Rate today: stuttering 0–10, tension 0–10, avoidance 0–10.',
      'Write 3 bullets: what went well, what was hard, one micro-challenge for tomorrow.',
      'If you stuttered: note one tool you used or will try next time.',
    ],
    { difficulty: 'easy', quarter: getQuarter(day), tags: ['reflection', 'logging'] }
  );

const cbtBlock = (day: number) =>
  createTask(
    `cbt-${day}`,
    'Mindfulness + Thought Record',
    'Short cognitive/mindfulness check-in to reduce fear and avoidance.',
    'mindfulness',
    10,
    [
      '5 min mindful breathing: notice bodily tension and let shoulders/jaw soften.',
      'Write one recent speaking situation: emotion, automatic thought, evidence for/against, balanced response.',
      'Set one intention for the next challenge (e.g., allow a pull-out, keep eye contact).',
    ],
    {
      difficulty: 'medium',
      quarter: getQuarter(day),
      tags: ['mindfulness', 'cbt', 'reflection'],
      whyItMatters: 'Regular cognitive work reduces fear/avoidance and keeps you responding calmly to stutters.',
    }
  );

export const generateYearProgram = (): DayProgram[] => {
  const program: DayProgram[] = [];

  for (let day = 1; day <= 365; day++) {
    const month = getMonthForDay(day);
    const dayOfWeek = dayNames[(day - 1) % 7];
    const phase = phaseMap.find(p => day >= p.start && day <= p.end) || phaseMap[phaseMap.length - 1];
    const focus = `${phase.focus} • ${monthFocus[month]}`;
    const technique = techniqueBlockForMonth(month);
    const speaking = speakingBlockForMonth(month);
    const modification = modificationBlockForMonth(month);
    const restDay =
      dayOfWeek === 'Sunday' ? [
        breathBlock(day),
        logBlock(day),
      ] : [];

    const shouldAddCbt = month >= 4 && (dayOfWeek === 'Tuesday' || dayOfWeek === 'Friday') && restDay.length === 0;
    const cbtTask = shouldAddCbt ? [{ ...cbtBlock(day), id: `cbt-${day}` }] : [];

    const tasks: Task[] = restDay.length > 0 ? restDay : [
      breathBlock(day),
      { ...technique, id: `${technique.id}-d${day}` },
      { ...speaking, id: `${speaking.id}-d${day}` },
      ...cbtTask,
      { ...modification, id: `${modification.id}-d${day}` },
      microChallengeForMonth(month, day),
      logBlock(day),
    ];

    program.push({
      day,
      phase: phase.name,
      focus,
      tasks,
      dayOfWeek,
    });
  }

  return program;
};

export const YEAR_PROGRAM = generateYearProgram();
