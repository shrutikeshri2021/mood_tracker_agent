import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { storage } from './services/storage';
import { calculateBurnout } from './services/burnoutEngine';
import { detectPatterns } from './services/patternDetector';
import { calculateBalance, getBalanceLabel } from './services/balanceScore';
import { forecastMood } from './services/moodForecast';
import type { MoodEntry, MoodType, JournalEntry, ScreenName, BurnoutResult, DetectedPattern, WeeklyReport } from './types';
import { CBTScreen, SafetyPlanScreen, GratitudeScreen, SleepTrackerScreen, GroundingScreen, MedicationScreen, SocialScreen, EnergyBudgetScreen, AffirmationScreen, PMRScreen, CalendarScreen, WorryTimeScreen, SelfCompassionScreen, EmergencyScreen, WellnessScoreScreen } from './features/ClinicalFeatures';
import { PHQ9Screen, GAD7Screen, CognitiveDistortionsScreen, BehavioralActivationScreen, HydrationScreen, SunlightScreen, DBTSkillsScreen, BoundariesScreen, SomaticPainScreen, DigitalWellbeingScreen, BehavioralExperimentScreen, ForgivenessScreen, SelfCareChecklistScreen, RelapsePlanScreen, MeaningExistentialScreen } from './features/DoctorPrescribed';
import { MindfulnessScreen, RecoveryJournalScreen, SoundTherapyScreen, DreamJournalScreen, MoodThermometerScreen, PeerSupportScreen, ValuesClarificationScreen, EmotionWheelScreen, MicroJoyScreen, ExerciseLogScreen, NatureTherapyScreen, LetterTherapyScreen, CompassionFatigueScreen, RecoveryGoalsScreen, WindDownScreen } from './features/AdvancedHealing';

// ─── Dark Theme Colors ───
const C = {
  bg: '#0C0F1A',
  card: 'rgba(15, 23, 42, 0.65)',
  cardBorder: 'rgba(148, 163, 184, 0.1)',
  cardHover: 'rgba(15, 23, 42, 0.8)',
  text: '#E8ECF4',
  textSoft: '#94A3B8',
  textMuted: '#64748B',
  accent: '#8B5CF6',
  accentSoft: 'rgba(139, 92, 246, 0.15)',
  accentBorder: 'rgba(139, 92, 246, 0.25)',
  accentGlow: 'rgba(139, 92, 246, 0.3)',
  blue: '#3B82F6',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  pink: '#F472B6',
  teal: '#14B8A6',
  input: 'rgba(15, 23, 42, 0.8)',
  inputBorder: 'rgba(148, 163, 184, 0.15)',
  divider: 'rgba(148, 163, 184, 0.08)',
};

const MOODS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'happy', emoji: '😊', label: 'Happy', color: '#FBBF24' },
  { type: 'calm', emoji: '😌', label: 'Calm', color: '#34D399' },
  { type: 'neutral', emoji: '😐', label: 'Neutral', color: '#60A5FA' },
  { type: 'anxious', emoji: '😟', label: 'Anxious', color: '#F472B6' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: '#A78BFA' },
  { type: 'angry', emoji: '😤', label: 'Angry', color: '#F87171' },
  { type: 'tired', emoji: '😮‍💨', label: 'Tired', color: '#94A3B8' },
];

const TAGS = ['meeting', 'deadline', 'exercise', 'meditation', 'conflict', 'win', 'overtime', 'rest', 'caffeine', 'social', 'alone', 'creative', 'outdoors', 'travel'];

const JOURNAL_PROMPTS = [
  'What drained me today?', 'What gave me energy?', 'What am I grateful for right now?',
  'What boundary do I need to set?', 'What can I let go of tonight?', 'What went better than expected?',
  'What does my body need right now?', 'What triggered my stress today?',
];

const COPING_SUGGESTIONS: Record<string, string[]> = {
  anxious: ['Try box breathing for 2 minutes 🫁', 'Write down 3 things you can control ✍️', 'Ground yourself with 5-4-3-2-1 senses 🌿'],
  stressed: ['Step away for a 5-minute walk 🚶', 'Do a quick body scan meditation 🧘', 'Write a brain dump in your journal 📝'],
  tired: ['Take a power rest — even 10 minutes help 😴', 'Hydrate and have a healthy snack 💧', 'Gentle stretching can recharge you 🤸'],
  sad: ['Reach out to someone you trust 💬', 'Write about what you\'re feeling ✍️', 'Be gentle with yourself today 💜'],
  angry: ['Take 10 slow deep breaths 🌬️', 'Write it out — don\'t hold it in 📝', 'Physical activity can help release tension 🏃'],
  default: ['Check in with yourself 🌱', 'A short journal entry can help 📝', 'Take 3 conscious breaths 🫁'],
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const ADAPTIVE_THEMES: Record<string, { bg: string; accent: string; glow: string }> = {
  default: { bg: '', accent: '#8B5CF6', glow: 'rgba(139,92,246,0.15)' },
  happy: { bg: '', accent: '#FBBF24', glow: 'rgba(251,191,36,0.12)' },
  calm: { bg: '', accent: '#34D399', glow: 'rgba(52,211,153,0.12)' },
  anxious: { bg: '', accent: '#F472B6', glow: 'rgba(244,114,182,0.12)' },
  sad: { bg: '', accent: '#A78BFA', glow: 'rgba(167,139,250,0.12)' },
  angry: { bg: '', accent: '#F87171', glow: 'rgba(248,113,113,0.08)' },
  tired: { bg: '', accent: '#94A3B8', glow: 'rgba(148,163,184,0.1)' },
};

// ─── Stars Generator ───
function Stars() {
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => {
    const r = Math.random();
    const colorClass = r < 0.15 ? 'star-blue' : r < 0.25 ? 'star-purple' : r < 0.32 ? 'star-gold' : r < 0.45 ? 'star-bright' : '';
    return {
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5, delay: Math.random() * 6, dur: Math.random() * 4 + 2,
      opacity: Math.random() * 0.7 + 0.2, colorClass,
    };
  }), []);
  return (
    <div className="stars-container">
      {stars.map(s => (
        <div key={s.id} className={`star ${s.colorClass}`} style={{
          left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size,
          opacity: s.opacity, animation: `star-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Glass Card ───
function Card({ children, style, onClick, glow, className = '' }: {
  children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void; glow?: boolean; className?: string;
}) {
  return (
    <div onClick={onClick} className={`${glow ? 'glass-card-glow' : 'glass-card'} ${className}`}
      style={{ padding: 20, cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

// ─── Slider ───
function Slider({ label, emoji, value, onChange, colorFrom, colorTo }: {
  label: string; emoji: string; value: number; onChange: (v: number) => void; colorFrom: string; colorTo: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{emoji} {label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: colorTo }}>{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(+e.target.value)}
        style={{ width: '100%', height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})` }} />
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [profileName, setProfileName] = useState('');
  const [adaptiveTheme, setAdaptiveTheme] = useState('default');
  const [panicLocked, setPanicLocked] = useState(false);
  const [toast, setToast] = useState('');
  const refreshKey = useRef(0);

  useEffect(() => {
    setEntries(storage.getEntries());
    setJournals(storage.getJournals());
    const p = storage.getProfile();
    setProfileName(p.name);
    const savedTheme = storage.getAdaptiveTheme();
    if (savedTheme !== 'default') setAdaptiveTheme(savedTheme);
  }, []);

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); }, []);
  const refreshData = useCallback(() => { setEntries(storage.getEntries()); setJournals(storage.getJournals()); refreshKey.current++; }, []);
  const updateAdaptive = useCallback((mood: string) => { const t = ADAPTIVE_THEMES[mood] ? mood : 'default'; setAdaptiveTheme(t); storage.saveAdaptiveTheme(t); }, []);
  // Theme accent used for adaptive UI
  const _currentTheme = ADAPTIVE_THEMES[adaptiveTheme] || ADAPTIVE_THEMES.default;
  void _currentTheme;

  const burnout = useMemo(() => calculateBurnout(entries, journals), [entries, journals]);
  const patterns = useMemo(() => detectPatterns(entries), [entries]);
  const balanceScore = useMemo(() => calculateBalance(entries), [entries]);
  const balanceInfo = useMemo(() => getBalanceLabel(balanceScore), [balanceScore]);
  const forecast = useMemo(() => forecastMood(entries), [entries]);

  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    const sorted = entries.slice().sort((a, b) => b.timestamp - a.timestamp);
    let count = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 90; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (sorted.some(e => new Date(e.timestamp).toDateString() === d.toDateString())) count++;
      else if (i > 0) break;
    }
    return count;
  }, [entries]);

  if (panicLocked) return <PanicScreen onUnlock={() => setPanicLocked(false)} />;

  const nav = (s: ScreenName) => setScreen(s);
  const hideNav = ['checkin', 'locked', 'grounding', 'pmr'].includes(screen);

  return (
    <div className="app-container">
      <div className="cosmic-bg" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />
      <div className="nebula nebula-4" />
      <Stars />

      {toast && <div className="toast animate-slideUp">{toast}</div>}

      <div style={{ position: 'relative', zIndex: 2, paddingBottom: hideNav ? 0 : 90 }}>
        <div className="animate-fadeInUp dark-wrap" key={screen}>
          {screen === 'home' && <HomeScreen name={profileName} entries={entries} burnout={burnout} balanceScore={balanceScore} balanceInfo={balanceInfo} streak={streak} forecast={forecast} patterns={patterns} nav={nav} onPanic={() => setPanicLocked(true)} />}
          {screen === 'advanced-pack-1' && <AdvPack title="Mindfulness & Recovery" subtitle="Calm practices and deeper reflection" nav={nav} items={[
            { icon: '🧘', label: 'Mindfulness MBSR', screen: 'mindfulness' as ScreenName, desc: 'Guided sessions' },
            { icon: '📖', label: 'Recovery Journal', screen: 'recovery-journal' as ScreenName, desc: 'Narrative therapy' },
            { icon: '🎵', label: 'Sound Therapy', screen: 'sound-therapy' as ScreenName, desc: 'Binaural beats' },
            { icon: '🌙', label: 'Dream Journal', screen: 'dream-journal' as ScreenName, desc: 'Subconscious insight' },
          ]} />}
          {screen === 'advanced-pack-2' && <AdvPack title="Emotional Insight" subtitle="Understand patterns and feelings" nav={nav} items={[
            { icon: '🌡️', label: 'Mood Thermometer', screen: 'mood-thermometer' as ScreenName, desc: 'Visual check-in' },
            { icon: '🦋', label: 'Values (ACT)', screen: 'values' as ScreenName, desc: 'Clarify what matters' },
            { icon: '🎨', label: 'Emotion Wheel', screen: 'emotion-wheel' as ScreenName, desc: 'Name your feelings' },
            { icon: '✨', label: 'Micro Joy', screen: 'micro-joy' as ScreenName, desc: 'Positive moments' },
          ]} />}
          {screen === 'advanced-pack-3' && <AdvPack title="Support & Movement" subtitle="Social and body-based recovery" nav={nav} items={[
            { icon: '🤝', label: 'Peer Support', screen: 'peer-support' as ScreenName, desc: 'Ask for help scripts' },
            { icon: '🏃', label: 'Exercise & Mood', screen: 'exercise-log' as ScreenName, desc: 'Movement therapy' },
            { icon: '🌿', label: 'Nature Therapy', screen: 'nature-therapy' as ScreenName, desc: 'Green prescriptions' },
            { icon: '💌', label: 'Letter Therapy', screen: 'letter-therapy' as ScreenName, desc: 'Emotional release' },
          ]} />}
          {screen === 'advanced-pack-4' && <AdvPack title="Focused Recovery" subtitle="Structured prevention and plans" nav={nav} items={[
            { icon: '🫀', label: 'Compassion Fatigue', screen: 'compassion-fatigue' as ScreenName, desc: 'For over-givers' },
            { icon: '🎯', label: 'Recovery Goals', screen: 'recovery-goals' as ScreenName, desc: 'SMART healing plan' },
            { icon: '🌙', label: 'Wind-Down Ritual', screen: 'wind-down' as ScreenName, desc: 'Pre-sleep protocol' },
          ]} />}
          {screen === 'checkin' && <CheckInScreen onSave={(e) => { storage.saveEntry(e); refreshData(); updateAdaptive(e.mood); showToast('✅ Check-in saved!'); nav('home'); }} onCancel={() => nav('home')} />}
          {screen === 'journal' && <JournalScreen journals={journals} onSave={(j) => { storage.saveJournal(j); refreshData(); showToast('📝 Journal saved!'); }} onDelete={(id) => { storage.deleteJournal(id); refreshData(); showToast('🗑️ Deleted'); }} />}
          {screen === 'insights' && <InsightsScreen entries={entries} patterns={patterns} burnout={burnout} balanceScore={balanceScore} balanceInfo={balanceInfo} nav={nav} />}
          {screen === 'profile' && <ProfileScreen name={profileName} entries={entries} journals={journals} streak={streak} onNameChange={(n) => { setProfileName(n); const p = storage.getProfile(); p.name = n; storage.saveProfile(p); }} onClear={() => { storage.clearAll(); refreshData(); setProfileName(''); showToast('🗑️ All data cleared'); }} onExport={() => { const d = storage.exportAll(); const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `zenithme-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(u); showToast('📥 Exported!'); }} nav={nav} />}
          {screen === 'burnout' && <BurnoutScreen burnout={burnout} entries={entries} nav={nav} />}
          {screen === 'patterns' && <PatternsScreen patterns={patterns} nav={nav} />}
          {screen === 'breathing' && <BreathingScreen onComplete={() => showToast('🫁 Session complete!')} nav={nav} />}
          {screen === 'report' && <ReportScreen entries={entries} journals={journals} nav={nav} showToast={showToast} />}
          {screen === 'achievements' && <AchievementsScreen entries={entries} journals={journals} nav={nav} />}
          {screen === 'panic-setup' && <PanicSetupScreen onSave={(pin) => { storage.savePanicPin(pin); showToast('🔒 PIN set!'); nav('profile'); }} nav={nav} />}
          {screen === 'cbt' && <CBTScreen nav={nav} showToast={showToast} />}
          {screen === 'safety-plan' && <SafetyPlanScreen nav={nav} showToast={showToast} />}
          {screen === 'gratitude' && <GratitudeScreen nav={nav} showToast={showToast} />}
          {screen === 'sleep-tracker' && <SleepTrackerScreen nav={nav} showToast={showToast} />}
          {screen === 'grounding' && <GroundingScreen nav={nav} showToast={showToast} />}
          {screen === 'medications' && <MedicationScreen nav={nav} showToast={showToast} />}
          {screen === 'social' && <SocialScreen nav={nav} showToast={showToast} />}
          {screen === 'energy-budget' && <EnergyBudgetScreen nav={nav} showToast={showToast} />}
          {screen === 'affirmations' && <AffirmationScreen nav={nav} showToast={showToast} />}
          {screen === 'pmr' && <PMRScreen nav={nav} showToast={showToast} />}
          {screen === 'calendar' && <CalendarScreen nav={nav} entries={entries} />}
          {screen === 'worry-time' && <WorryTimeScreen nav={nav} showToast={showToast} />}
          {screen === 'self-compassion' && <SelfCompassionScreen nav={nav} showToast={showToast} />}
          {screen === 'emergency' && <EmergencyScreen nav={nav} showToast={showToast} />}
          {screen === 'wellness-score' && <WellnessScoreScreen nav={nav} showToast={showToast} />}
          {screen === 'phq9' && <PHQ9Screen onBack={() => nav('profile')} showToast={showToast} />}
          {screen === 'gad7' && <GAD7Screen onBack={() => nav('profile')} showToast={showToast} />}
          {screen === 'distortions' && <CognitiveDistortionsScreen onBack={() => nav('home')} showToast={showToast} />}
          {screen === 'activation' && <BehavioralActivationScreen onBack={() => nav('home')} showToast={showToast} />}
          {screen === 'hydration' && <HydrationScreen onBack={() => nav('home')} showToast={showToast} />}
          {screen === 'sunlight' && <SunlightScreen onBack={() => nav('home')} showToast={showToast} />}
          {screen === 'dbt' && <DBTSkillsScreen onBack={() => nav('home')} showToast={showToast} />}
          {screen === 'boundaries' && <BoundariesScreen onBack={() => nav('profile')} showToast={showToast} />}
          {screen === 'pain-map' && <SomaticPainScreen onBack={() => nav('home')} showToast={showToast} />}
          {screen === 'experiment' && <BehavioralExperimentScreen onBack={() => nav('home')} showToast={showToast} />}
          {screen === 'selfcare-checklist' && <SelfCareChecklistScreen onBack={() => nav('home')} showToast={showToast} />}
          {screen === 'relapse' && <RelapsePlanScreen onBack={() => nav('profile')} showToast={showToast} />}
          {screen === 'meaning' && <MeaningExistentialScreen onBack={() => nav('profile')} showToast={showToast} />}
          {screen === 'digital-limits' && <DigitalWellbeingScreen onBack={() => nav('home')} showToast={showToast} />}
          {screen === 'forgiveness' && <ForgivenessScreen onBack={() => nav('home')} showToast={showToast} />}
          {screen === 'mindfulness' && <MindfulnessScreen nav={nav} showToast={showToast} />}
          {screen === 'recovery-journal' && <RecoveryJournalScreen nav={nav} showToast={showToast} />}
          {screen === 'sound-therapy' && <SoundTherapyScreen nav={nav} showToast={showToast} />}
          {screen === 'dream-journal' && <DreamJournalScreen nav={nav} showToast={showToast} />}
          {screen === 'mood-thermometer' && <MoodThermometerScreen nav={nav} showToast={showToast} />}
          {screen === 'peer-support' && <PeerSupportScreen nav={nav} showToast={showToast} />}
          {screen === 'values' && <ValuesClarificationScreen nav={nav} showToast={showToast} />}
          {screen === 'emotion-wheel' && <EmotionWheelScreen nav={nav} showToast={showToast} />}
          {screen === 'micro-joy' && <MicroJoyScreen nav={nav} showToast={showToast} />}
          {screen === 'exercise-log' && <ExerciseLogScreen nav={nav} showToast={showToast} />}
          {screen === 'nature-therapy' && <NatureTherapyScreen nav={nav} showToast={showToast} />}
          {screen === 'letter-therapy' && <LetterTherapyScreen nav={nav} showToast={showToast} />}
          {screen === 'compassion-fatigue' && <CompassionFatigueScreen nav={nav} showToast={showToast} />}
          {screen === 'recovery-goals' && <RecoveryGoalsScreen nav={nav} showToast={showToast} />}
          {screen === 'wind-down' && <WindDownScreen nav={nav} showToast={showToast} />}
        </div>
      </div>

      {/* Bottom Nav */}
      {!hideNav && (
        <nav className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '8px 0 env(safe-area-inset-bottom, 8px)', zIndex: 50, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {([
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'journal', icon: '📝', label: 'Journal' },
            { id: 'checkin', icon: '➕', label: '' },
            { id: 'insights', icon: '📊', label: 'Insights' },
            { id: 'profile', icon: '👤', label: 'Profile' },
          ] as const).map(item => (
            item.id === 'checkin' ? (
              <button key={item.id} onClick={() => nav(item.id)} className="fab-button">
                <span style={{ fontSize: 26, color: '#fff' }}>➕</span>
              </button>
            ) : (
              <button key={item.id} onClick={() => nav(item.id)} className={`nav-btn ${screen === item.id ? 'nav-btn-active' : 'nav-btn-inactive'}`}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 10, fontWeight: screen === item.id ? 700 : 500, color: screen === item.id ? C.accent : C.textMuted }}>{item.label}</span>
              </button>
            )
          ))}
        </nav>
      )}
    </div>
  );
}

// ─── Home Screen ───
function HomeScreen({ name, entries, burnout, balanceScore, balanceInfo, streak, forecast, patterns, nav, onPanic }: {
  name: string; entries: MoodEntry[]; burnout: BurnoutResult; balanceScore: number;
  balanceInfo: { label: string; emoji: string; color: string }; streak: number;
  forecast: ReturnType<typeof forecastMood>; patterns: DetectedPattern[];
  nav: (s: ScreenName) => void; onPanic: () => void;
}) {
  const [activeToolTab, setActiveToolTab] = useState(0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const todayEntry = entries.find(e => new Date(e.timestamp).toDateString() === new Date().toDateString());
  const latestMood = entries.length > 0 ? entries.sort((a, b) => b.timestamp - a.timestamp)[0] : null;
  const copingKey = latestMood ? (latestMood.stress > 6 ? 'stressed' : latestMood.mood === 'happy' || latestMood.mood === 'calm' ? 'default' : latestMood.mood) : 'default';
  const copings = COPING_SUGGESTIONS[copingKey] || COPING_SUGGESTIONS.default;
  const recentEntries = entries.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const toolTabs = [
    { label: '🏥 Clinical', items: [
      { icon: '🧠', label: 'CBT Records', screen: 'cbt' as ScreenName, color: '#A78BFA' },
      { icon: '🌿', label: 'Grounding', screen: 'grounding' as ScreenName, color: '#34D399' },
      { icon: '🧘', label: 'PMR', screen: 'pmr' as ScreenName, color: '#60A5FA' },
      { icon: '💚', label: 'Self-Compassion', screen: 'self-compassion' as ScreenName, color: '#34D399' },
      { icon: '📋', label: 'Worry Time', screen: 'worry-time' as ScreenName, color: '#FBBF24' },
      { icon: '🛡️', label: 'Safety Plan', screen: 'safety-plan' as ScreenName, color: '#F472B6' },
    ]},
    { label: '🌸 Wellness', items: [
      { icon: '🙏', label: 'Gratitude', screen: 'gratitude' as ScreenName, color: '#FBBF24' },
      { icon: '🌙', label: 'Sleep', screen: 'sleep-tracker' as ScreenName, color: '#60A5FA' },
      { icon: '💊', label: 'Meds', screen: 'medications' as ScreenName, color: '#F472B6' },
      { icon: '👥', label: 'Social', screen: 'social' as ScreenName, color: '#34D399' },
      { icon: '🥄', label: 'Energy', screen: 'energy-budget' as ScreenName, color: '#FBBF24' },
      { icon: '💜', label: 'Affirm', screen: 'affirmations' as ScreenName, color: '#A78BFA' },
      { icon: '📅', label: 'Calendar', screen: 'calendar' as ScreenName, color: '#60A5FA' },
      { icon: '✨', label: 'Wellness', screen: 'wellness-score' as ScreenName, color: '#34D399' },
      { icon: '📞', label: 'Emergency', screen: 'emergency' as ScreenName, color: '#EF4444' },
    ]},
  ];

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* ── HERO HEADER ── */}
      <div className="animate-fadeInUp" style={{
        padding: '32px 20px 28px',
        background: 'linear-gradient(180deg, rgba(139,92,246,0.12) 0%, transparent 100%)',
        borderRadius: '0 0 32px 32px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 12, color: C.textMuted, margin: 0, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>{today}</p>
            <h1 className="gradient-text" style={{ fontSize: 26, fontWeight: 800, margin: '8px 0 0', lineHeight: 1.2 }}>
              {greeting}{name ? `,` : ''} ✨
            </h1>
            {name && <p style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '2px 0 0' }}>{name}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => nav('achievements')} style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>🏆</button>
            <button onClick={onPanic} style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>🔒</button>
          </div>
        </div>

        {/* Inline Balance + Streak + Burnout row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20 }}>
          <div style={{
            textAlign: 'center', padding: '14px 8px', borderRadius: 18,
            background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(12px)',
            border: `1px solid ${balanceInfo.color}30`,
          }}>
            <div style={{ position: 'relative', width: 44, height: 44, margin: '0 auto 6px' }}>
              <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={balanceInfo.color} strokeWidth="10"
                  strokeDasharray="314" strokeDashoffset={314 - (314 * balanceScore / 100)} strokeLinecap="round" className="animate-gauge" />
              </svg>
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 12, fontWeight: 800, color: balanceInfo.color }}>{balanceScore}</span>
            </div>
            <p style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Balance</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: balanceInfo.color, margin: '2px 0 0' }}>{balanceInfo.emoji}</p>
          </div>
          <div style={{
            textAlign: 'center', padding: '14px 8px', borderRadius: 18,
            background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}>
            <p style={{ fontSize: 32, margin: '0 0 2px', lineHeight: 1 }}>🔥</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#FBBF24', margin: 0 }}>{streak}</p>
            <p style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>Streak</p>
          </div>
          <div onClick={() => nav('burnout')} style={{
            textAlign: 'center', padding: '14px 8px', borderRadius: 18, cursor: 'pointer',
            background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(12px)',
            border: `1px solid ${burnout.level === 'low' ? 'rgba(52,211,153,0.2)' : burnout.level === 'moderate' ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            <p style={{ fontSize: 32, margin: '0 0 2px', lineHeight: 1 }}>{burnout.level === 'low' ? '🟢' : burnout.level === 'moderate' ? '🟡' : burnout.level === 'high' ? '🟠' : '🔴'}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>{burnout.score}</p>
            <p style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>Burnout</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* ── QUICK ACTIONS - Horizontal scroll ── */}
        <div className="animate-fadeInUp delay-100 no-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
          {[
            { emoji: '✨', label: todayEntry ? 'Check In Again' : 'Check In', screen: 'checkin' as ScreenName, bg: 'linear-gradient(135deg, #8B5CF6, #6366F1)' },
            { emoji: '🫁', label: 'Breathe', screen: 'breathing' as ScreenName, bg: 'linear-gradient(135deg, #10B981, #059669)' },
            { emoji: '📝', label: 'Journal', screen: 'journal' as ScreenName, bg: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
            { emoji: '📋', label: 'Report', screen: 'report' as ScreenName, bg: 'linear-gradient(135deg, #F59E0B, #D97706)' },
            { emoji: '📊', label: 'Patterns', screen: 'patterns' as ScreenName, bg: 'linear-gradient(135deg, #A78BFA, #7C3AED)' },
          ].map(a => (
            <button key={a.label} onClick={() => nav(a.screen)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '14px 18px', borderRadius: 18, border: 'none', cursor: 'pointer',
              background: a.bg, minWidth: 80, flexShrink: 0,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}>
              <span style={{ fontSize: 24 }}>{a.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* ── FORECAST CARD ── */}
        {forecast && (
          <Card className="animate-fadeInUp delay-200" style={{ marginBottom: 16, padding: 16, background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(139,92,246,0.08))', borderColor: 'rgba(251,191,36,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)', fontSize: 28, flexShrink: 0,
              }}>{MOODS.find(m => m.type === forecast.predicted)?.emoji || '🌤️'}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>🔮 Tomorrow's Forecast</p>
                <p style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: '4px 0 0' }}>{MOODS.find(m => m.type === forecast.predicted)?.label || 'Unknown'}</p>
                <p style={{ fontSize: 11, color: C.textSoft, margin: '2px 0 0' }}>{forecast.reason} · {forecast.confidence}%</p>
              </div>
            </div>
          </Card>
        )}

        {/* ── RECENT MOOD TIMELINE ── */}
        {recentEntries.length > 0 && (
          <div className="animate-fadeInUp delay-200" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 1.5 }}>Recent Moods</p>
              <button onClick={() => nav('calendar')} style={{ background: 'none', border: 'none', fontSize: 11, fontWeight: 700, color: C.accent, cursor: 'pointer' }}>See All →</button>
            </div>
            <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {recentEntries.map(e => {
                const m = MOODS.find(mo => mo.type === e.mood);
                const d = new Date(e.timestamp);
                return (
                  <div key={e.id} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '10px 14px', borderRadius: 16, flexShrink: 0, minWidth: 64,
                    background: `${m?.color || '#8B5CF6'}10`, border: `1px solid ${m?.color || '#8B5CF6'}20`,
                  }}>
                    <span style={{ fontSize: 22 }}>{m?.emoji || '🌤️'}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: m?.color || C.text }}>{m?.label}</span>
                    <span style={{ fontSize: 9, color: C.textMuted }}>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SUGGESTIONS ── */}
        <div className="animate-fadeInUp delay-300" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1.5 }}>🧘 Today's Suggestions</p>
          {copings.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              background: 'rgba(139,92,246,0.06)', borderRadius: 14, marginBottom: 8,
              border: '1px solid rgba(139,92,246,0.12)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {c.includes('breathing') || c.includes('breath') ? '🫁' : c.includes('walk') ? '🚶' : c.includes('journal') || c.includes('Write') ? '✍️' : c.includes('stretch') ? '🤸' : c.includes('rest') ? '😴' : c.includes('Hydrate') ? '💧' : '💡'}
              </div>
              <p style={{ fontSize: 13, color: '#C4B5FD', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>{c}</p>
            </div>
          ))}
        </div>

        {/* ── PATTERNS ── */}
        {patterns.length > 0 && (
          <Card className="animate-fadeInUp delay-300" onClick={() => nav('patterns')} style={{ marginBottom: 20, borderColor: 'rgba(167,139,250,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 1.5 }}>📊 Detected Patterns</p>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>View →</span>
            </div>
            {patterns.slice(0, 2).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '8px 10px', borderRadius: 12, background: 'rgba(148,163,184,0.04)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{p.emoji}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{p.title}</p>
                  <p style={{ fontSize: 11, color: C.textSoft, margin: '2px 0 0' }}>{p.description.slice(0, 55)}…</p>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* ── TOOLS with TABS ── */}
        <div className="animate-fadeInUp delay-400" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1.5 }}>🧰 Your Toolkit</p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {toolTabs.map((tab, i) => (
              <button key={tab.label} onClick={() => setActiveToolTab(i)} style={{
                padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: activeToolTab === i ? '1px solid rgba(139,92,246,0.4)' : `1px solid ${C.inputBorder}`,
                background: activeToolTab === i ? 'rgba(139,92,246,0.15)' : 'rgba(15,23,42,0.4)',
                color: activeToolTab === i ? '#C4B5FD' : C.textMuted,
                transition: 'all 0.25s ease',
              }}>{tab.label}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {toolTabs[activeToolTab].items.map(t => (
              <div key={t.label} onClick={() => nav(t.screen)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 6px',
                borderRadius: 16, cursor: 'pointer', transition: 'all 0.25s ease',
                background: `${t.color}08`, border: `1px solid ${t.color}15`,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${t.color}15`, border: `1px solid ${t.color}20`, fontSize: 20,
                }}>{t.icon}</div>
                <span style={{ fontSize: 10, fontWeight: 600, color: t.color, textAlign: 'center', lineHeight: 1.2 }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── ADVANCED HEALING - Dropdown style ── */}
        <div className="animate-fadeInUp delay-400" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1.5 }}>🌟 Advanced Healing</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: '🧘', title: 'Mindfulness', desc: 'MBSR · Sound · Dreams', screen: 'advanced-pack-1' as ScreenName, c1: '#8B5CF6', c2: '#6366F1' },
              { icon: '🌡️', title: 'Insight', desc: 'ACT · Emotions · Joy', screen: 'advanced-pack-2' as ScreenName, c1: '#F472B6', c2: '#EC4899' },
              { icon: '🤝', title: 'Support', desc: 'Peers · Exercise · Nature', screen: 'advanced-pack-3' as ScreenName, c1: '#10B981', c2: '#059669' },
              { icon: '🎯', title: 'Recovery', desc: 'Goals · Rest · Ritual', screen: 'advanced-pack-4' as ScreenName, c1: '#3B82F6', c2: '#2563EB' },
            ].map(g => (
              <button key={g.title} onClick={() => nav(g.screen)} style={{
                textAlign: 'left', padding: '16px 14px', borderRadius: 18, cursor: 'pointer',
                border: 'none', position: 'relative', overflow: 'hidden',
                background: `linear-gradient(145deg, ${g.c1}18, ${g.c2}08)`,
              }}>
                <div style={{
                  position: 'absolute', top: -10, right: -10, width: 50, height: 50, borderRadius: '50%',
                  background: `${g.c1}10`, filter: 'blur(12px)',
                }} />
                <span style={{ fontSize: 26, display: 'block', marginBottom: 8, position: 'relative' }}>{g.icon}</span>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text, position: 'relative' }}>{g.title}</p>
                <p style={{ margin: '3px 0 0', fontSize: 10, color: C.textMuted, position: 'relative' }}>{g.desc}</p>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: g.c1 }}>Explore</span>
                  <span style={{ fontSize: 12, color: g.c1 }}>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── DAILY TIP ── */}
        <div className="animate-fadeInUp delay-400" style={{
          padding: '14px 16px', borderRadius: 16, marginBottom: 16,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(52,211,153,0.04))',
          border: '1px solid rgba(52,211,153,0.1)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: 12, color: C.textSoft, margin: 0, lineHeight: 1.5 }}>
            {['Small acts of self-care add up to big healing over time.', 'Even 2 minutes of breathing can reset your nervous system.', 'Your body keeps the score — listen to what it tells you.', 'Progress isn\'t linear. Be patient with yourself today.', 'Naming your emotions is the first step to mastering them.', 'Rest is not laziness — it\'s recovery.', 'You don\'t have to be productive to be worthy.'][new Date().getDay()]}
          </p>
        </div>

        <p style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', padding: '4px 20px', lineHeight: 1.5 }}>
          ⚕️ ZenithMe is a self-care tool, not a medical service.
        </p>
      </div>
    </div>
  );
}

// ─── Advanced Pack Screen ───
function AdvPack({ title, subtitle, items, nav }: { title: string; subtitle: string; items: { icon: string; label: string; desc: string; screen: ScreenName }[]; nav: (s: ScreenName) => void }) {
  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <button onClick={() => nav('home')} style={{ background: 'none', border: 'none', fontSize: 16, color: C.textSoft, cursor: 'pointer', fontWeight: 600 }}>← Back</button>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>{title}</h2>
        <div style={{ width: 64 }} />
      </div>
      <Card style={{ marginBottom: 14, padding: 14, background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.05))' }}>
        <p style={{ margin: 0, fontSize: 13, color: C.textSoft }}>{subtitle}</p>
      </Card>
      <div style={{ display: 'grid', gap: 10 }}>
        {items.map(item => (
          <Card key={item.label} onClick={() => nav(item.screen)} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: `1px solid ${C.accentBorder}` }}>{item.icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>{item.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textMuted }}>{item.desc}</p>
            </div>
            <span style={{ marginLeft: 'auto', color: C.textMuted, fontSize: 16 }}>›</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Check-In ───
function CheckInScreen({ onSave, onCancel }: { onSave: (e: MoodEntry) => void; onCancel: () => void }) {
  const [mood, setMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [workload, setWorkload] = useState(5);
  const [focus, setFocus] = useState(5);
  const [social, setSocial] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [triggers, setTriggers] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>(() => { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; });
  const [step, setStep] = useState(0);
  const toggleTag = (t: string) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const handleSave = () => { if (!mood) return; onSave({ id: uid(), mood, moodIntensity: intensity, stress, energy, sleep, workload, focus, socialBattery: social, tags, notes, timeOfDay, triggers, timestamp: Date.now() }); };

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 16, color: C.textSoft, cursor: 'pointer', fontWeight: 600 }}>← Back</button>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>Check-In</h2>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {[0, 1, 2].map(i => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= i ? C.accent : 'rgba(148,163,184,0.15)', transition: 'background 0.3s' }} />))}
      </div>

      {step === 0 && (
        <div className="animate-fadeInUp">
          <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 8px', textAlign: 'center' }}>How are you feeling? 🌸</h3>
          <p style={{ fontSize: 14, color: C.textSoft, textAlign: 'center', margin: '0 0 24px' }}>Select the emotion closest to right now</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
            {(['morning', 'afternoon', 'evening'] as const).map(t => (
              <button key={t} onClick={() => setTimeOfDay(t)} style={{ padding: '8px 16px', borderRadius: 20, border: timeOfDay === t ? `2px solid ${C.accent}` : `1px solid ${C.inputBorder}`, background: timeOfDay === t ? C.accentSoft : C.input, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: C.text }}>
                {t === 'morning' ? '🌅' : t === 'afternoon' ? '☀️' : '🌙'} {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
            {MOODS.map(m => (
              <button key={m.type} onClick={() => setMood(m.type)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 14,
                borderRadius: 16, border: mood === m.type ? `2px solid ${m.color}` : `1px solid ${C.inputBorder}`,
                background: mood === m.type ? `${m.color}20` : C.input, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 32 }}>{m.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: mood === m.type ? m.color : C.textSoft }}>{m.label}</span>
              </button>
            ))}
          </div>
          {mood && (
            <div className="animate-scaleIn">
              <Slider label="Intensity" emoji="💫" value={intensity} onChange={setIntensity} colorFrom="rgba(139,92,246,0.3)" colorTo="#8B5CF6" />
              <button onClick={() => setStep(1)} style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>Continue →</button>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="animate-fadeInUp">
          <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 20px' }}>Rate your levels 📊</h3>
          <Slider label="Stress" emoji="😰" value={stress} onChange={setStress} colorFrom="rgba(52,211,153,0.3)" colorTo="#F87171" />
          <Slider label="Energy" emoji="⚡" value={energy} onChange={setEnergy} colorFrom="rgba(251,191,36,0.3)" colorTo="#FBBF24" />
          <Slider label="Sleep" emoji="😴" value={sleep} onChange={setSleep} colorFrom="rgba(96,165,250,0.3)" colorTo="#34D399" />
          <Slider label="Workload" emoji="📋" value={workload} onChange={setWorkload} colorFrom="rgba(52,211,153,0.3)" colorTo="#F87171" />
          <Slider label="Focus" emoji="🎯" value={focus} onChange={setFocus} colorFrom="rgba(251,191,36,0.3)" colorTo="#60A5FA" />
          <Slider label="Social Battery" emoji="👥" value={social} onChange={setSocial} colorFrom="rgba(167,139,250,0.3)" colorTo="#FBBF24" />
          <button onClick={() => setStep(2)} style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', marginTop: 8 }}>Continue →</button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fadeInUp">
          <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>What's going on? 🏷️</h3>
          <p style={{ fontSize: 13, color: C.textSoft, margin: '0 0 16px' }}>Select any tags that apply</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {TAGS.map(t => (
              <button key={t} onClick={() => toggleTag(t)} style={{ padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: tags.includes(t) ? `2px solid ${C.accent}` : `1px solid ${C.inputBorder}`, background: tags.includes(t) ? C.accentSoft : C.input, color: tags.includes(t) ? '#C4B5FD' : C.textSoft }}>{t}</button>
            ))}
          </div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>💭 What caused this mood?</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {['work pressure', 'relationship', 'health', 'finances', 'self-doubt', 'positive news', 'achievement', 'nature'].map(t => (
              <button key={t} onClick={() => setTriggers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} style={{ padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: triggers.includes(t) ? '2px solid #F87171' : `1px solid ${C.inputBorder}`, background: triggers.includes(t) ? 'rgba(248,113,113,0.15)' : C.input, color: triggers.includes(t) ? '#FCA5A5' : C.textSoft }}>{t}</button>
            ))}
          </div>
          <textarea placeholder="Add a note..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            style={{ width: '100%', padding: 14, borderRadius: 14, border: `1px solid ${C.inputBorder}`, fontSize: 14, resize: 'none', outline: 'none', background: C.input, color: C.text, marginBottom: 20, boxSizing: 'border-box' }} />
          <button onClick={handleSave} style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}>✨ Save Check-In</button>
        </div>
      )}
    </div>
  );
}

// ─── Journal ───
function JournalScreen({ journals, onSave, onDelete }: { journals: JournalEntry[]; onSave: (j: JournalEntry) => void; onDelete: (id: string) => void }) {
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isVoice, setIsVoice] = useState(false);
  const [voiceEmotion, setVoiceEmotion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported'); return; }
    const rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
    rec.onresult = (ev: any) => { let t = ''; for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript; setContent(t);
      const l = t.toLowerCase();
      if (/angry|frustrated|furious/.test(l)) setVoiceEmotion('angry 😤');
      else if (/sad|crying|depressed/.test(l)) setVoiceEmotion('sad 😢');
      else if (/happy|joy|great/.test(l)) setVoiceEmotion('happy 😊');
      else if (/anxious|worried|nervous/.test(l)) setVoiceEmotion('anxious 😟');
      else if (/calm|peaceful|relaxed/.test(l)) setVoiceEmotion('calm 😌');
      else if (/tired|exhausted/.test(l)) setVoiceEmotion('tired 😮‍💨');
      else setVoiceEmotion('');
    };
    rec.onerror = () => setIsListening(false); rec.onend = () => setIsListening(false);
    rec.start(); recognitionRef.current = rec; setIsListening(true); setIsVoice(true);
  };
  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };
  const handleSave = () => { if (!content.trim()) return; onSave({ id: uid(), title: title || (prompt || 'Free Write'), content, prompt, tags: [], isFavorite: false, isVoice, voiceEmotion, createdAt: Date.now(), updatedAt: Date.now() }); setWriting(false); setTitle(''); setContent(''); setPrompt(''); setIsVoice(false); setVoiceEmotion(''); };
  const sorted = journals.slice().sort((a, b) => b.createdAt - a.createdAt);

  if (writing) return (
    <div style={{ padding: '24px 16px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={() => setWriting(false)} style={{ background: 'none', border: 'none', fontSize: 16, color: C.textSoft, cursor: 'pointer', fontWeight: 600 }}>← Back</button>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>✍️ Write</h2>
        <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save</button>
      </div>
      {prompt && <Card style={{ marginBottom: 16, padding: 14, background: C.accentSoft }}><p style={{ fontSize: 13, fontWeight: 600, color: '#C4B5FD', margin: 0 }}>💡 {prompt}</p></Card>}
      <input placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: 14, borderRadius: 14, border: `1px solid ${C.inputBorder}`, fontSize: 16, fontWeight: 600, marginBottom: 12, background: C.input, outline: 'none', boxSizing: 'border-box', color: C.text }} />
      <textarea placeholder="Write your thoughts..." value={content} onChange={e => setContent(e.target.value)} rows={10} autoFocus style={{ width: '100%', padding: 14, borderRadius: 14, border: `1px solid ${C.inputBorder}`, fontSize: 15, lineHeight: 1.7, resize: 'none', outline: 'none', background: C.input, boxSizing: 'border-box', color: C.text }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={isListening ? stopVoice : startVoice} style={{ flex: 1, padding: 14, borderRadius: 14, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', background: isListening ? 'rgba(248,113,113,0.2)' : C.accentSoft, color: isListening ? '#FCA5A5' : '#C4B5FD' }}>{isListening ? '⏹️ Stop' : '🎤 Voice Journal'}</button>
      </div>
      {voiceEmotion && <Card style={{ marginTop: 12, padding: 12, background: 'rgba(244,114,182,0.1)' }}><p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>🎭 Detected: <span style={{ color: '#F472B6' }}>{voiceEmotion}</span></p></Card>}
    </div>
  );

  return (
    <div style={{ padding: '24px 16px' }}>
      <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>📝 Journal</h2>
      <p style={{ fontSize: 14, color: C.textSoft, margin: '0 0 20px' }}>Your private reflection space</p>
      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {JOURNAL_PROMPTS.map(p => (
          <button key={p} onClick={() => { setPrompt(p); setWriting(true); }} style={{ padding: '10px 16px', borderRadius: 20, border: `1px solid ${C.inputBorder}`, background: C.input, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', color: '#C4B5FD', flexShrink: 0 }}>💡 {p}</button>
        ))}
      </div>
      <button onClick={() => { setPrompt(''); setWriting(true); }} style={{ width: '100%', padding: 16, borderRadius: 16, border: `2px dashed ${C.accentBorder}`, background: C.accentSoft, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#C4B5FD', marginBottom: 24 }}>✨ Start Writing</button>
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}><p style={{ fontSize: 48 }}>📝</p><p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '12px 0 4px' }}>No entries yet</p><p style={{ fontSize: 13, color: C.textSoft }}>Start with a prompt above ✨</p></div>
      ) : sorted.map(j => (
        <Card key={j.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>{j.isVoice && <span style={{ fontSize: 14 }}>🎤</span>}<p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>{j.title}</p></div>
              <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 6px' }}>{new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p style={{ fontSize: 13, color: C.textSoft, margin: 0, lineHeight: 1.5 }}>{j.content.slice(0, 120)}{j.content.length > 120 ? '…' : ''}</p>
              {j.voiceEmotion && <p style={{ fontSize: 11, color: '#F472B6', marginTop: 4 }}>🎭 {j.voiceEmotion}</p>}
            </div>
            <button onClick={() => onDelete(j.id)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', padding: 4, color: C.textMuted }}>🗑️</button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Insights ───
function InsightsScreen({ entries, patterns, burnout, balanceScore, balanceInfo, nav }: { entries: MoodEntry[]; patterns: DetectedPattern[]; burnout: BurnoutResult; balanceScore: number; balanceInfo: { label: string; emoji: string; color: string }; nav: (s: ScreenName) => void }) {
  const last7 = entries.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 7);
  const avgStress = last7.length > 0 ? (last7.reduce((a, e) => a + e.stress, 0) / last7.length).toFixed(1) : '0';
  const avgEnergy = last7.length > 0 ? (last7.reduce((a, e) => a + e.energy, 0) / last7.length).toFixed(1) : '0';
  const avgSleep = last7.length > 0 ? (last7.reduce((a, e) => a + e.sleep, 0) / last7.length).toFixed(1) : '0';
  const moodCounts: Record<string, number> = {}; last7.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
  const tagCounts: Record<string, number> = {}; entries.forEach(e => e.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const triggerCounts: Record<string, number> = {}; entries.forEach(e => e.triggers?.forEach(t => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; }));
  const topTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div style={{ padding: '24px 16px' }}>
      <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>📊 Insights</h2>
      <p style={{ fontSize: 14, color: C.textSoft, margin: '0 0 20px' }}>Your wellness at a glance</p>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}><p style={{ fontSize: 56 }}>📊</p><p style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '16px 0 4px' }}>No data yet</p><p style={{ fontSize: 14, color: C.textSoft }}>Complete your first check-in ✨</p></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[{ label: 'Stress', value: avgStress, emoji: '😰', color: '#F87171' }, { label: 'Energy', value: avgEnergy, emoji: '⚡', color: '#FBBF24' }, { label: 'Sleep', value: avgSleep, emoji: '😴', color: '#34D399' }].map(m => (
              <Card key={m.label} style={{ padding: 14, textAlign: 'center' }}><span style={{ fontSize: 22 }}>{m.emoji}</span><p style={{ fontSize: 22, fontWeight: 800, color: m.color, margin: '4px 0 0' }}>{m.value}</p><p style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase' }}>{m.label}</p></Card>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Card style={{ padding: 16, textAlign: 'center' }}><p style={{ fontSize: 28, margin: 0 }}>{balanceInfo.emoji}</p><p style={{ fontSize: 24, fontWeight: 800, color: balanceInfo.color, margin: '4px 0 0' }}>{balanceScore}%</p><p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>Balance</p></Card>
            <Card onClick={() => nav('burnout')} style={{ padding: 16, textAlign: 'center' }}><p style={{ fontSize: 28, margin: 0 }}>{burnout.level === 'low' ? '🟢' : burnout.level === 'moderate' ? '🟡' : '🟠'}</p><p style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: '4px 0 0' }}>{burnout.score}</p><p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>Burnout</p></Card>
          </div>
          <Card style={{ marginBottom: 16 }}><p className="section-title">MOOD DISTRIBUTION (7 DAYS)</p><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{MOODS.filter(m => moodCounts[m.type]).map(m => (<div key={m.type} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: `${m.color}20`, borderRadius: 12, border: `1px solid ${m.color}30` }}><span style={{ fontSize: 16 }}>{m.emoji}</span><span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{moodCounts[m.type]}</span></div>))}</div></Card>
          {topTags.length > 0 && <Card style={{ marginBottom: 16 }}><p className="section-title">🏷️ TOP TAGS</p>{topTags.map(([tag, count]) => (<div key={tag} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.divider}` }}><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{tag}</span><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: Math.min(count * 20, 100), height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #8B5CF6, #6366F1)' }} /><span style={{ fontSize: 12, fontWeight: 700, color: '#C4B5FD', minWidth: 20, textAlign: 'right' }}>{count}</span></div></div>))}</Card>}
          {topTriggers.length > 0 && <Card style={{ marginBottom: 16 }}><p className="section-title">🔍 TRIGGER ANALYSIS</p>{topTriggers.map(([trigger, count]) => (<div key={trigger} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.divider}` }}><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{trigger}</span><span style={{ fontSize: 12, fontWeight: 700, color: '#FCA5A5', background: 'rgba(248,113,113,0.15)', padding: '2px 10px', borderRadius: 10 }}>{count}×</span></div>))}</Card>}
          {patterns.length > 0 && <Card onClick={() => nav('patterns')} style={{ marginBottom: 16 }}><p className="section-title">📊 PATTERNS</p>{patterns.slice(0, 3).map(p => (<div key={p.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.divider}` }}><p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{p.emoji} {p.title}</p><p style={{ fontSize: 11, color: C.textSoft, margin: '2px 0 0' }}>{p.description.slice(0, 80)}</p></div>))}<p style={{ fontSize: 12, color: C.accent, fontWeight: 600, margin: '8px 0 0' }}>View all →</p></Card>}
          <Card style={{ marginBottom: 16 }}><p className="section-title">📈 BURNOUT TIMELINE</p><BurnoutTimeline entries={entries} /></Card>
        </>
      )}
    </div>
  );
}

function BurnoutTimeline({ entries }: { entries: MoodEntry[] }) {
  const sorted = entries.slice().sort((a, b) => a.timestamp - b.timestamp).slice(-14);
  if (sorted.length < 2) return <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Need more data</p>;
  const phases = sorted.map(e => {
    const s = (e.stress * 0.4 + (10 - e.energy) * 0.3 + (10 - e.sleep) * 0.3);
    if (s <= 3) return { label: 'Calm', color: '#34D399', emoji: '🌿' };
    if (s <= 5) return { label: 'Building', color: '#FBBF24', emoji: '⚡' };
    if (s <= 7) return { label: 'Stress', color: '#F59E0B', emoji: '🔥' };
    return { label: 'Burnout', color: '#EF4444', emoji: '🔴' };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
      {phases.map((p, i) => (<div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><span style={{ fontSize: 10 }}>{p.emoji}</span><div style={{ width: '100%', borderRadius: 4, height: p.label === 'Calm' ? 20 : p.label === 'Building' ? 40 : p.label === 'Stress' ? 60 : 80, background: `linear-gradient(to top, ${p.color}, ${p.color}60)`, transition: 'height 0.5s' }} /><span style={{ fontSize: 8, color: C.textMuted }}>{new Date(sorted[i].timestamp).toLocaleDateString('en-US', { day: 'numeric' })}</span></div>))}
    </div>
  );
}

// ─── Burnout Screen ───
function BurnoutScreen({ burnout, entries, nav }: { burnout: BurnoutResult; entries: MoodEntry[]; nav: (s: ScreenName) => void }) {
  const levelColors = { low: '#34D399', moderate: '#FBBF24', high: '#F59E0B', critical: '#EF4444' };
  const color = levelColors[burnout.level];
  return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => nav('home')} style={{ background: 'none', border: 'none', fontSize: 16, color: C.textSoft, cursor: 'pointer', fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px', textAlign: 'center' }}>🧠 Burnout Prediction</h2>
      {entries.length < 3 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}><p style={{ fontSize: 56 }}>🧠</p><p style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '16px 0 4px' }}>Not enough data</p><p style={{ fontSize: 14, color: C.textSoft }}>Log 3+ check-ins to activate</p></div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', width: 180, height: 180 }}>
              <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10" strokeDasharray="314" strokeDashoffset={314 - (314 * burnout.score / 100)} strokeLinecap="round" className="animate-gauge" />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <p style={{ fontSize: 36, fontWeight: 800, color, margin: 0 }}>{burnout.score}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.textSoft, margin: 0, textTransform: 'uppercase' }}>{burnout.level}</p>
              </div>
            </div>
          </div>
          <Card style={{ marginBottom: 16, textAlign: 'center' }}><p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>Trend: {burnout.trend === 'improving' ? '📈 Improving' : burnout.trend === 'worsening' ? '📉 Worsening' : '→ Stable'}</p></Card>
          {burnout.signals.length > 0 && <div style={{ marginBottom: 16 }}><p className="section-title">ACTIVE SIGNALS</p>{burnout.signals.map((s, i) => (<Card key={i} style={{ marginBottom: 8, padding: 14, borderLeft: `3px solid ${s.severity === 'alert' ? '#EF4444' : s.severity === 'warning' ? '#FBBF24' : '#60A5FA'}` }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>{s.emoji}</span><div><p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{s.name}</p><p style={{ fontSize: 12, color: C.textSoft, margin: '2px 0 0' }}>{s.description}</p></div></div></Card>))}</div>}
          <Card style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))', marginBottom: 16 }}><p style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD', margin: '0 0 8px' }}>💡 Recommendation</p><p style={{ fontSize: 14, color: C.text, margin: 0, lineHeight: 1.6 }}>{burnout.recommendation}</p></Card>
          <p style={{ fontSize: 11, color: C.textMuted, textAlign: 'center', lineHeight: 1.5 }}>⚕️ This is a self-awareness tool, not a medical diagnosis.</p>
        </>
      )}
    </div>
  );
}

// ─── Patterns ───
function PatternsScreen({ patterns, nav }: { patterns: DetectedPattern[]; nav: (s: ScreenName) => void }) {
  const confColors = { emerging: '#60A5FA', confirmed: '#34D399', strong: '#A78BFA' };
  return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => nav('home')} style={{ background: 'none', border: 'none', fontSize: 16, color: C.textSoft, cursor: 'pointer', fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>📊 Emotional Patterns</h2>
      <p style={{ fontSize: 14, color: C.textSoft, margin: '0 0 20px' }}>AI-detected insights from your data</p>
      {patterns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}><p style={{ fontSize: 56 }}>🔍</p><p style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '16px 0 4px' }}>No patterns yet</p><p style={{ fontSize: 14, color: C.textSoft }}>Log 3+ check-ins with tags</p></div>
      ) : patterns.map(p => (
        <Card key={p.id} style={{ marginBottom: 12, borderLeft: `3px solid ${confColors[p.confidence]}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 22 }}>{p.emoji}</span><p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>{p.title}</p></div>
            <span style={{ fontSize: 10, fontWeight: 700, color: confColors[p.confidence], background: `${confColors[p.confidence]}20`, padding: '3px 8px', borderRadius: 8, textTransform: 'uppercase' }}>{p.confidence}</span>
          </div>
          <p style={{ fontSize: 13, color: C.textSoft, margin: 0, lineHeight: 1.5 }}>{p.description}</p>
          <p style={{ fontSize: 11, color: C.textMuted, margin: '6px 0 0' }}>Based on {p.dataPoints} data points</p>
        </Card>
      ))}
    </div>
  );
}

// ─── Breathing ───
function BreathingScreen({ onComplete, nav }: { onComplete: () => void; nav: (s: ScreenName) => void }) {
  const [technique, setTechnique] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'hold2' | 'done'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const techniques: Record<string, { label: string; emoji: string; desc: string; phases: [string, number][] }> = {
    box: { label: 'Box Breathing', emoji: '🫁', desc: 'Equal rhythm for focus', phases: [['inhale', 4], ['hold', 4], ['exhale', 4], ['hold2', 4]] },
    sleep: { label: '4-7-8 Sleep', emoji: '🌙', desc: 'Deep relaxation', phases: [['inhale', 4], ['hold', 7], ['exhale', 8]] },
    coherent: { label: 'Coherent', emoji: '💚', desc: 'Calm nervous system', phases: [['inhale', 5], ['exhale', 5]] },
    energize: { label: 'Energizing', emoji: '⚡', desc: 'Boost alertness', phases: [['inhale', 2], ['hold', 1], ['exhale', 4], ['hold2', 1]] },
  };
  const start = useCallback((tech: string) => { setTechnique(tech); setPhase('idle'); setCycles(0); setTotalSeconds(0); setTimeout(() => runCycle(tech, 0), 300); }, []);
  const runCycle = useCallback((tech: string, cycleNum: number) => {
    const ph = techniques[tech].phases; let pi = 0;
    const run = () => {
      if (cycleNum >= 8) { setPhase('done'); storage.saveBreathingSession({ id: uid(), technique: tech, duration: 0, completedAt: Date.now() }); onComplete(); return; }
      if (pi >= ph.length) { setCycles(c => c + 1); runCycle(tech, cycleNum + 1); return; }
      const [pn, dur] = ph[pi]; setPhase(pn as any); setSeconds(dur); let rem = dur;
      timerRef.current = setInterval(() => { rem--; setTotalSeconds(t => t + 1); setSeconds(rem); if (rem <= 0) { clearInterval(timerRef.current); pi++; run(); } }, 1000);
    }; run();
  }, []);
  useEffect(() => () => { clearInterval(timerRef.current); }, []);
  const stop = () => { clearInterval(timerRef.current); setPhase('idle'); setTechnique(null); };
  const phaseLabel = phase === 'inhale' ? 'Breathe In' : phase === 'exhale' ? 'Breathe Out' : phase === 'hold' || phase === 'hold2' ? 'Hold' : '';
  const phaseColor = phase === 'inhale' ? '#34D399' : phase === 'exhale' ? '#60A5FA' : '#FBBF24';

  if (!technique || phase === 'idle') return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => nav('home')} style={{ background: 'none', border: 'none', fontSize: 16, color: C.textSoft, cursor: 'pointer', fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>🫁 Breathing</h2>
      <p style={{ fontSize: 14, color: C.textSoft, margin: '0 0 20px' }}>Choose a technique</p>
      <div style={{ display: 'grid', gap: 12 }}>
        {Object.entries(techniques).map(([key, t]) => (
          <Card key={key} onClick={() => start(key)} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 36 }}>{t.emoji}</span>
            <div><p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{t.label}</p><p style={{ fontSize: 12, color: C.textSoft, margin: '2px 0 0' }}>{t.desc}</p><p style={{ fontSize: 11, color: C.textMuted, margin: '2px 0 0' }}>{t.phases.map(p => `${p[1]}s`).join(' · ')}</p></div>
          </Card>
        ))}
      </div>
      {(() => { const s = storage.getBreathingSessions(); if (!s.length) return <div style={{ textAlign: 'center', padding: '30px 20px' }}><p style={{ fontSize: 13, color: C.textMuted }}>Sessions appear here ✨</p></div>; return <div style={{ marginTop: 20 }}><p className="section-title">RECENT SESSIONS</p>{s.slice(-5).reverse().map(ss => (<div key={ss.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.divider}` }}><span style={{ fontSize: 13, color: C.text }}>{techniques[ss.technique]?.emoji} {techniques[ss.technique]?.label || ss.technique}</span><span style={{ fontSize: 12, color: C.textMuted }}>{new Date(ss.completedAt).toLocaleDateString()}</span></div>))}</div>; })()}
    </div>
  );
  if (phase === 'done') return (
    <div style={{ padding: '24px 16px', textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 64 }}>🎉</p>
      <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: '16px 0 8px' }}>Well done!</h2>
      <p style={{ fontSize: 16, color: C.textSoft, margin: '0 0 8px' }}>{cycles} cycles</p>
      <p style={{ fontSize: 14, color: C.textMuted }}>{Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s</p>
      <button onClick={() => { setTechnique(null); setPhase('idle'); }} style={{ marginTop: 32, padding: '14px 32px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Done ✨</button>
    </div>
  );
  return (
    <div style={{ padding: '24px 16px', textAlign: 'center', paddingTop: 40 }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: C.textSoft, margin: '0 0 40px' }}>{techniques[technique]?.emoji} {techniques[technique]?.label} · Cycle {cycles + 1}</p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <div className="animate-glow" style={{ width: phase === 'inhale' ? 200 : phase === 'exhale' ? 120 : 160, height: phase === 'inhale' ? 200 : phase === 'exhale' ? 120 : 160, borderRadius: '50%', background: `radial-gradient(circle, ${phaseColor}30, ${phaseColor}10)`, border: `3px solid ${phaseColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transition: 'all 1s ease-in-out' }}>
          <p style={{ fontSize: 42, fontWeight: 800, color: phaseColor, margin: 0 }}>{seconds}</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: '4px 0 0' }}>{phaseLabel}</p>
        </div>
      </div>
      <button onClick={stop} style={{ padding: '14px 32px', borderRadius: 16, border: `2px solid ${C.inputBorder}`, background: C.input, fontSize: 15, fontWeight: 700, cursor: 'pointer', color: C.textSoft }}>Stop Session</button>
    </div>
  );
}

// ─── Report ───
function ReportScreen({ entries, journals, nav, showToast }: { entries: MoodEntry[]; journals: JournalEntry[]; nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [generated, setGenerated] = useState<WeeklyReport | null>(null);
  const generate = () => {
    const now = Date.now(); const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const we = entries.filter(e => e.timestamp >= weekAgo); const wj = journals.filter(j => j.createdAt >= weekAgo);
    if (we.length < 1) { showToast('Need at least 1 check-in'); return; }
    const ms: Record<string, number> = { happy: 10, calm: 8, neutral: 6, tired: 4, anxious: 3, sad: 2, angry: 2 };
    const avgMood = we.reduce((a, e) => a + (ms[e.mood] || 5), 0) / we.length;
    const avgStress = we.reduce((a, e) => a + e.stress, 0) / we.length;
    const avgEnergy = we.reduce((a, e) => a + e.energy, 0) / we.length;
    const avgSleep = we.reduce((a, e) => a + e.sleep, 0) / we.length;
    const bal = calculateBalance(we); const bo = calculateBurnout(we, wj);
    const tagC: Record<string, number> = {}; we.forEach(e => e.tags.forEach(t => { tagC[t] = (tagC[t] || 0) + 1; }));
    const topTags = Object.entries(tagC).sort((a, b) => b[1] - a[1]).slice(0, 3).map(t => t[0]);
    const ds = we.map(e => ({ day: new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'long' }), score: (ms[e.mood] || 5) - e.stress * 0.5 + e.energy * 0.3 }));
    const best = ds.sort((a, b) => b.score - a.score)[0]?.day || '-';
    const hardest = ds.sort((a, b) => a.score - b.score)[0]?.day || '-';
    let insight = avgStress > 7 && avgSleep < 5 ? 'Tough week — high stress with low sleep. 💜' : avgMood > 7 ? 'Strong week! Keep it up ✨' : we.length < 3 ? 'Fewer check-ins this week. That\'s okay 🌱' : avgEnergy < 4 ? 'Low energy. Add more rest 🔋' : 'A balanced week overall 🌿';
    const r: WeeklyReport = { id: uid(), weekStart: new Date(weekAgo).toLocaleDateString(), weekEnd: new Date().toLocaleDateString(), avgMood: Math.round(avgMood * 10) / 10, avgStress: Math.round(avgStress * 10) / 10, avgEnergy: Math.round(avgEnergy * 10) / 10, avgSleep: Math.round(avgSleep * 10) / 10, totalCheckins: we.length, totalJournals: wj.length, topTags, bestDay: best, hardestDay: hardest, insight, burnoutLevel: bo.level, balanceScore: bal, createdAt: Date.now() };
    storage.saveReport(r); setGenerated(r); showToast('📋 Report generated!');
  };
  const past = storage.getReports().slice().sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => nav('home')} style={{ background: 'none', border: 'none', fontSize: 16, color: C.textSoft, cursor: 'pointer', fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>📋 Weekly Report</h2>
      <p style={{ fontSize: 14, color: C.textSoft, margin: '0 0 20px' }}>Your mental health wrapped ✨</p>
      {!generated ? (
        <>
          <button onClick={generate} style={{ width: '100%', padding: 18, borderRadius: 16, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', marginBottom: 24 }}>✨ Generate This Week's Report</button>
          {past.length > 0 && <><p className="section-title">PAST REPORTS</p>{past.map(r => (<Card key={r.id} onClick={() => setGenerated(r)} style={{ marginBottom: 10 }}><p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{r.weekStart} — {r.weekEnd}</p><p style={{ fontSize: 12, color: C.textSoft, margin: '4px 0 0' }}>Balance: {r.balanceScore}% · {r.totalCheckins} check-ins</p></Card>))}</>}
          {past.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px' }}><p style={{ fontSize: 48 }}>📊</p><p style={{ fontSize: 14, color: C.textSoft }}>Generate your first report ✨</p></div>}
        </>
      ) : (
        <div className="animate-fadeInUp">
          <Card glow style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))' }}>
            <p style={{ fontSize: 12, color: C.textSoft, margin: '0 0 4px' }}>{generated.weekStart} — {generated.weekEnd}</p>
            <p className="gradient-text" style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Your Week In Review ✨</p>
          </Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[{ l: 'Mood', v: generated.avgMood.toFixed(1), e: '😊', c: '#FBBF24' }, { l: 'Stress', v: generated.avgStress.toFixed(1), e: '😰', c: '#F87171' }, { l: 'Energy', v: generated.avgEnergy.toFixed(1), e: '⚡', c: '#34D399' }, { l: 'Sleep', v: generated.avgSleep.toFixed(1), e: '😴', c: '#60A5FA' }].map(m => (
              <Card key={m.l} style={{ padding: 14, textAlign: 'center' }}><span style={{ fontSize: 20 }}>{m.e}</span><p style={{ fontSize: 20, fontWeight: 800, color: m.c, margin: '4px 0 0' }}>{m.v}</p><p style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase' }}>{m.l}</p></Card>
            ))}
          </div>
          <Card style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div><p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Check-ins</p><p style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: '2px 0 0' }}>{generated.totalCheckins}</p></div><div><p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Journals</p><p style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: '2px 0 0' }}>{generated.totalJournals}</p></div><div><p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Balance</p><p style={{ fontSize: 18, fontWeight: 800, color: '#C4B5FD', margin: '2px 0 0' }}>{generated.balanceScore}%</p></div></div></Card>
          <Card style={{ marginBottom: 12 }}><p style={{ fontSize: 12, fontWeight: 600, color: C.textSoft, margin: '0 0 6px' }}>🌟 Best: <span style={{ color: C.text }}>{generated.bestDay}</span></p><p style={{ fontSize: 12, fontWeight: 600, color: C.textSoft, margin: 0 }}>💪 Hardest: <span style={{ color: C.text }}>{generated.hardestDay}</span></p></Card>
          <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(139,92,246,0.1))' }}><p style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD', margin: '0 0 6px' }}>💡 Insight</p><p style={{ fontSize: 14, color: C.text, margin: 0, lineHeight: 1.6 }}>{generated.insight}</p></Card>
          <button onClick={() => setGenerated(null)} style={{ width: '100%', padding: 14, borderRadius: 14, border: `1px solid ${C.inputBorder}`, background: C.input, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: C.textSoft }}>← View All Reports</button>
        </div>
      )}
    </div>
  );
}

// ─── Achievements ───
function AchievementsScreen({ entries, journals, nav }: { entries: MoodEntry[]; journals: JournalEntry[]; nav: (s: ScreenName) => void }) {
  const bSessions = storage.getBreathingSessions();
  const sorted = entries.slice().sort((a, b) => b.timestamp - a.timestamp);
  let streak = 0; const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 90; i++) { const d = new Date(today); d.setDate(d.getDate() - i); if (sorted.some(e => new Date(e.timestamp).toDateString() === d.toDateString())) streak++; else if (i > 0) break; }
  const achs = [
    { id: '1', emoji: '🌱', title: 'First Step', desc: 'Log first check-in', progress: Math.min(entries.length, 1), target: 1, cat: 'Consistency' },
    { id: '2', emoji: '🌿', title: 'Three Days', desc: '3-day streak', progress: Math.min(streak, 3), target: 3, cat: 'Consistency' },
    { id: '3', emoji: '🌳', title: 'One Week', desc: '7-day streak', progress: Math.min(streak, 7), target: 7, cat: 'Consistency' },
    { id: '4', emoji: '🏔️', title: 'Fortnight', desc: '14-day streak', progress: Math.min(streak, 14), target: 14, cat: 'Consistency' },
    { id: '5', emoji: '💎', title: 'Month Strong', desc: '30-day streak', progress: Math.min(streak, 30), target: 30, cat: 'Consistency' },
    { id: '6', emoji: '🫁', title: 'First Breath', desc: 'Complete breathing session', progress: Math.min(bSessions.length, 1), target: 1, cat: 'Self-Care' },
    { id: '7', emoji: '🌬️', title: 'Breath Builder', desc: '10 sessions', progress: Math.min(bSessions.length, 10), target: 10, cat: 'Self-Care' },
    { id: '8', emoji: '✍️', title: 'First Words', desc: 'Write first journal', progress: Math.min(journals.length, 1), target: 1, cat: 'Reflection' },
    { id: '9', emoji: '📖', title: 'Story Weaver', desc: '10 journal entries', progress: Math.min(journals.length, 10), target: 10, cat: 'Reflection' },
    { id: '10', emoji: '📊', title: 'Data Driven', desc: '10 check-ins', progress: Math.min(entries.length, 10), target: 10, cat: 'Growth' },
    { id: '11', emoji: '🏅', title: 'Quarter Century', desc: '25 check-ins', progress: Math.min(entries.length, 25), target: 25, cat: 'Growth' },
    { id: '12', emoji: '🌟', title: 'Half Century', desc: '50 check-ins', progress: Math.min(entries.length, 50), target: 50, cat: 'Growth' },
  ];
  const unlocked = achs.filter(a => a.progress >= a.target).length;
  return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => nav('home')} style={{ background: 'none', border: 'none', fontSize: 16, color: C.textSoft, cursor: 'pointer', fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>🏆 Achievements</h2>
      <p style={{ fontSize: 14, color: C.textSoft, margin: '0 0 6px' }}>Every step counts 💜</p>
      <Card glow style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD', margin: '0 0 8px' }}>{unlocked} of {achs.length} milestones</p>
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(148,163,184,0.15)' }}><div style={{ height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #8B5CF6, #6366F1)', width: `${(unlocked / achs.length) * 100}%`, transition: 'width 0.5s' }} /></div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {achs.map(a => { const done = a.progress >= a.target; return (
          <Card key={a.id} style={{ padding: 16, textAlign: 'center', opacity: done ? 1 : 0.5, background: done ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))' : C.card, borderColor: done ? 'rgba(251,191,36,0.3)' : C.cardBorder }}>
            <span style={{ fontSize: 32, filter: done ? 'none' : 'grayscale(1)' }}>{a.emoji}</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '6px 0 2px' }}>{a.title}</p>
            <p style={{ fontSize: 10, color: C.textMuted, margin: '0 0 8px' }}>{a.desc}</p>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(148,163,184,0.15)' }}><div style={{ height: 4, borderRadius: 2, background: done ? '#FBBF24' : '#8B5CF6', width: `${Math.min((a.progress / a.target) * 100, 100)}%` }} /></div>
            <p style={{ fontSize: 10, color: C.textMuted, margin: '4px 0 0' }}>{a.progress}/{a.target}</p>
          </Card>
        ); })}
      </div>
    </div>
  );
}

// ─── Profile ───
function ProfileScreen({ name, entries, journals, streak, onNameChange, onClear, onExport, nav }: {
  name: string; entries: MoodEntry[]; journals: JournalEntry[]; streak: number;
  onNameChange: (n: string) => void; onClear: () => void; onExport: () => void; nav: (s: ScreenName) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [confirmClear, setConfirmClear] = useState(false);
  const [notifStatus, setNotifStatus] = useState('default');
  useEffect(() => { if ('Notification' in window) setNotifStatus(Notification.permission); }, []);
  const requestNotifs = async () => { if ('Notification' in window) { const p = await Notification.requestPermission(); setNotifStatus(p); if (p === 'granted') new Notification('🌸 ZenithMe', { body: 'Notifications enabled!' }); } };
  return (
    <div style={{ padding: '24px 16px' }}>
      <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: '0 0 20px' }}>👤 Profile</h2>
      <Card glow style={{ marginBottom: 16, textAlign: 'center', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(16,185,129,0.05))' }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}><span style={{ fontSize: 32, color: '#fff' }}>{name ? name[0].toUpperCase() : '🌸'}</span></div>
        {editing ? (
          <div style={{ display: 'flex', gap: 8 }}><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Your name" style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.inputBorder}`, fontSize: 15, outline: 'none', background: C.input, color: C.text }} /><button onClick={() => { onNameChange(newName); setEditing(false); }} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Save</button></div>
        ) : (<><p style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>{name || 'Set your name'}</p><button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: '#C4B5FD', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>Edit ✏️</button></>)}
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[{ v: entries.length, l: 'Check-ins' }, { v: journals.length, l: 'Journals' }, { v: streak, l: 'Streak' }].map(s => (
          <Card key={s.l} style={{ padding: 14, textAlign: 'center' }}><p style={{ fontSize: 22, fontWeight: 800, color: '#C4B5FD', margin: 0 }}>{s.v}</p><p style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase' }}>{s.l}</p></Card>
        ))}
      </div>
      <Card style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>🔔 Notifications</p><p style={{ fontSize: 11, color: C.textMuted, margin: '2px 0 0' }}>{notifStatus === 'granted' ? 'Enabled ✅' : notifStatus === 'denied' ? 'Blocked' : 'Not enabled'}</p></div>
        {notifStatus !== 'granted' && notifStatus !== 'denied' && <button onClick={requestNotifs} style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Enable</button>}
      </Card>
      {[
        { icon: '🏆', label: 'Achievements', action: () => nav('achievements') },
        { icon: '📅', label: 'Mood Calendar', action: () => nav('calendar') },
        { icon: '📞', label: 'Emergency Contacts', action: () => nav('emergency') },
        { icon: '🛡️', label: 'Safety Plan', action: () => nav('safety-plan') },
        { icon: '🔒', label: 'Set Panic PIN', action: () => nav('panic-setup') },
        { icon: '📥', label: 'Export Data', action: onExport },
      ].map(a => (
        <Card key={a.label} onClick={a.action} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
          <span style={{ fontSize: 20 }}>{a.icon}</span>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{a.label}</p>
          <span style={{ marginLeft: 'auto', color: C.textMuted, fontSize: 16 }}>›</span>
        </Card>
      ))}
      {!confirmClear ? (
        <button onClick={() => setConfirmClear(true)} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', fontSize: 14, fontWeight: 600, color: '#FCA5A5', cursor: 'pointer', marginTop: 16 }}>🗑️ Clear All Data</button>
      ) : (
        <Card style={{ marginTop: 16, background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#FCA5A5', margin: '0 0 8px' }}>⚠️ Delete everything?</p>
          <p style={{ fontSize: 12, color: C.textSoft, margin: '0 0 12px' }}>All data will be permanently removed.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { onClear(); setConfirmClear(false); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Delete Everything</button>
            <button onClick={() => setConfirmClear(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.inputBorder}`, background: C.input, fontWeight: 700, cursor: 'pointer', color: C.textSoft }}>Cancel</button>
          </div>
        </Card>
      )}
      <Card style={{ marginTop: 16, background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD', margin: '0 0 6px' }}>🔒 Privacy</p>
        <p style={{ fontSize: 12, color: C.textSoft, margin: 0, lineHeight: 1.6 }}>All data stored locally. Nothing sent to any server. 100% private.</p>
      </Card>
      <p style={{ fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 20 }}>⚕️ ZenithMe is a self-care tool, not a medical service.</p>
    </div>
  );
}

// ─── Panic Screen ───
function PanicScreen({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('');
  const [display, setDisplay] = useState('0');
  const [showUnlock, setShowUnlock] = useState(false);
  const savedPin = storage.getPanicPin();
  const handleCalcPress = (val: string) => { if (val === 'C') { setDisplay('0'); setInput(''); return; } if (val === '=') { try { const r = Function(`"use strict"; return (${display})`)(); setDisplay(String(r)); } catch { setDisplay('Error'); } return; } setDisplay(prev => prev === '0' ? val : prev + val); };
  const handleUnlock = () => { if (!savedPin) { onUnlock(); return; } setShowUnlock(true); };
  if (showUnlock) return (
    <div style={{ minHeight: '100vh', background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <p style={{ fontSize: 36 }}>🔒</p><p style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '12px 0 20px' }}>Enter PIN</p>
      <input type="password" value={input} onChange={e => setInput(e.target.value)} maxLength={6} autoFocus style={{ padding: 14, fontSize: 24, textAlign: 'center', borderRadius: 14, border: `1px solid ${C.inputBorder}`, width: 160, outline: 'none', letterSpacing: 8, background: C.input, color: C.text }} />
      <button onClick={() => { if (input === savedPin) onUnlock(); else { setInput(''); alert('Wrong PIN'); } }} style={{ marginTop: 16, padding: '12px 32px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Unlock</button>
    </div>
  );
  return (
    <div style={{ minHeight: '100vh', background: '#111827', display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '20px 0' }}><p style={{ fontSize: 48, fontWeight: 300, color: C.text, margin: 0, wordBreak: 'break-all' }}>{display}</p></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '←', '='].map(btn => (
            <button key={btn} onClick={() => handleCalcPress(btn === '×' ? '*' : btn === '÷' ? '/' : btn === '←' ? '' : btn)} style={{ padding: 18, fontSize: 20, fontWeight: 500, borderRadius: 16, border: 'none', cursor: 'pointer', background: btn === '=' ? '#F59E0B' : ['C', '(', ')', '÷', '×', '-', '+', '←'].includes(btn) ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.08)', color: btn === '=' ? '#111827' : C.text }}>{btn}</button>
          ))}
        </div>
        <button onClick={handleUnlock} style={{ marginTop: 20, padding: 12, background: 'none', border: 'none', fontSize: 12, color: C.textMuted, cursor: 'pointer' }}>•</button>
      </div>
    </div>
  );
}

// ─── Panic Setup ───
function PanicSetupScreen({ onSave, nav }: { onSave: (pin: string) => void; nav: (s: ScreenName) => void }) {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState(0);
  return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => nav('profile')} style={{ background: 'none', border: 'none', fontSize: 16, color: C.textSoft, cursor: 'pointer', fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>🚨 Panic Mode Setup</h2>
      <p style={{ fontSize: 14, color: C.textSoft, margin: '0 0 24px', lineHeight: 1.6 }}>Tap 🔒 on home to hide the app behind a calculator. Set a PIN to get back in.</p>
      {step === 0 ? (
        <>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>Set a 4-6 digit PIN</p>
          <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter PIN" maxLength={6} autoFocus style={{ width: '100%', padding: 16, fontSize: 24, textAlign: 'center', borderRadius: 16, border: `1px solid ${C.inputBorder}`, outline: 'none', letterSpacing: 8, boxSizing: 'border-box', background: C.input, color: C.text }} />
          {pin.length >= 4 && <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: 16, padding: 16, borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Continue</button>}
        </>
      ) : (
        <>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>Confirm PIN</p>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Confirm" maxLength={6} autoFocus style={{ width: '100%', padding: 16, fontSize: 24, textAlign: 'center', borderRadius: 16, border: `1px solid ${C.inputBorder}`, outline: 'none', letterSpacing: 8, boxSizing: 'border-box', background: C.input, color: C.text }} />
          {confirm.length >= 4 && <button onClick={() => { if (pin === confirm) onSave(pin); else { setConfirm(''); alert("PINs don't match"); } }} style={{ width: '100%', marginTop: 16, padding: 16, borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Save PIN 🔒</button>}
        </>
      )}
    </div>
  );
}
