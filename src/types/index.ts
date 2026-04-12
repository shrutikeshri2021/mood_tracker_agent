// ─── Core Data Models ───

export type MoodType = 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'angry' | 'tired';

export interface MoodEntry {
  id: string;
  mood: MoodType;
  moodIntensity: number;
  stress: number;
  energy: number;
  sleep: number;
  workload: number;
  focus: number;
  socialBattery: number;
  tags: string[];
  notes: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  triggers: string[];
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  prompt: string;
  mood?: MoodType;
  tags: string[];
  isFavorite: boolean;
  isVoice: boolean;
  voiceEmotion?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  name: string;
  goals: string[];
  reminderTime: string;
  theme: 'light' | 'auto';
  notificationsEnabled: boolean;
  panicPinCode: string;
  createdAt: number;
}

export interface BurnoutResult {
  score: number;
  level: 'low' | 'moderate' | 'high' | 'critical';
  trend: 'improving' | 'stable' | 'worsening';
  signals: BurnoutSignal[];
  recommendation: string;
  calculatedAt: number;
}

export interface BurnoutSignal {
  name: string;
  emoji: string;
  description: string;
  severity: 'watch' | 'warning' | 'alert';
}

export interface DetectedPattern {
  id: string;
  emoji: string;
  title: string;
  description: string;
  confidence: 'emerging' | 'confirmed' | 'strong';
  category: 'trigger' | 'recovery' | 'correlation';
  dataPoints: number;
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  avgMood: number;
  avgStress: number;
  avgEnergy: number;
  avgSleep: number;
  totalCheckins: number;
  totalJournals: number;
  topTags: string[];
  bestDay: string;
  hardestDay: string;
  insight: string;
  burnoutLevel: string;
  balanceScore: number;
  createdAt: number;
}

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  category: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress: number;
  target: number;
}

export interface BreathingSession {
  id: string;
  technique: string;
  duration: number;
  completedAt: number;
}

// ─── NEW FEATURE TYPES (15 Advanced Clinical Features) ───

// 1. CBT Thought Record
export interface ThoughtRecord {
  id: string;
  situation: string;
  automaticThought: string;
  emotion: string;
  emotionIntensity: number;
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  newEmotionIntensity: number;
  createdAt: number;
}

// 2. Safety Plan
export interface SafetyPlan {
  warningSigns: string[];
  copingStrategies: string[];
  distractions: string[];
  supportPeople: SafetyContact[];
  professionals: SafetyContact[];
  safeEnvironment: string;
  reasonsToLive: string[];
  updatedAt: number;
}

export interface SafetyContact {
  name: string;
  phone: string;
  relationship: string;
}

// 3. Gratitude Entry
export interface GratitudeEntry {
  id: string;
  items: string[];
  reflection: string;
  createdAt: number;
}

// 4. Sleep Log
export interface SleepLog {
  id: string;
  bedtime: string;
  wakeTime: string;
  quality: number;
  hoursSlept: number;
  factors: string[];
  notes: string;
  createdAt: number;
}

// 5. Grounding Session
export interface GroundingSession {
  id: string;
  technique: string;
  distressBefore: number;
  distressAfter: number;
  completedAt: number;
}

// 6. Medication Reminder
export interface MedicationEntry {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  date: string;
  notes: string;
}

// 7. Social Connection
export interface SocialLog {
  id: string;
  person: string;
  type: 'call' | 'text' | 'in-person' | 'video';
  quality: number;
  duration: string;
  notes: string;
  createdAt: number;
}

// 8. Energy Budget
export interface EnergyBudget {
  id: string;
  date: string;
  totalSpoons: number;
  activities: EnergyActivity[];
  createdAt: number;
}

export interface EnergyActivity {
  name: string;
  spoonCost: number;
  completed: boolean;
  category: 'work' | 'self-care' | 'social' | 'health' | 'essential';
}

// 9. Affirmation
export interface AffirmationEntry {
  id: string;
  text: string;
  category: string;
  isFavorite: boolean;
  createdAt: number;
}

// 10. PMR Session
export interface PMRSession {
  id: string;
  duration: number;
  muscleGroups: string[];
  tensionBefore: number;
  tensionAfter: number;
  completedAt: number;
}

// 11. Worry Entry (Worry Time)
export interface WorryEntry {
  id: string;
  worry: string;
  category: 'controllable' | 'uncontrollable';
  actionStep: string;
  intensity: number;
  resolved: boolean;
  createdAt: number;
}

// 12. Self-Compassion Entry
export interface SelfCompassionEntry {
  id: string;
  situation: string;
  selfKindness: string;
  commonHumanity: string;
  mindfulness: string;
  createdAt: number;
}

// 13. Emergency Contact
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isTherapist: boolean;
}

// 14. Wellness Score
export interface DailyWellnessScore {
  id: string;
  date: string;
  physical: number;
  emotional: number;
  social: number;
  cognitive: number;
  spiritual: number;
  overall: number;
  createdAt: number;
}

// 15. Mood Calendar Data (derives from entries, no separate storage needed)

// ─── DOCTOR PRESCRIBED FEATURES (15 More) ───

export interface PHQ9Score {
  id: string;
  score: number;
  severity: string;
  answers: number[];
  loggedAt: number;
}

export interface GAD7Score {
  id: string;
  score: number;
  severity: string;
  answers: number[];
  loggedAt: number;
}

export interface CognitiveDistortion {
  id: string;
  thought: string;
  distortions: string[];
  reframedThought: string;
  loggedAt: number;
}

export interface BehavioralActivation {
  id: string;
  activity: string;
  type: 'pleasure' | 'mastery';
  expectedMood: number;
  actualMood: number;
  completed: boolean;
  date: string;
}

export interface HydrationLog {
  id: string;
  waterGlasses: number;
  caffeineCups: number;
  date: string;
}

export interface SunlightLog {
  id: string;
  minutes: number;
  type: 'morning' | 'afternoon';
  date: string;
}

export interface DBTSkillLog {
  id: string;
  skillType: 'TIPP' | 'STOP' | 'WiseMind' | 'SelfSoothe';
  intensityBefore: number;
  intensityAfter: number;
  loggedAt: number;
}

export interface BoundaryPlan {
  id: string;
  person: string;
  boundary: string;
  script: string;
  successLevel: number;
  loggedAt: number;
}

export interface SomaticPainLog {
  id: string;
  location: string;
  intensity: number;
  description: string;
  loggedAt: number;
}

export interface DigitalWellbeingLog {
  id: string;
  appHours: number;
  detoxMinutes: number;
  moodImpact: number;
  date: string;
}

export interface BehavioralExperiment {
  id: string;
  prediction: string;
  expectedDisasterPercent: number;
  actualOutcome: string;
  learnt: string;
  loggedAt: number;
}

export interface ForgivenessLog {
  id: string;
  grudge: string;
  willingnessToRelease: number;
  replacementAffirmation: string;
  loggedAt: number;
}

export interface SelfCareTask {
  id: string;
  task: string;
  category: 'hygiene' | 'nutrition' | 'movement' | 'social';
  completed: boolean;
  date: string;
}

export interface RelapsePlan {
  id: string;
  triggers: string[];
  earlySigns: string[];
  preventiveActions: string[];
  rescueContacts: string[];
  updatedAt: number;
}

export interface ExistentialLog {
  id: string;
  value: string;
  alignedActions: string[];
  fulfillmentScore: number;
  loggedAt: number;
}

// ─── ADVANCED HEALING FEATURES (15 More) ───

export interface MindfulnessSession {
  id: string;
  week: number;
  day: number;
  technique: string;
  durationMinutes: number;
  mindfulnessBefore: number;
  mindfulnessAfter: number;
  notes: string;
  completedAt: number;
}

export interface RecoveryJournalEntry {
  id: string;
  oldStory: string;
  newStory: string;
  strengths: string[];
  chapter: string;
  createdAt: number;
}

export interface SoundTherapySession {
  id: string;
  soundType: string;
  frequencyHz: number;
  durationMinutes: number;
  moodBefore: number;
  moodAfter: number;
  completedAt: number;
}

export interface DreamEntry {
  id: string;
  title: string;
  content: string;
  emotions: string[];
  symbols: string[];
  sleepQuality: number;
  isRecurring: boolean;
  createdAt: number;
}

export interface MoodThermometerEntry {
  id: string;
  level: number; // 0-10
  bodyLocation: string;
  color: string;
  note: string;
  timestamp: number;
}

export interface PeerSupportScript {
  id: string;
  situation: string;
  script: string;
  relationship: string;
  practiced: boolean;
  createdAt: number;
}

export interface ValuesClarification {
  id: string;
  domain: string; // Family, Career, Health, etc.
  value: string;
  importance: number; // 1-10
  currentAlignment: number; // 1-10
  actionStep: string;
  createdAt: number;
}

export interface EmotionWheelEntry {
  id: string;
  primaryEmotion: string;
  secondaryEmotion: string;
  specificEmotion: string;
  bodyFeelings: string[];
  trigger: string;
  timestamp: number;
}

export interface MicroJoyEntry {
  id: string;
  moment: string;
  category: string;
  intensityOfJoy: number;
  timestamp: number;
}

export interface ExerciseLog {
  id: string;
  type: string;
  durationMinutes: number;
  intensityLevel: number;
  moodBefore: number;
  moodAfter: number;
  energyAfter: number;
  notes: string;
  date: string;
}

export interface NatureTherapyLog {
  id: string;
  activity: string;
  location: string;
  durationMinutes: number;
  moodBefore: number;
  moodAfter: number;
  notes: string;
  date: string;
}

export interface LetterTherapyEntry {
  id: string;
  recipient: string; // "past self", "future self", "person who hurt me", etc.
  letterType: string;
  content: string;
  intention: string;
  sentimentShift: number;
  createdAt: number;
}

export interface CompassionFatigueLog {
  id: string;
  answers: number[];
  totalScore: number;
  level: string;
  recommendations: string[];
  loggedAt: number;
}

export interface RecoveryGoal {
  id: string;
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  targetDate: string;
  progressPercent: number;
  milestones: GoalMilestone[];
  category: string;
  createdAt: number;
  updatedAt: number;
}

export interface GoalMilestone {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number;
}

export interface WindDownRitual {
  steps: WindDownStep[];
  targetBedtime: string;
  updatedAt: number;
}

export interface WindDownStep {
  id: string;
  order: number;
  activity: string;
  emoji: string;
  durationMinutes: number;
  completed: boolean;
}

export type ScreenName =
  | 'home' | 'checkin' | 'journal' | 'insights' | 'profile'
  | 'burnout' | 'patterns' | 'breathing' | 'report'
  | 'achievements' | 'panic-setup' | 'locked'
  | 'advanced-pack-1' | 'advanced-pack-2' | 'advanced-pack-3' | 'advanced-pack-4'
  // Clinical screens
  | 'cbt' | 'safety-plan' | 'gratitude' | 'sleep-tracker'
  | 'grounding' | 'medications' | 'social' | 'energy-budget'
  | 'affirmations' | 'pmr' | 'calendar' | 'worry-time'
  | 'self-compassion' | 'emergency' | 'wellness-score'
  // Doctor prescribed screens
  | 'phq9' | 'gad7' | 'distortions' | 'activation' | 'hydration'
  | 'sunlight' | 'dbt' | 'boundaries' | 'pain-map' | 'digital-limits'
  | 'experiment' | 'forgiveness' | 'selfcare-checklist' | 'relapse' | 'meaning'
  // Advanced healing screens
  | 'mindfulness' | 'recovery-journal' | 'sound-therapy' | 'dream-journal'
  | 'mood-thermometer' | 'peer-support' | 'values' | 'emotion-wheel'
  | 'micro-joy' | 'exercise-log' | 'nature-therapy' | 'letter-therapy'
  | 'compassion-fatigue' | 'recovery-goals' | 'wind-down';
