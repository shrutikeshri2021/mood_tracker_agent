# MoodVS - Private Burnout & Mood Tracker

**MoodVS** is a sophisticated, privacy-first wellness platform designed specifically for high-pressure professionals. It bridges the gap between daily work stress and clinical mental health support by providing real-time tracking, AI-driven burnout forecasting, and therapeutic interventions.

---

## 💡 What is MoodVS?
In fast-paced environments, mental health often goes unnoticed until it's too late. MoodVS offers a confidential space to:
- **Monitor Wellbeing**: Seamlessly log daily moods and stress levels.
- **Prevent Burnout**: Identify early warning signs before they escalate.
- **Immediate Recovery**: Access clinical-grade tools for stress reduction in-the-moment.

## ⚙️ How It Works
The app operates on a recursive feedback loop designed for growth:
1. **Entry**: Users perform a quick "Daily Check-in" logging emotions, energy, and work-related tags.
2. **Analysis**: The internal logic engines (`burnoutEngine`, `patternDetector`) process the raw data.
3. **Insights**: Users receive personalized trends, identifying specific "danger zones" in their week.
4. **Action**: Based on the state, the app suggests specific exercises (Breathing, CBT, or Grounding) to restore balance.

## ✨ Core Features

### 📊 Intelligence & Analytics
- **Burnout Forecasting**: Predicts potential "exhaustion peaks" using weighted historical data.
- **Pattern Detection**: Links activities (e.g., meetings, deadlines) to emotional shifts.
- **Holistic Wellness Scoring**: Unified radial metrics for sleep, mood, and stress balance.

### 🏥 Clinical Toolkit
- **CBT & DBT Modules**: Interactive worksheets for reframing thoughts and emotional regulation.
- **Crisis Safety Planning**: Instant access to emergency protocols and coping strategies.
- **Screening Tools**: Professional-grade assessments including PHQ-9 (Depression) and GAD-7 (Anxiety).

### 🕊️ Therapeutic Support
- **Adaptive UI**: Interface colors shift aesthetically (Warm/Cool) to mirror and normalize your emotional state.
- **Binaural Audio Therapy**: Embedded soundscapes designed for focus and deep relaxation.
- **Guided Grounding**: Interactive 5-4-3-2-1 sensory exercises for acute anxiety management.

### 🔒 Privacy by Design
- **Local Encryption**: All sensitive notes are encrypted with AES-256 via `Crypto-JS` before saving.
- **Zero-Server Architecture**: Your data never leaves your device; everything stays in local storage.
- **Panic Mode**: A discrete "cloak" that hides the app's contents behind a functional calculator UI.

---

## 🚀 Top 20 Essential Features
1.  **Burnout Prediction Engine**: AI-driven risk scoring (0-100) based on stress/energy data.
2.  **AES-256 Encryption**: Military-grade security for all journal entries and records.
3.  **High-Fidelity Mood Logging**: Quick-tap interface for tracking nuanced emotions.
4.  **Stress Trigger Analysis**: Automatically links activities to emotional shifts.
5.  **Clinical PHQ-9 & GAD-7**: Professional screening tools for depression and anxiety.
6.  **CBT Thought Reframing**: Guided digital worksheets for cognitive behavioral therapy.
7.  **Panic Mode (Cloaking)**: One-tap toggle to hide the app behind a calculator interface.
8.  **Grounding (5-4-3-2-1)**: Interactive sensory guide for acute panic relief.
9.  **Binaural Sound Therapy**: therapeutic frequencies for focus and relaxation.
10. **Voice Journaling**: Hands-free reflection with emotion detection insights.
11. **Adaptive Mood UI**: Dynamic theme colors that normalize the user's emotional state.
12. **Energy Battery Tracking**: Visualizes mental and physical energy reserves.
13. **Wellness Balance Scoring**: Holistic health dashboard with radial progress metrics.
14. **Crisis Safety Planning**: Structured intervention card for emergency situations.
15. **Sleep & Mood Correlation**: Analyzes how rest impacts emotional performance.
16. **DBT Skills Dashboard**: Quick access to distress tolerance and mindfulness tools.
17. **Activity Tagging**: Contextual tagging (14+ types) for work and personal life.
18. **Cognitive Distortion Alerts**: Identifying harmful thinking patterns in real-time.
19. **Sunlight & Hydration Logs**: Tracking physical habits that influence mental state.
20. **Proactive Notifications**: Smart, non-intrusive reminders for self-care and check-ins.

---

## 🏗️ Architecture
MoodVS is built as a **Privacy-First Progressive Web App**, emphasizing security and client-side performance.

- **Logic Engines**: Distributed "brains" handle data processing without external APIs.
  - `burnoutEngine.ts`: Calculates risk scores.
  - `patternDetector.ts`: Correlation-based insight generation.
- **State Management**: Reactive UI updates powered by React 19 and Framer Motion.
- **Security Layer**: Intercepts storage calls to ensure all PII (Personally Identifiable Information) is encrypted.

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **Data Viz**: Recharts
- **Security**: Crypto-JS (AES-256)
- **Hosting**: Render

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/shrutikeshri2021/mood_tracker_agent.git

# Install dependencies
npm install

# Run development server
npm run dev
```

---
*Developed with a commitment to professional mental health privacy.*
