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

### 📅 Daily Practice Dashboard
- **Personalized daily plans** with 3-5 tasks tailored to your current phase
- **Live progress tracking** with visual completion bars
- **Streak counter** to celebrate consistency
- **Animated task cards** with haptic feedback for an engaging experience

### 🎯 Adaptive Task System
- **Smart task generation** that responds to your habits, ratings, and progress
- **Task swapping** – replace any task with a similar alternative if it doesn't fit your day
- **Step-by-step guidance** with clear instructions and "why it matters" context
- **Completion ratings** to help the app learn what works best for you

### 🧘 Practice & Reflection
- **Free-form task browser** with filters by exercise type (breathing, speech, reading, mindfulness, real-world)
- **Simple mood logging** to track your emotional journey
- **On-demand practice** for when you want extra exercises

### 📊 Progress & Insights
- **365-day calendar view** showing your entire program journey
- **Stats dashboard** with completion counts, milestones, and phase summaries
- **Visual progress indicators** to see how far you've come

### ⚙️ Customization & Control
- **Toggle adaptive features** on/off based on your preference
- **Full program overview** to see what's ahead
- **Data reset option** for fresh starts
- **Complete offline functionality** – no internet required


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
- **State management**: Zustand + React Query
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