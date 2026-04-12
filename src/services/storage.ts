import type { MoodEntry, JournalEntry, UserProfile, WeeklyReport, BreathingSession, Achievement, ThoughtRecord, SafetyPlan, GratitudeEntry, SleepLog, GroundingSession, MedicationEntry, SocialLog, EnergyBudget, AffirmationEntry, PMRSession, WorryEntry, SelfCompassionEntry, EmergencyContact, DailyWellnessScore, PHQ9Score, GAD7Score, CognitiveDistortion, BehavioralActivation, HydrationLog, SunlightLog, DBTSkillLog, BoundaryPlan, SomaticPainLog, DigitalWellbeingLog, BehavioralExperiment, ForgivenessLog, SelfCareTask, RelapsePlan, ExistentialLog, MindfulnessSession, RecoveryJournalEntry, SoundTherapySession, DreamEntry, MoodThermometerEntry, PeerSupportScript, ValuesClarification, EmotionWheelEntry, MicroJoyEntry, ExerciseLog, NatureTherapyLog, LetterTherapyEntry, CompassionFatigueLog, RecoveryGoal, WindDownRitual } from '../types';

const KEYS = {
  profile: 'zm:profile',
  entries: 'zm:entries',
  journal: 'zm:journal',
  reports: 'zm:reports',
  breathing: 'zm:breathing',
  achievements: 'zm:achievements',
  appState: 'zm:appstate',
  burnoutHistory: 'zm:burnout_history',
  panicMode: 'zm:panic',
  balanceHistory: 'zm:balance',
  adaptiveTheme: 'zm:adaptive_theme',
  // New feature keys
  thoughtRecords: 'zm:cbt',
  safetyPlan: 'zm:safety_plan',
  gratitude: 'zm:gratitude',
  sleepLogs: 'zm:sleep_logs',
  groundingSessions: 'zm:grounding',
  medications: 'zm:medications',
  socialLogs: 'zm:social',
  energyBudgets: 'zm:energy_budgets',
  affirmations: 'zm:affirmations',
  pmrSessions: 'zm:pmr',
  worryEntries: 'zm:worry',
  selfCompassion: 'zm:self_compassion',
  emergencyContacts: 'zm:emergency',
  wellnessScores: 'zm:wellness_scores',
  // === DOCTOR PRESCRIBED KEYS ===
  phq9: 'zm:phq9',
  gad7: 'zm:gad7',
  distortions: 'zm:distortions',
  activations: 'zm:activations',
  hydration: 'zm:hydration',
  sunlight: 'zm:sunlight',
  dbtSkills: 'zm:dbt_skills',
  boundaries: 'zm:boundaries',
  painLogs: 'zm:pain_logs',
  digitalWellbeing: 'zm:digital_wellbeing',
  experiments: 'zm:experiments',
  forgiveness: 'zm:forgiveness',
  selfcareTasks: 'zm:selfcare_tasks',
  relapsePlan: 'zm:relapse_plan',
  existentialLogs: 'zm:existential_logs',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

const defaultProfile: UserProfile = {
  name: '',
  goals: [],
  reminderTime: '09:00',
  theme: 'light',
  notificationsEnabled: false,
  panicPinCode: '',
  createdAt: Date.now(),
};

const defaultSafetyPlan: SafetyPlan = {
  warningSigns: [],
  copingStrategies: [],
  distractions: [],
  supportPeople: [],
  professionals: [],
  safeEnvironment: '',
  reasonsToLive: [],
  updatedAt: 0,
};

export const storage = {
  // Profile
  getProfile: (): UserProfile => get(KEYS.profile, defaultProfile),
  saveProfile: (p: UserProfile) => set(KEYS.profile, p),

  // Mood Entries
  getEntries: (): MoodEntry[] => get(KEYS.entries, []),
  saveEntry: (e: MoodEntry) => {
    const all = get<MoodEntry[]>(KEYS.entries, []);
    const idx = all.findIndex(x => x.id === e.id);
    if (idx >= 0) all[idx] = e; else all.push(e);
    set(KEYS.entries, all);
  },
  deleteEntry: (id: string) => {
    set(KEYS.entries, get<MoodEntry[]>(KEYS.entries, []).filter(e => e.id !== id));
  },

  // Journal
  getJournals: (): JournalEntry[] => get(KEYS.journal, []),
  saveJournal: (j: JournalEntry) => {
    const all = get<JournalEntry[]>(KEYS.journal, []);
    const idx = all.findIndex(x => x.id === j.id);
    if (idx >= 0) all[idx] = j; else all.push(j);
    set(KEYS.journal, all);
  },
  deleteJournal: (id: string) => {
    set(KEYS.journal, get<JournalEntry[]>(KEYS.journal, []).filter(j => j.id !== id));
  },

  // Weekly Reports
  getReports: (): WeeklyReport[] => get(KEYS.reports, []),
  saveReport: (r: WeeklyReport) => {
    const all = get<WeeklyReport[]>(KEYS.reports, []);
    all.push(r);
    set(KEYS.reports, all);
  },

  // Breathing Sessions
  getBreathingSessions: (): BreathingSession[] => get(KEYS.breathing, []),
  saveBreathingSession: (s: BreathingSession) => {
    const all = get<BreathingSession[]>(KEYS.breathing, []);
    all.push(s);
    set(KEYS.breathing, all);
  },

  // Achievements
  getAchievements: (): Achievement[] => get(KEYS.achievements, []),
  saveAchievements: (a: Achievement[]) => set(KEYS.achievements, a),

  // Burnout History
  getBurnoutHistory: (): Array<{score: number; level: string; calculatedAt: number}> => get(KEYS.burnoutHistory, []),
  saveBurnoutScore: (s: {score: number; level: string; calculatedAt: number}) => {
    const all = get<Array<{score: number; level: string; calculatedAt: number}>>(KEYS.burnoutHistory, []);
    all.push(s);
    set(KEYS.burnoutHistory, all);
  },

  // Balance History
  getBalanceHistory: (): Array<{score: number; date: string}> => get(KEYS.balanceHistory, []),
  saveBalanceScore: (s: {score: number; date: string}) => {
    const all = get<Array<{score: number; date: string}>>(KEYS.balanceHistory, []);
    all.push(s);
    set(KEYS.balanceHistory, all);
  },

  // Adaptive Theme
  getAdaptiveTheme: (): string => get(KEYS.adaptiveTheme, 'default'),
  saveAdaptiveTheme: (t: string) => set(KEYS.adaptiveTheme, t),

  // Panic
  getPanicPin: (): string => get(KEYS.panicMode, ''),
  savePanicPin: (pin: string) => set(KEYS.panicMode, pin),

  // ─── NEW FEATURE STORAGE ───

  // CBT Thought Records
  getThoughtRecords: (): ThoughtRecord[] => get(KEYS.thoughtRecords, []),
  saveThoughtRecord: (r: ThoughtRecord) => {
    const all = get<ThoughtRecord[]>(KEYS.thoughtRecords, []);
    all.push(r);
    set(KEYS.thoughtRecords, all);
  },
  deleteThoughtRecord: (id: string) => {
    set(KEYS.thoughtRecords, get<ThoughtRecord[]>(KEYS.thoughtRecords, []).filter(r => r.id !== id));
  },

  // Safety Plan
  getSafetyPlan: (): SafetyPlan => get(KEYS.safetyPlan, defaultSafetyPlan),
  saveSafetyPlan: (p: SafetyPlan) => set(KEYS.safetyPlan, p),

  // Gratitude
  getGratitudeEntries: (): GratitudeEntry[] => get(KEYS.gratitude, []),
  saveGratitudeEntry: (e: GratitudeEntry) => {
    const all = get<GratitudeEntry[]>(KEYS.gratitude, []);
    all.push(e);
    set(KEYS.gratitude, all);
  },
  deleteGratitudeEntry: (id: string) => {
    set(KEYS.gratitude, get<GratitudeEntry[]>(KEYS.gratitude, []).filter(e => e.id !== id));
  },

  // Sleep Logs
  getSleepLogs: (): SleepLog[] => get(KEYS.sleepLogs, []),
  saveSleepLog: (l: SleepLog) => {
    const all = get<SleepLog[]>(KEYS.sleepLogs, []);
    all.push(l);
    set(KEYS.sleepLogs, all);
  },

  // Grounding Sessions
  getGroundingSessions: (): GroundingSession[] => get(KEYS.groundingSessions, []),
  saveGroundingSession: (s: GroundingSession) => {
    const all = get<GroundingSession[]>(KEYS.groundingSessions, []);
    all.push(s);
    set(KEYS.groundingSessions, all);
  },

  // Medications
  getMedications: (): MedicationEntry[] => get(KEYS.medications, []),
  saveMedication: (m: MedicationEntry) => {
    const all = get<MedicationEntry[]>(KEYS.medications, []);
    const idx = all.findIndex(x => x.id === m.id);
    if (idx >= 0) all[idx] = m; else all.push(m);
    set(KEYS.medications, all);
  },
  deleteMedication: (id: string) => {
    set(KEYS.medications, get<MedicationEntry[]>(KEYS.medications, []).filter(m => m.id !== id));
  },

  // Social Logs
  getSocialLogs: (): SocialLog[] => get(KEYS.socialLogs, []),
  saveSocialLog: (l: SocialLog) => {
    const all = get<SocialLog[]>(KEYS.socialLogs, []);
    all.push(l);
    set(KEYS.socialLogs, all);
  },

  // Energy Budgets
  getEnergyBudgets: (): EnergyBudget[] => get(KEYS.energyBudgets, []),
  saveEnergyBudget: (b: EnergyBudget) => {
    const all = get<EnergyBudget[]>(KEYS.energyBudgets, []);
    const idx = all.findIndex(x => x.id === b.id);
    if (idx >= 0) all[idx] = b; else all.push(b);
    set(KEYS.energyBudgets, all);
  },

  // Affirmations
  getAffirmations: (): AffirmationEntry[] => get(KEYS.affirmations, []),
  saveAffirmation: (a: AffirmationEntry) => {
    const all = get<AffirmationEntry[]>(KEYS.affirmations, []);
    all.push(a);
    set(KEYS.affirmations, all);
  },
  deleteAffirmation: (id: string) => {
    set(KEYS.affirmations, get<AffirmationEntry[]>(KEYS.affirmations, []).filter(a => a.id !== id));
  },

  // PMR Sessions
  getPMRSessions: (): PMRSession[] => get(KEYS.pmrSessions, []),
  savePMRSession: (s: PMRSession) => {
    const all = get<PMRSession[]>(KEYS.pmrSessions, []);
    all.push(s);
    set(KEYS.pmrSessions, all);
  },

  // Worry Entries
  getWorryEntries: (): WorryEntry[] => get(KEYS.worryEntries, []),
  saveWorryEntry: (e: WorryEntry) => {
    const all = get<WorryEntry[]>(KEYS.worryEntries, []);
    const idx = all.findIndex(x => x.id === e.id);
    if (idx >= 0) all[idx] = e; else all.push(e);
    set(KEYS.worryEntries, all);
  },
  deleteWorryEntry: (id: string) => {
    set(KEYS.worryEntries, get<WorryEntry[]>(KEYS.worryEntries, []).filter(e => e.id !== id));
  },

  // Self-Compassion
  getSelfCompassionEntries: (): SelfCompassionEntry[] => get(KEYS.selfCompassion, []),
  saveSelfCompassionEntry: (e: SelfCompassionEntry) => {
    const all = get<SelfCompassionEntry[]>(KEYS.selfCompassion, []);
    all.push(e);
    set(KEYS.selfCompassion, all);
  },

  // Emergency Contacts
  getEmergencyContacts: (): EmergencyContact[] => get(KEYS.emergencyContacts, []),
  saveEmergencyContact: (c: EmergencyContact) => {
    const all = get<EmergencyContact[]>(KEYS.emergencyContacts, []);
    const idx = all.findIndex(x => x.id === c.id);
    if (idx >= 0) all[idx] = c; else all.push(c);
    set(KEYS.emergencyContacts, all);
  },
  deleteEmergencyContact: (id: string) => {
    set(KEYS.emergencyContacts, get<EmergencyContact[]>(KEYS.emergencyContacts, []).filter(c => c.id !== id));
  },

  // Wellness Scores
  getWellnessScores: (): DailyWellnessScore[] => get(KEYS.wellnessScores, []),
  saveWellnessScore: (s: DailyWellnessScore) => {
    const all = get<DailyWellnessScore[]>(KEYS.wellnessScores, []);
    all.push(s);
    set(KEYS.wellnessScores, all);
  },

  // Clear all
  clearAll: () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },

  // ─── ADVANCED HEALING STORAGE (15 New Features) ───

  getMindfulnessSessions: (): MindfulnessSession[] => get('zm:mindfulness', []),
  saveMindfulnessSession: (s: MindfulnessSession) => {
    const all = get<MindfulnessSession[]>('zm:mindfulness', []);
    all.push(s); set('zm:mindfulness', all);
  },

  getRecoveryJournal: (): RecoveryJournalEntry[] => get('zm:recovery_journal', []),
  saveRecoveryJournal: (e: RecoveryJournalEntry) => {
    const all = get<RecoveryJournalEntry[]>('zm:recovery_journal', []);
    const idx = all.findIndex(x => x.id === e.id);
    if (idx >= 0) all[idx] = e; else all.push(e);
    set('zm:recovery_journal', all);
  },
  deleteRecoveryJournal: (id: string) => {
    set('zm:recovery_journal', get<RecoveryJournalEntry[]>('zm:recovery_journal', []).filter(e => e.id !== id));
  },

  getSoundTherapySessions: (): SoundTherapySession[] => get('zm:sound_therapy', []),
  saveSoundTherapySession: (s: SoundTherapySession) => {
    const all = get<SoundTherapySession[]>('zm:sound_therapy', []);
    all.push(s); set('zm:sound_therapy', all);
  },

  getDreamEntries: (): DreamEntry[] => get('zm:dreams', []),
  saveDreamEntry: (e: DreamEntry) => {
    const all = get<DreamEntry[]>('zm:dreams', []);
    const idx = all.findIndex(x => x.id === e.id);
    if (idx >= 0) all[idx] = e; else all.push(e);
    set('zm:dreams', all);
  },
  deleteDreamEntry: (id: string) => {
    set('zm:dreams', get<DreamEntry[]>('zm:dreams', []).filter(e => e.id !== id));
  },

  getMoodThermometer: (): MoodThermometerEntry[] => get('zm:thermometer', []),
  saveMoodThermometer: (e: MoodThermometerEntry) => {
    const all = get<MoodThermometerEntry[]>('zm:thermometer', []);
    all.push(e); set('zm:thermometer', all);
  },

  getPeerSupportScripts: (): PeerSupportScript[] => get('zm:peer_support', []),
  savePeerSupportScript: (s: PeerSupportScript) => {
    const all = get<PeerSupportScript[]>('zm:peer_support', []);
    const idx = all.findIndex(x => x.id === s.id);
    if (idx >= 0) all[idx] = s; else all.push(s);
    set('zm:peer_support', all);
  },
  deletePeerSupportScript: (id: string) => {
    set('zm:peer_support', get<PeerSupportScript[]>('zm:peer_support', []).filter(s => s.id !== id));
  },

  getValuesClarifications: (): ValuesClarification[] => get('zm:values', []),
  saveValuesClarification: (v: ValuesClarification) => {
    const all = get<ValuesClarification[]>('zm:values', []);
    const idx = all.findIndex(x => x.id === v.id);
    if (idx >= 0) all[idx] = v; else all.push(v);
    set('zm:values', all);
  },
  deleteValuesClarification: (id: string) => {
    set('zm:values', get<ValuesClarification[]>('zm:values', []).filter(v => v.id !== id));
  },

  getEmotionWheelEntries: (): EmotionWheelEntry[] => get('zm:emotion_wheel', []),
  saveEmotionWheelEntry: (e: EmotionWheelEntry) => {
    const all = get<EmotionWheelEntry[]>('zm:emotion_wheel', []);
    all.push(e); set('zm:emotion_wheel', all);
  },

  getMicroJoyEntries: (): MicroJoyEntry[] => get('zm:micro_joy', []),
  saveMicroJoyEntry: (e: MicroJoyEntry) => {
    const all = get<MicroJoyEntry[]>('zm:micro_joy', []);
    all.push(e); set('zm:micro_joy', all);
  },
  deleteMicroJoyEntry: (id: string) => {
    set('zm:micro_joy', get<MicroJoyEntry[]>('zm:micro_joy', []).filter(e => e.id !== id));
  },

  getExerciseLogs: (): ExerciseLog[] => get('zm:exercise', []),
  saveExerciseLog: (l: ExerciseLog) => {
    const all = get<ExerciseLog[]>('zm:exercise', []);
    all.push(l); set('zm:exercise', all);
  },

  getNatureTherapyLogs: (): NatureTherapyLog[] => get('zm:nature', []),
  saveNatureTherapyLog: (l: NatureTherapyLog) => {
    const all = get<NatureTherapyLog[]>('zm:nature', []);
    all.push(l); set('zm:nature', all);
  },

  getLetterTherapyEntries: (): LetterTherapyEntry[] => get('zm:letters', []),
  saveLetterTherapyEntry: (e: LetterTherapyEntry) => {
    const all = get<LetterTherapyEntry[]>('zm:letters', []);
    all.push(e); set('zm:letters', all);
  },
  deleteLetterTherapyEntry: (id: string) => {
    set('zm:letters', get<LetterTherapyEntry[]>('zm:letters', []).filter(e => e.id !== id));
  },

  getCompassionFatigueLogs: (): CompassionFatigueLog[] => get('zm:compassion_fatigue', []),
  saveCompassionFatigueLog: (l: CompassionFatigueLog) => {
    const all = get<CompassionFatigueLog[]>('zm:compassion_fatigue', []);
    all.push(l); set('zm:compassion_fatigue', all);
  },

  getRecoveryGoals: (): RecoveryGoal[] => get('zm:recovery_goals', []),
  saveRecoveryGoal: (g: RecoveryGoal) => {
    const all = get<RecoveryGoal[]>('zm:recovery_goals', []);
    const idx = all.findIndex(x => x.id === g.id);
    if (idx >= 0) all[idx] = g; else all.push(g);
    set('zm:recovery_goals', all);
  },
  deleteRecoveryGoal: (id: string) => {
    set('zm:recovery_goals', get<RecoveryGoal[]>('zm:recovery_goals', []).filter(g => g.id !== id));
  },

  getWindDownRitual: (): WindDownRitual => get('zm:wind_down', { steps: [], targetBedtime: '22:00', updatedAt: 0 }),
  saveWindDownRitual: (r: WindDownRitual) => set('zm:wind_down', r),

  // === DOCTOR PRESCRIBED METHODS ===

  getPHQ9Scores: (): PHQ9Score[] => get(KEYS.phq9, []),
  savePHQ9Score: (s: PHQ9Score) => {
    const all = get<PHQ9Score[]>(KEYS.phq9, []);
    all.push(s);
    set(KEYS.phq9, all);
  },

  getGAD7Scores: (): GAD7Score[] => get(KEYS.gad7, []),
  saveGAD7Score: (s: GAD7Score) => {
    const all = get<GAD7Score[]>(KEYS.gad7, []);
    all.push(s);
    set(KEYS.gad7, all);
  },

  getCognitiveDistortions: (): CognitiveDistortion[] => get(KEYS.distortions, []),
  saveCognitiveDistortion: (s: CognitiveDistortion) => {
    const all = get<CognitiveDistortion[]>(KEYS.distortions, []);
    all.push(s);
    set(KEYS.distortions, all);
  },

  getBehavioralActivations: (): BehavioralActivation[] => get(KEYS.activations, []),
  saveBehavioralActivation: (s: BehavioralActivation) => {
    const all = get<BehavioralActivation[]>(KEYS.activations, []);
    all.push(s);
    set(KEYS.activations, all);
  },
  updateBehavioralActivation: (id: string, updates: Partial<BehavioralActivation>) => {
    const all = get<BehavioralActivation[]>(KEYS.activations, []);
    const idx = all.findIndex(x => x.id === id);
    if (idx >= 0) { all[idx] = { ...all[idx], ...updates }; set(KEYS.activations, all); }
  },

  getHydrationLogByDate: (date: string): HydrationLog | null => {
    const all = get<HydrationLog[]>(KEYS.hydration, []);
    return all.find(h => h.date === date) || null;
  },
  saveHydrationLog: (l: HydrationLog) => {
    const all = get<HydrationLog[]>(KEYS.hydration, []);
    const idx = all.findIndex(x => x.date === l.date);
    if (idx >= 0) all[idx] = l; else all.push(l);
    set(KEYS.hydration, all);
  },

  getSunlightLogs: (): SunlightLog[] => get(KEYS.sunlight, []),
  saveSunlightLog: (l: SunlightLog) => {
    const all = get<SunlightLog[]>(KEYS.sunlight, []);
    all.push(l);
    set(KEYS.sunlight, all);
  },

  getDBTSkillLogs: (): DBTSkillLog[] => get(KEYS.dbtSkills, []),
  saveDBTSkillLog: (l: DBTSkillLog) => {
    const all = get<DBTSkillLog[]>(KEYS.dbtSkills, []);
    all.push(l);
    set(KEYS.dbtSkills, all);
  },

  getBoundaryPlans: (): BoundaryPlan[] => get(KEYS.boundaries, []),
  saveBoundaryPlan: (l: BoundaryPlan) => {
    const all = get<BoundaryPlan[]>(KEYS.boundaries, []);
    all.push(l);
    set(KEYS.boundaries, all);
  },

  getSomaticPainLogs: (): SomaticPainLog[] => get(KEYS.painLogs, []),
  saveSomaticPainLog: (l: SomaticPainLog) => {
    const all = get<SomaticPainLog[]>(KEYS.painLogs, []);
    all.push(l);
    set(KEYS.painLogs, all);
  },

  saveDigitalWellbeingLog: (l: DigitalWellbeingLog) => {
    const all = get<DigitalWellbeingLog[]>(KEYS.digitalWellbeing, []);
    const idx = all.findIndex(x => x.date === l.date);
    if (idx >= 0) all[idx] = l; else all.push(l);
    set(KEYS.digitalWellbeing, all);
  },

  getBehavioralExperiments: (): BehavioralExperiment[] => get(KEYS.experiments, []),
  saveBehavioralExperiment: (l: BehavioralExperiment) => {
    const all = get<BehavioralExperiment[]>(KEYS.experiments, []);
    all.push(l);
    set(KEYS.experiments, all);
  },

  saveForgivenessLog: (l: ForgivenessLog) => {
    const all = get<ForgivenessLog[]>(KEYS.forgiveness, []);
    all.push(l);
    set(KEYS.forgiveness, all);
  },

  getSelfCareTasks: (): SelfCareTask[] => get(KEYS.selfcareTasks, []),
  saveSelfCareTask: (l: SelfCareTask) => {
    const all = get<SelfCareTask[]>(KEYS.selfcareTasks, []);
    all.push(l);
    set(KEYS.selfcareTasks, all);
  },
  updateSelfCareTask: (id: string, updates: Partial<SelfCareTask>) => {
    const all = get<SelfCareTask[]>(KEYS.selfcareTasks, []);
    const idx = all.findIndex(x => x.id === id);
    if (idx >= 0) { all[idx] = { ...all[idx], ...updates }; set(KEYS.selfcareTasks, all); }
  },

  getRelapsePlan: (): RelapsePlan | null => {
    const all = get<RelapsePlan[]>(KEYS.relapsePlan, []);
    return all.length > 0 ? all[0] : null;
  },
  saveRelapsePlan: (p: RelapsePlan) => {
    set(KEYS.relapsePlan, [p]);
  },

  getExistentialLogs: (): ExistentialLog[] => get(KEYS.existentialLogs, []),
  saveExistentialLog: (l: ExistentialLog) => {
    const all = get<ExistentialLog[]>(KEYS.existentialLogs, []);
    all.push(l);
    set(KEYS.existentialLogs, all);
  },

  // Export
  exportAll: () => {
    const data: Record<string, unknown> = {};
    Object.entries(KEYS).forEach(([name, key]) => {
      try { data[name] = JSON.parse(localStorage.getItem(key) || 'null'); } catch { data[name] = null; }
    });
    return data;
  },
};
