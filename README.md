## 🚧 Development Status

FlowSpeak is currently in active development with limited features. The app runs **completely offline** – all your data stays on your device, giving you full privacy and control.

### Testing & Feedback

If you'd like to try FlowSpeak:
- **iOS**: I can set up a TestFlight build for early testing
- **Android**: APK available on request
- **Development**: Clone this repo and run locally with `bun start`

### Contributing

As someone who stutters, I built FlowSpeak to be a free resource for the stuttering community. If you:
- Have suggestions to improve the app
- Want to collaborate on features
- Found a bug or have feedback

**Please reach out!** I'd love to hear from you.


# FlowSpeak

FlowSpeak is a companion app for building speaking confidence if you stutter. Based on a year-long structured program, it combines breathing exercises, speech practice, reading sessions, mindfulness, and real-world challenges – all designed to help you develop fluency at your own pace.

## ✨ Features

### 📅 Daily Practice
- **Auto-advancing daily plan**: opens on the right day automatically; Sundays are lighter (breath + log).
- **12-month structured program**: breathing → technique → speaking → modification → micro-challenge → log; CBT/mindfulness blocks 2×/week from month 4.
- **Task detail improvements**: per-step checkmarks, inline swap confirmation, session timer with haptics for time-bound tasks.
- **“Why it matters” context** on core tasks so you know the therapeutic goal.

### 🎯 Adaptive & Swaps
- **Smart task generation (optional)** that adapts to ratings, recency, preferences, and day-of-week.
- **Swaps always apply** (adaptive on/off) and show the replacement in place; alternatives avoid duplicates and match type/difficulty.

### 🧘 Practice & Reflection
- **Free practice browser** (breathing, speech, reading, mindfulness, exercise) with presets where categories were empty.
- **Extra practice bucket** tracked separately from today’s plan.
- **Mood logging with notes**, editable for today, tied into the daily log.

### 📊 Insights & Stats
- **Daily insight** blends ratings + moods with type-level feedback (e.g., “speech strongest lately”).
- **Stats**: completion trend, ratings trend, mood trend (7/30-day), most-swapped tasks, and a today snapshot.
- **Streaks and totals** based on completed tasks; mood/rating history surfaced in insights.

### ⚙️ Control & Privacy
- **Phase overview** for the full program (calendar screen removed for simplicity).
- **Reset progress** fully clears local storage and cache; hydration/loading guarded.
- **Offline-first**: all data stays on-device; no accounts or tracking.


### License & Usage

FlowSpeak is free and open-source. Feel free to:
- Use the app as-is
- Modify the code for your needs
- Fork and adapt it
- Share it with others who might benefit

All your progress data is stored locally on your device – no servers, no tracking, no accounts required.

---

## 🛠️ Tech Stack

- **Expo SDK 54** + React Native 0.81
- **Expo Router** for file-based navigation
- **Bun** for package management
- **State/data**: React Query + context
- **Storage**: AsyncStorage (local-first)
- **UI/UX**: Lucide icons, Expo Linear Gradient, haptic feedback

### Getting Started
```bash
# Install dependencies
bun install

# Start development server
bun start

# Run linter
expo lint
```

---

**Note**: Since this is an early version, expect occasional bugs and missing features. Your patience and feedback help make FlowSpeak better for everyone. 🙏
