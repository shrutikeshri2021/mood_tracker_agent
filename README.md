# MoodVS - Private Burnout & Mood Tracker

**Code: #12**  
**Focus: Mental Health - Private & Secure Support for Professionals**

## 🌟 Overview
Busy professionals often face immense pressure, leading to stress and burnout. **MoodVS** is a sophisticated, private daily mood tracker designed specifically for working professionals. It provides a confidential space to monitor wellbeing and receive proactive self-care support before stress escalates into serious mental health issues.

## ❓ Why It’s Important
In high-pressure work environments, mental health often takes a backseat due to lack of time or concerns over privacy. MoodVS bridges this gap by offering:
- **Privacy First**: Ensuring professionals feel safe tracking their mental state.
- **Burnout Prevention**: Catching the early signs of exhaustion through data-driven insights.
- **Immediate Support**: Providing simple, actionable exercises like breathing and journaling in the moment they are needed.

## ✨ Key Features & How They Work

### 1. Burnout & Mood Tracking
- **How it works**: A daily check-in system where users log their emotional state and work-related stress levels.
- **Tech**: Custom `burnoutEngine.ts` and `moodForecast.ts` logic.

### 2. Pattern Detection & Analytics
- **How it works**: The app analyzes historical data to identify recurring stress triggers or "danger zones" in the user's week.
- **Tech**: `patternDetector.ts` and `recharts` for visual data representation.

### 3. Clinical-Grade Insights
- **How it works**: Provides high-level clinical overview calculations to help users understand the severity of their symptoms.
- **Tech**: `ClinicalFeatures.tsx` and `balanceScore.ts`.

### 4. Therapeutic Support & Healing
- **How it works**: Integrated breathing exercises, soundscapes, and recovery tools.
- **Tech**: `AdvancedHealing.tsx`, `audioTherapy.ts`, and `systemSounds.ts`.

### 5. Specialized Clinical & Self-Care Screens
- **Clinical Toolkit**: CBT, Safety Planning, Sleep Tracking, Grounding, and Wellness Scoring via `ClinicalFeatures.tsx`.
- **Doctor-Prescribed Utilities**: PHQ-9/GAD-7 assessments, DBT Skills, Sunlight tracking, and Behavioral Activation via `DoctorPrescribed.tsx`.
- **Advanced Growth**: Mindfulness, Values Clarification, Emotion Wheels, and Recovery Goal tracking via `AdvancedHealing.tsx`.

### 6. Privacy & Intelligence
- **Private Storage**: All data encrypted locally using `crypto-js` via `storage.ts`.
- **Adaptive UI**: Interface color schemes shift based on your current mood state. 
- **Smart Notifications**: Proactive daily check-in reminders and milestone alerts via `notificationService.ts`.

## 🛠 Tech Stack

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | **React 19** | Core UI framework for a modern, reactive interface. |
| **Bundler** | **Vite** | For ultra-fast development and optimized production builds. |
| **Styling** | **Tailwind CSS** | For a clean, professional, and responsive design. |
| **Animation** | **Framer Motion** | For smooth, calming transitions and UI interactions. |
| **Charts** | **Recharts** | For visualizing mood patterns and stress trends. |
| **Icons** | **Lucide React** | For professional and intuitive iconography. |
| **Security** | **Crypto-JS** | For securing and encrypting stored user data. |
| **Utils** | **Date-fns** | For complex date manipulation and pattern tracking. |
| **Deployment**| **Render** | For reliable, continuous hosting of the web application. |

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shrutikeshri2021/mood_tracker_agent.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run locally**:
   ```bash
   npm run dev
   ```
4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🎨 UI & UX Guide

### 📱 Main Layout & Navigation
The app features a **clean, cards-based interface** with a soft, mood-adaptive background that changes color based on your current state (e.g., Warm Yellow for Happy, Cool Blue for Neutral). Navigation is handled via a bottom bar and contextual action buttons.

### 🏠 Home Screen (Daily Check-in)
*   **Mood Selector**: A row of large, friendly emojis (Happy, Calm, Anxious, etc.) with glowing accents.
*   **Daily Prompt**: A random rotating question to encourage reflection.
*   **Quick Tags**: Interactive chips for activities like 'Meeting', 'Exercise', or 'Conflict'.
*   **Trend Card**: A mini-chart showing your mood over the last few days.

### 🏥 Clinical Features (`ClinicalFeatures.tsx`)
*   **CBT Worksheet**: A guided form for identifying triggers and reframing negative thoughts.
*   **Safety Plan**: A structured, high-contrast digital card containing emergency contacts and coping steps.
*   **Sleep Tracker**: A minimalist dark-themed interface for logging hours and quality.
*   **Grounding (5-4-3-2-1)**: A step-by-step interactive guide with large, clear text instructions.
*   **Wellness Score**: A visual dashboard with radial progress bars for various health metrics.

### 🩺 Doctor-Prescribed Toolkit (`DoctorPrescribed.tsx`)
*   **PHQ-9 & GAD-7**: Clean, clinical-style surveys with single-choice selection buttons for rapid assessment.
*   **DBT Skills Dashboard**: A tile-based menu highlighting 'Mindfulness', 'Distress Tolerance', and 'Emotion Regulation'.
*   **Sunlight & Hydration**: Gamified trackers with progress animations (e.g., a filling water drop or growing sun icon).
*   **Behavioral Activation**: A simple checklist-style interface for scheduling and confirming positive activities.

### 🕊️ Advanced Healing & Recovery (`AdvancedHealing.tsx`)
*   **Mindfulness Player**: A simplified audio interface with a "breathing circle" animation that expands and contracts.
*   **Emotion Wheel**: A colorful, tap-integrated radial wheel to help drill down into specific feelings.
*   **Recovery Journal**: A distraction-free, full-screen writing mode with calming typography.
*   **Mood Thermometer**: A vertical slider representing intensity levels, color-coded from green to red.

### 🛌 Night & Emergency Modes
*   **Wind Down**: Automatically shifts the UI to an ultra-dark, low-blue-light mode.
*   **Emergency Screen**: A high-visibility Red button on the sidebar that links directly to crisis resources and personal safety plans.

---

## 🏗️ Architecture & How It Works

MoodVS is built as a **Privacy-First Progressive Web App (PWA)**. Its architecture is designed to handle complex mental health logic entirely on the client-side, ensuring that sensitive data never leaves the user's device.

### 🧠 Logic Engines (The "Brains")
- **Burnout Engine (`burnoutEngine.ts`)**: Uses a weighted scoring algorithm to calculate burnout risk (0-100) by analyzing cross-referenced data between stress levels, energy, sleep, and workload.
- **Pattern Detector (`patternDetector.ts`)**: Iterates through historical entries to identify correlations (e.g., "Mondays with high stress correlate with 'meeting' tags").
- **Mood Forecast (`moodForecast.ts`)**: A predictive model that identifies cyclical trends to warn users about potential "low" days before they happen.
- **Balance Scorer (`balanceScore.ts`)**: Calculates a holistic "Emotional Balance" percentage based on the harmony between different wellness metrics.

### 🔒 Privacy & Security Infrastructure
- **Zero-Server Storage**: Uses `localStorage` via a dedicated `storage.ts` service.
- **Encryption**: Employs **AES-256 encryption** (via `crypto-js`) for sensitive journal entries, meaning even if someone gains access to the device's browser data, the thoughts remain unreadable.
- **Panic Mode**: A unique architectural "cloak" that wraps the entire application state. When triggered, it replaces the UI with a fully functional Calculator, hiding the mental health data behind a secret PIN.

### 📡 APIs & System Services
- **Web Speech API**: Powering the "Voice Journal" feature, allowing users to speak their thoughts which are then transcribed and sentiment-analyzed in real-time.
- **Web Notifications API**: Managed by `notificationService.ts` to provide gentle, non-intrusive reminders for daily check-ins and breathing sessions.
- **Web Audio API**: Utilized by `audioTherapy.ts` and `systemSounds.ts` for low-latency playback of binaural beats and therapeutic soundscapes.

## 🚀 40+ Integrated Features

MoodVS isn't just a tracker; it's a comprehensive clinic in your pocket.

### 🏠 Essential Tracking
1. **Mood Logging**: High-fidelity emotion selection.
2. **Stress Tracking**: 1-10 scale work stress monitoring.
3. **Energy Management**: Tracking physical and mental batteries.
4. **Sleep Quality**: Logging restorative vs. restless rest.
5. **Workload Analysis**: Monitoring professional over-extension.
6. **Social Battery**: Tracking introversion/extroversion needs.
7. **Activity Tagging**: 14+ contextual tags for daily events.
8. **Trigger Analysis**: Identifying root causes of mood shifts.
9. **Voice Journaling**: Hands-free reflection with emotion detection.
10. **Visual Insights**: Automated charts for 7-day and 30-day trends.

### 🏥 Clinical Toolkit (`ClinicalFeatures.tsx`)
11. **CBT Worksheet**: Thought-reframing tools.
12. **Safety Planning**: Digital crisis intervention card.
13. **Grounding (5-4-3-2-1)**: Acute anxiety reduction.
14. **PMR (Progressive Muscle Relaxation)**: Physical stress release.
15. **Wellness Score**: Holistic health assessment.
16. **Worry Time**: Structured anxiety management.
17. **Self-Compassion**: Tools for reducing inner criticism.
18. **Medication Tracker**: Compliance and reminder logs.
19. **Gratitude Board**: Positive psychology integration.
20. **Energy Budgeting**: "Spoon theory" for professionals.

### 🩺 Doctor-Prescribed Tools (`DoctorPrescribed.tsx`)
21. **PHQ-9**: Gold-standard depression screening.
22. **GAD-7**: Professional-grade anxiety assessment.
23. **Cognitive Distortions**: Identifying "mind traps."
24. **Behavioral Activation**: combatting lethargy via scheduling.
25. **Hydration Tracker**: Physical wellness basics.
26. **Sunlight Logging**: Vitamin D and circadian support.
27. **DBT Skills**: Distress tolerance and mindfulness tools.
28. **Boundary Setting**: Professional and personal limit tools.
29. **Somatic Pain Map**: Connecting body tension to stress.
30. **Digital Wellbeing**: Tracking phone/screen usage limits.

### 🕊️ Advanced Healing (`AdvancedHealing.tsx`)
31. **Mindfulness MBSR**: Guided attention practices.
32. **Binaural Sound Therapy**: Frequency-based relaxation.
33. **Dream Journaling**: Tracking sleep-state reflections.
34. **Mood Thermometer**: Visualizing emotional temperature.
35. **Emotion Wheel**: Granular feelings identification.
36. **Exercise & Mood**: Movement-mental health correlation.
37. **Nature Therapy**: Tracking "green time."
38. **Letter Therapy**: Unsent letters for emotional closure.
39. **Values Clarification**: ACT-based life alignment.
40. **Compassion Fatigue**: Specialized tools for care-based professionals.

## ❓ How This Is Helpful
By combining **Data Science** (Burnout Prediction), **Clinical Psychology** (CBT/DBT), and **Privacy Tech** (Local Encryption), MoodVS provides:
1.  **Early Warning**: Noticing a 5% burnout increase before it feels overwhelming.
2.  **Context**: Understanding that "Meetings" are fine, but "Mondays with Overtime" are the trigger.
3.  **Safety**: Providing a "Panic Button" for professionals who need absolute privacy at work.
4.  **Action**: Not just tracking, but telling you exactly which 2-minute breathing technique to use.

---
*Created with a focus on professional wellbeing and mental health privacy.*
