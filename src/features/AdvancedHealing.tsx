import { useState, useEffect, useRef } from 'react';
import { storage } from '../services/storage';
import type { ScreenName, MindfulnessSession, RecoveryJournalEntry, SoundTherapySession, DreamEntry, MoodThermometerEntry, PeerSupportScript, ValuesClarification, EmotionWheelEntry, MicroJoyEntry, ExerciseLog, NatureTherapyLog, LetterTherapyEntry, CompassionFatigueLog, RecoveryGoal, GoalMilestone, WindDownRitual, WindDownStep } from '../types';

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const C = ({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) => (
  <div onClick={onClick} style={{ background: 'rgba(12, 18, 35, 0.65)', backdropFilter: 'blur(16px)', borderRadius: 22, border: '1px solid rgba(100, 120, 180, 0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 20, cursor: onClick ? 'pointer' : 'default', marginBottom: 14, ...style }}>
    {children}
  </div>
);

const Hdr = ({ emoji, title, sub, onBack }: { emoji: string; title: string; sub: string; onBack: () => void }) => (
  <div style={{ paddingBottom: 20 }}>
    <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: '#94A3B8', cursor: 'pointer', fontWeight: 600, marginBottom: 16, padding: 0 }}>← Back</button>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(16,185,129,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{emoji}</div>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E2E8F0', margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: '3px 0 0', lineHeight: 1.4 }}>{sub}</p>
      </div>
    </div>
  </div>
);

const Inp = ({ placeholder, value, onChange, multiline, rows }: { placeholder: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number }) => {
  const s: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 14, border: '1.5px solid rgba(100,120,180,0.2)', fontSize: 14, outline: 'none', background: 'rgba(15,20,40,0.8)', boxSizing: 'border-box', fontFamily: 'inherit', color: '#E2E8F0', marginBottom: 12 };
  if (multiline) return <textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} rows={rows || 3} style={{ ...s, resize: 'none', lineHeight: 1.6 }} />;
  return <input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={s} />;
};

const Btn = ({ label, onClick, color, disabled, small }: { label: string; onClick: () => void; color?: string; disabled?: boolean; small?: boolean }) => (
  <button onClick={onClick} disabled={disabled} style={{ width: small ? 'auto' : '100%', padding: small ? '10px 20px' : 15, borderRadius: 14, border: 'none', fontSize: small ? 13 : 15, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', background: disabled ? '#d0c8e0' : `linear-gradient(135deg, ${color || '#8a6cf0'}, ${color ? color + 'bb' : '#6c4fd8'})`, color: '#fff', boxShadow: disabled ? 'none' : `0 4px 18px ${color || '#8a6cf0'}35`, marginTop: 8, opacity: disabled ? 0.7 : 1 }}>{label}</button>
);

const Lbl = ({ text }: { text: string }) => <p style={{ fontSize: 12, fontWeight: 700, color: '#5C4D76', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 8px' }}>{text}</p>;

const Chip = ({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) => (
  <button onClick={onClick} style={{ padding: '7px 14px', borderRadius: 20, border: active ? `2px solid ${color || '#8a6cf0'}` : '1.5px solid #e0d8f0', background: active ? `${color || '#8a6cf0'}15` : '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#2e244c', margin: '0 6px 6px 0' }}>{label}</button>
);

const Sld = ({ label, emoji, value, onChange, max, color }: { label: string; emoji: string; value: number; onChange: (v: number) => void; max?: number; color?: string }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#2e244c' }}>{emoji} {label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: color || '#8a6cf0' }}>{value}/{max || 10}</span>
    </div>
    <input type="range" min={1} max={max || 10} value={value} onChange={e => onChange(+e.target.value)} style={{ width: '100%', height: 6, borderRadius: 3, appearance: 'none', background: `linear-gradient(90deg, #eadbff, ${color || '#8a6cf0'})`, outline: 'none', cursor: 'pointer' }} />
  </div>
);

const Empty = ({ emoji, title, sub }: { emoji: string; title: string; sub: string }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div style={{ fontSize: 52, marginBottom: 12 }}>{emoji}</div>
    <p style={{ fontSize: 17, fontWeight: 700, color: '#2e244c', margin: '0 0 8px' }}>{title}</p>
    <p style={{ fontSize: 13, color: '#5C4D76', lineHeight: 1.6 }}>{sub}</p>
  </div>
);



// ─── 1. MINDFULNESS MBSR TIMER ───
export function MindfulnessScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [sessions, setSessions] = useState<MindfulnessSession[]>([]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [technique, setTechnique] = useState('Body Scan');
  const [duration, setDuration] = useState(10);
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(5);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setSessions(storage.getMindfulnessSessions()); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const techniques = ['Body Scan 🧘', 'Sitting Meditation 🪷', 'Mindful Walking 🚶', 'Loving-Kindness 💚', 'Mountain Meditation 🏔️', 'Lake Meditation 🌊', 'Breath Awareness 🫁', 'Open Awareness 🌌'];

  const start = () => {
    setRunning(true); setElapsed(0); setDone(false);
    timerRef.current = setInterval(() => {
      setElapsed(p => {
        if (p + 1 >= duration * 60) {
          clearInterval(timerRef.current!); setRunning(false); setDone(true); return p + 1;
        }
        return p + 1;
      });
    }, 1000);
  };

  const stop = () => { if (timerRef.current) clearInterval(timerRef.current); setRunning(false); };

  const save = () => {
    const s: MindfulnessSession = { id: uid(), week: Math.ceil((sessions.length + 1) / 7), day: sessions.length + 1, technique, durationMinutes: Math.floor(elapsed / 60) || duration, mindfulnessBefore: before, mindfulnessAfter: after, notes, completedAt: Date.now() };
    storage.saveMindfulnessSession(s);
    setSessions(storage.getMindfulnessSessions());
    showToast('🧘 Mindfulness session saved!');
    setDone(false); setElapsed(0); setNotes('');
  };

  const mm = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const ss = (elapsed % 60).toString().padStart(2, '0');
  const progress = Math.min((elapsed / (duration * 60)) * 100, 100);

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🧘" title="Mindfulness Practice" sub="MBSR-inspired guided sessions for daily calm" onBack={() => nav('home')} />

      <C>
        <Lbl text="Choose technique" />
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {techniques.map(t => <Chip key={t} label={t} active={technique === t.replace(/ [^\s]+$/, '')} onClick={() => setTechnique(t.replace(/ [^\s]+$/, ''))} />)}
        </div>
        <div style={{ marginTop: 12 }}>
          <Lbl text="Duration" />
          <div style={{ display: 'flex', gap: 8 }}>
            {[5, 10, 15, 20, 30].map(d => <Chip key={d} label={`${d}m`} active={duration === d} onClick={() => setDuration(d)} />)}
          </div>
        </div>
      </C>

      {!done && (
        <C style={{ textAlign: 'center' }}>
          <div style={{ width: 140, height: 140, borderRadius: 70, background: running ? 'linear-gradient(135deg,#eadbff,#cbf3e5)' : '#f8f5ff', border: `6px solid ${running ? '#8a6cf0' : '#e0d8f0'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', transition: 'all 0.3s', boxShadow: running ? '0 0 30px rgba(138,108,240,0.25)' : 'none' }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#2e244c', fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</span>
            <span style={{ fontSize: 11, color: '#5C4D76', fontWeight: 600 }}>{running ? 'Breathe...' : 'Ready'}</span>
          </div>
          <div style={{ height: 6, background: '#f0ecf7', borderRadius: 3, marginBottom: 16 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#8a6cf0,#cbf3e5)', borderRadius: 3, transition: 'width 1s linear' }} />
          </div>
          {!running ? <Btn label="▶ Begin Session" onClick={start} /> : <Btn label="⏹ End Session" onClick={stop} color="#e74c3c" />}
        </C>
      )}

      {done && (
        <C style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#2e244c', margin: '0 0 4px' }}>🎉 Session Complete!</p>
          <p style={{ fontSize: 13, color: '#5C4D76', margin: '0 0 16px' }}>{duration} minutes of mindfulness — your nervous system thanks you.</p>
          <Sld label="Mindfulness After" emoji="🧘" value={after} onChange={setAfter} color="#22c55e" />
          <Inp placeholder="How do you feel now? (optional)" value={notes} onChange={setNotes} multiline rows={2} />
          <Btn label="💾 Save Session" onClick={save} color="#22c55e" />
        </C>
      )}

      <C>
        <Lbl text="Mindfulness Before" />
        <Sld label="Mindfulness Level" emoji="🌿" value={before} onChange={setBefore} />
      </C>

      <C>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Lbl text="Recent Sessions" />
          <span style={{ fontSize: 12, color: '#8a6cf0', fontWeight: 600 }}>{sessions.length} total</span>
        </div>
        {sessions.length === 0 ? <Empty emoji="🌿" title="Start your practice" sub="Complete your first session to begin your mindfulness journey" /> :
          sessions.slice(-5).reverse().map(s => (
            <div key={s.id} style={{ padding: '12px 14px', background: '#f8f5ff', borderRadius: 14, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2e244c' }}>🧘 {s.technique}</span>
                <span style={{ fontSize: 11, color: '#8a6cf0', fontWeight: 600 }}>{s.durationMinutes}m</span>
              </div>
              <div style={{ fontSize: 11, color: '#5C4D76', marginTop: 3 }}>Mindfulness: {s.mindfulnessBefore} → {s.mindfulnessAfter} • {new Date(s.completedAt).toLocaleDateString()}</div>
            </div>
          ))}
      </C>
    </div>
  );
}

// ─── 2. RECOVERY JOURNAL (NARRATIVE THERAPY) ───
export function RecoveryJournalScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [entries, setEntries] = useState<RecoveryJournalEntry[]>([]);
  const [oldStory, setOldStory] = useState('');
  const [newStory, setNewStory] = useState('');
  const [strengths, setStrengths] = useState('');
  const [chapter, setChapter] = useState('');

  useEffect(() => { setEntries(storage.getRecoveryJournal()); }, []);

  const save = () => {
    if (!oldStory.trim() || !newStory.trim()) return;
    const e: RecoveryJournalEntry = { id: uid(), oldStory, newStory, strengths: strengths.split(',').map(s => s.trim()).filter(Boolean), chapter, createdAt: Date.now() };
    storage.saveRecoveryJournal(e);
    setEntries(storage.getRecoveryJournal());
    showToast('📖 Recovery story saved!');
    setOldStory(''); setNewStory(''); setStrengths(''); setChapter('');
  };

  const del = (id: string) => { storage.deleteRecoveryJournal(id); setEntries(storage.getRecoveryJournal()); showToast('🗑️ Deleted'); };

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="📖" title="Recovery Journal" sub="Rewrite your story — Narrative Therapy approach" onBack={() => nav('home')} />

      <C style={{ background: 'linear-gradient(135deg,#fdf2f8,#f3e8ff)', border: '1px solid #e0d8f0' }}>
        <p style={{ fontSize: 13, color: '#5C4D76', margin: '0 0 4px', fontWeight: 600 }}>💡 How This Works</p>
        <p style={{ fontSize: 12, color: '#5C4D76', lineHeight: 1.7 }}>Narrative therapy separates you from your problems. You are not your diagnosis or struggle — you are the author of your story. Rewrite your narrative using your strengths.</p>
      </C>

      <C>
        <Lbl text="Chapter / Theme" />
        <Inp placeholder="e.g. The chapter where I faced burnout..." value={chapter} onChange={setChapter} />
        <Lbl text="The old story (problem-saturated)" />
        <Inp placeholder="How did you used to see this situation? What story were you telling yourself?" value={oldStory} onChange={setOldStory} multiline rows={3} />
        <Lbl text="The new story (strength-based)" />
        <Inp placeholder="How would you rewrite this using your resilience and wisdom?" value={newStory} onChange={setNewStory} multiline rows={3} />
        <Lbl text="Strengths you showed (comma separated)" />
        <Inp placeholder="e.g. courage, persistence, self-awareness" value={strengths} onChange={setStrengths} />
        <Btn label="📖 Save Story Chapter" onClick={save} disabled={!oldStory.trim() || !newStory.trim()} />
      </C>

      <C>
        <Lbl text="Your Recovery Story" />
        {entries.length === 0 ? <Empty emoji="📖" title="Your story begins here" sub="Write your first chapter of recovery and transformation" /> :
          entries.slice().reverse().map(e => (
            <div key={e.id} style={{ borderLeft: '3px solid #8a6cf0', paddingLeft: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '0 0 4px' }}>📌 {e.chapter || 'My Chapter'}</p>
                <button onClick={() => del(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#999' }}>🗑️</button>
              </div>
              <p style={{ fontSize: 11, color: '#e74c3c', margin: '0 0 4px', fontWeight: 600 }}>Old story: {e.oldStory.slice(0, 80)}...</p>
              <p style={{ fontSize: 11, color: '#22c55e', margin: '0 0 4px', fontWeight: 600 }}>New story: {e.newStory.slice(0, 80)}...</p>
              {e.strengths.length > 0 && <p style={{ fontSize: 10, color: '#8a6cf0', margin: 0 }}>💪 {e.strengths.join(' · ')}</p>}
              <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0' }}>{new Date(e.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
      </C>
    </div>
  );
}

// ─── 3. SOUND THERAPY ───
export function SoundTherapyScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [sessions, setSessions] = useState<SoundTherapySession[]>([]);
  const [selected, setSelected] = useState<typeof SOUNDS[0] | null>(null);
  const [duration, setDuration] = useState(10);
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(5);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SOUNDS = [
    { name: 'Alpha Waves', hz: 10, emoji: '🌊', desc: '8-13 Hz: Relaxation, calm focus', color: '#4D96FF', benefit: 'Reduces anxiety, promotes calm alertness' },
    { name: 'Theta Waves', hz: 6, emoji: '🌙', desc: '4-8 Hz: Deep meditation, creativity', color: '#8a6cf0', benefit: 'Deep relaxation, enhanced creativity' },
    { name: 'Delta Waves', hz: 2, emoji: '😴', desc: '0.5-4 Hz: Deep sleep, healing', color: '#2e244c', benefit: 'Promotes deep sleep and physical healing' },
    { name: 'Gamma Waves', hz: 40, emoji: '⚡', desc: '30-100 Hz: Cognitive enhancement', color: '#FFD93D', benefit: 'Improves focus, memory, and cognition' },
    { name: 'Nature: Rain', hz: 0, emoji: '🌧️', desc: 'White noise / pink noise', color: '#6BCB77', benefit: 'Reduces stress, masks distracting sounds' },
    { name: 'Nature: Forest', hz: 0, emoji: '🌿', desc: 'Green noise / nature sounds', color: '#22c55e', benefit: 'Grounding, reduces cortisol' },
    { name: 'Solfeggio 528Hz', hz: 528, emoji: '🎵', desc: 'Love frequency', color: '#FF6B6B', benefit: 'DNA repair, emotional healing (traditional)' },
    { name: 'Solfeggio 432Hz', hz: 432, emoji: '🪗', desc: 'Natural tuning', color: '#f59e0b', benefit: 'Harmony, natural resonance (traditional)' },
  ];

  useEffect(() => { setSessions(storage.getSoundTherapySessions()); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const start = () => {
    if (!selected) return;
    setRunning(true); setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(p => {
        if (p + 1 >= duration * 60) { clearInterval(timerRef.current!); setRunning(false); return p; }
        return p + 1;
      });
    }, 1000);
  };

  const finish = () => {
    if (!selected) return;
    const s: SoundTherapySession = { id: uid(), soundType: selected.name, frequencyHz: selected.hz, durationMinutes: Math.max(1, Math.floor(elapsed / 60)), moodBefore: before, moodAfter: after, completedAt: Date.now() };
    storage.saveSoundTherapySession(s);
    setSessions(storage.getSoundTherapySessions());
    showToast('🎵 Sound therapy session saved!');
    setRunning(false); setElapsed(0); setSelected(null);
  };

  const progress = selected ? Math.min((elapsed / (duration * 60)) * 100, 100) : 0;

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🎵" title="Sound Therapy" sub="Frequency-based mood regulation & healing" onBack={() => nav('home')} />

      <C style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#166534', margin: '0 0 4px' }}>🔊 Note</p>
        <p style={{ fontSize: 12, color: '#166534', lineHeight: 1.6 }}>Use headphones for binaural beats to work. These tones play through your device speaker but are most effective with earphones.</p>
      </C>

      <C>
        <Lbl text="Choose Sound / Frequency" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SOUNDS.map(s => (
            <div key={s.name} onClick={() => setSelected(s)} style={{ padding: '12px 14px', borderRadius: 16, border: selected?.name === s.name ? `2px solid ${s.color}` : '1.5px solid #e0d8f0', background: selected?.name === s.name ? `${s.color}15` : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2e244c', margin: '0 0 2px' }}>{s.name}</p>
              <p style={{ fontSize: 10, color: '#5C4D76', margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </C>

      {selected && (
        <C style={{ background: `${selected.color}12`, border: `1px solid ${selected.color}30` }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 4px' }}>{selected.emoji} {selected.name}</p>
          <p style={{ fontSize: 12, color: '#5C4D76', margin: '0 0 12px' }}>✨ {selected.benefit}</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[5, 10, 20, 30].map(d => <Chip key={d} label={`${d}m`} active={duration === d} onClick={() => setDuration(d)} color={selected.color} />)}
          </div>
          {running && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: '#2e244c', marginBottom: 8 }}>
                {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
              </div>
              <div style={{ height: 6, background: '#f0ecf7', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${selected.color}, #cbf3e5)`, borderRadius: 3, transition: 'width 1s linear' }} />
              </div>
            </div>
          )}
          {!running ? (
            <>
              <Sld label="Mood Before" emoji="😊" value={before} onChange={setBefore} color={selected.color} />
              <Btn label="▶ Start Sound Session" onClick={start} color={selected.color} />
            </>
          ) : (
            <>
              <Sld label="Mood After" emoji="✨" value={after} onChange={setAfter} color={selected.color} />
              <Btn label="✅ Finish & Save" onClick={finish} color="#22c55e" />
            </>
          )}
        </C>
      )}

      <C>
        <Lbl text="Recent Sessions" />
        {sessions.length === 0 ? <Empty emoji="🎵" title="No sessions yet" sub="Complete your first sound therapy session" /> :
          sessions.slice(-4).reverse().map(s => (
            <div key={s.id} style={{ padding: '10px 14px', background: '#f8f5ff', borderRadius: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', margin: 0 }}>{s.soundType}</p>
                <p style={{ fontSize: 11, color: '#5C4D76', margin: '2px 0 0' }}>Mood: {s.moodBefore} → {s.moodAfter} • {s.durationMinutes}m</p>
              </div>
              <span style={{ fontSize: 11, color: '#999' }}>{new Date(s.completedAt).toLocaleDateString()}</span>
            </div>
          ))}
      </C>
    </div>
  );
}

// ─── 4. DREAM JOURNAL ───
export function DreamJournalScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [symbols, setSymbols] = useState('');
  const [sleep, setSleep] = useState(7);
  const [recurring, setRecurring] = useState(false);

  const EMOTIONS = ['Joy', 'Fear', 'Confusion', 'Peace', 'Anxiety', 'Sadness', 'Excitement', 'Nostalgia', 'Anger', 'Love', 'Awe', 'Dread'];

  useEffect(() => { setEntries(storage.getDreamEntries()); }, []);

  const save = () => {
    if (!content.trim()) return;
    const e: DreamEntry = { id: uid(), title: title || 'Untitled Dream', content, emotions, symbols: symbols.split(',').map(s => s.trim()).filter(Boolean), sleepQuality: sleep, isRecurring: recurring, createdAt: Date.now() };
    storage.saveDreamEntry(e);
    setEntries(storage.getDreamEntries());
    showToast('🌙 Dream journaled!');
    setTitle(''); setContent(''); setEmotions([]); setSymbols(''); setSleep(7); setRecurring(false);
  };

  const del = (id: string) => { storage.deleteDreamEntry(id); setEntries(storage.getDreamEntries()); };

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🌙" title="Dream Journal" sub="Record dreams to understand your subconscious" onBack={() => nav('home')} />

      <C style={{ background: 'linear-gradient(135deg,#1e1b4b10,#312e8115)', border: '1px solid #c7d2fe' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#312e81', margin: '0 0 4px' }}>🧠 Science of Dreams</p>
        <p style={{ fontSize: 12, color: '#3730a3', lineHeight: 1.6 }}>Dreams process emotional memories and prepare us for future challenges. Recurring dreams often reflect unresolved stress. Journaling dreams increases self-awareness and emotional processing.</p>
      </C>

      <C>
        <Lbl text="Dream Title" />
        <Inp placeholder="Give this dream a name..." value={title} onChange={setTitle} />
        <Lbl text="Dream Content" />
        <Inp placeholder="Describe what happened in as much detail as you can remember..." value={content} onChange={setContent} multiline rows={5} />
        <Lbl text="Emotions in the dream" />
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
          {EMOTIONS.map(e => <Chip key={e} label={e} active={emotions.includes(e)} onClick={() => setEmotions(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])} />)}
        </div>
        <Lbl text="Symbols / Objects (comma separated)" />
        <Inp placeholder="e.g. water, house, running, flying" value={symbols} onChange={setSymbols} />
        <Sld label="Sleep Quality Last Night" emoji="😴" value={sleep} onChange={setSleep} color="#312e81" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button onClick={() => setRecurring(r => !r)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: recurring ? '#8a6cf0' : '#e0d8f0', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
            <span style={{ position: 'absolute', top: 2, left: recurring ? 22 : 2, width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2e244c' }}>Recurring dream</span>
        </div>
        <Btn label="🌙 Save Dream" onClick={save} disabled={!content.trim()} color="#312e81" />
      </C>

      <C>
        <Lbl text={`Dream Archive (${entries.length})`} />
        {entries.length === 0 ? <Empty emoji="🌙" title="No dreams recorded" sub="Journal your first dream to start understanding your subconscious" /> :
          entries.slice().reverse().map(e => (
            <div key={e.id} style={{ borderLeft: `3px solid ${e.isRecurring ? '#f59e0b' : '#8a6cf0'}`, paddingLeft: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: 0 }}>{e.isRecurring ? '🔄 ' : '🌙 '}{e.title}</p>
                <button onClick={() => del(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#ccc' }}>🗑️</button>
              </div>
              <p style={{ fontSize: 12, color: '#5C4D76', margin: '4px 0', lineHeight: 1.5 }}>{e.content.slice(0, 100)}...</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {e.emotions.map(em => <span key={em} style={{ fontSize: 10, background: '#eadbff', color: '#5C4D76', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{em}</span>)}
              </div>
              <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0' }}>{new Date(e.createdAt).toLocaleDateString()} • Sleep: {e.sleepQuality}/10</p>
            </div>
          ))}
      </C>
    </div>
  );
}

// ─── 5. MOOD THERMOMETER ───
export function MoodThermometerScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [history, setHistory] = useState<MoodThermometerEntry[]>([]);
  const [level, setLevel] = useState(5);
  const [note, setNote] = useState('');

  const LEVELS = [
    { min: 9, max: 10, color: '#ef4444', emoji: '🔴', label: 'Overwhelming', bodyTip: 'Seek support immediately — call a trusted person' },
    { min: 7, max: 8, color: '#f97316', emoji: '🟠', label: 'Very Distressed', bodyTip: 'Use grounding: 5-4-3-2-1 technique now' },
    { min: 5, max: 6, color: '#eab308', emoji: '🟡', label: 'Struggling', bodyTip: 'Try box breathing — 4-4-4-4 counts' },
    { min: 3, max: 4, color: '#84cc16', emoji: '🟢', label: 'Mild Discomfort', bodyTip: 'A short walk or gentle stretch can help' },
    { min: 1, max: 2, color: '#22c55e', emoji: '💚', label: 'Calm & Balanced', bodyTip: 'Wonderful! Notice what contributed to this.' },
  ];

  const getLevelInfo = (l: number) => LEVELS.find(x => l >= x.min && l <= x.max) || LEVELS[2];
  const info = getLevelInfo(level);

  useEffect(() => { setHistory(storage.getMoodThermometer()); }, []);

  const save = () => {
    const entry: MoodThermometerEntry = { id: uid(), level, bodyLocation: info.label, color: info.color, note, timestamp: Date.now() };
    storage.saveMoodThermometer(entry);
    setHistory(storage.getMoodThermometer());
    showToast(`${info.emoji} Mood logged at level ${level}`);
    setNote('');
  };

  const thermPercent = ((level - 1) / 9) * 100;

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🌡️" title="Mood Thermometer" sub="Visual emotional check-in for real-time awareness" onBack={() => nav('home')} />

      <C>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {/* Thermometer visual */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <div style={{ width: 32, height: 140, borderRadius: 16, background: '#f0ecf7', border: '2px solid #e0d8f0', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${thermPercent}%`, background: `linear-gradient(to top, ${info.color}, ${info.color}99)`, borderRadius: 16, transition: 'height 0.4s ease, background 0.4s ease' }} />
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: info.color, border: '3px solid #fff', boxShadow: `0 0 16px ${info.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{info.emoji}</div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: info.color, margin: '0 0 4px' }}>{level}/10</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#2e244c', margin: '0 0 6px' }}>{info.label}</p>
            <p style={{ fontSize: 13, color: '#5C4D76', lineHeight: 1.5, margin: '0 0 16px' }}>💡 {info.bodyTip}</p>
            <input type="range" min={1} max={10} value={level} onChange={e => setLevel(+e.target.value)} style={{ width: '100%', height: 10, borderRadius: 5, appearance: 'none', background: `linear-gradient(90deg, #22c55e, #eab308, #ef4444)`, cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>Calm</span>
              <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>Overwhelmed</span>
            </div>
          </div>
        </div>
      </C>

      <C>
        <Lbl text="What's contributing to this?" />
        <Inp placeholder="Optional note about how you feel..." value={note} onChange={setNote} multiline rows={2} />
        <Btn label="🌡️ Log This Reading" onClick={save} color={info.color} />
      </C>

      <C>
        <Lbl text="Today's Readings" />
        {history.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length === 0 ? (
          <Empty emoji="🌡️" title="No readings today" sub="Log your first mood temperature" />
        ) : (
          history.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).map(h => {
            const hi = getLevelInfo(h.level);
            return (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: `${hi.color}10`, borderRadius: 12, marginBottom: 8, border: `1px solid ${hi.color}30` }}>
                <span style={{ fontSize: 24 }}>{hi.emoji}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: hi.color }}>{h.level}/10 — {h.bodyLocation}</span>
                  {h.note && <p style={{ fontSize: 12, color: '#5C4D76', margin: '2px 0 0' }}>{h.note}</p>}
                </div>
                <span style={{ fontSize: 11, color: '#999' }}>{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            );
          })
        )}
      </C>
    </div>
  );
}

// ─── 6. PEER SUPPORT SCRIPTS ───
export function PeerSupportScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [scripts, setScripts] = useState<PeerSupportScript[]>([]);
  const [situation, setSituation] = useState('');
  const [script, setScript] = useState('');
  const [relationship, setRelationship] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const TEMPLATES = [
    { situation: 'Telling a friend I am struggling', script: 'Hey, I wanted to share something with you. I\'ve been going through a hard time recently with my mental health. I\'m not looking for advice right now — I just needed to tell someone I trust. Would it be okay if we just talked for a bit?', relationship: 'Close Friend' },
    { situation: 'Asking for help at work', script: 'I wanted to have a quick conversation. I\'ve been dealing with some personal challenges that are affecting my capacity. I\'m working on it, but I may need some flexibility in the coming weeks. Can we talk about how we can approach this together?', relationship: 'Manager/Colleague' },
    { situation: 'Telling a partner I need space', script: 'I love you and I want to be open with you. Right now I\'m feeling really overwhelmed and I need some quiet time to recover. This is not about us — it\'s about me needing to recharge. Can we plan some gentle together-time after I\'ve had a chance to breathe?', relationship: 'Partner' },
    { situation: 'Asking family for support', script: 'I wanted to share something personal. I\'ve been struggling with my mental health and I am getting help. I\'m telling you because I trust you and I may need some understanding as I work through this. I\'m not in immediate danger — I just wanted you to know.', relationship: 'Family Member' },
  ];

  useEffect(() => { setScripts(storage.getPeerSupportScripts()); }, []);

  const save = () => {
    if (!situation.trim() || !script.trim()) return;
    const s: PeerSupportScript = { id: editId || uid(), situation, script, relationship, practiced: false, createdAt: Date.now() };
    storage.savePeerSupportScript(s);
    setScripts(storage.getPeerSupportScripts());
    showToast('🤝 Script saved!');
    setSituation(''); setScript(''); setRelationship(''); setEditId(null);
  };

  const del = (id: string) => { storage.deletePeerSupportScript(id); setScripts(storage.getPeerSupportScripts()); };

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🤝" title="Peer Support Scripts" sub="Prepare what to say — asking for help is strength" onBack={() => nav('home')} />

      <C style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', border: '1px solid #6ee7b7' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#065f46', margin: '0 0 4px' }}>💚 Why Scripts Help</p>
        <p style={{ fontSize: 12, color: '#065f46', lineHeight: 1.6 }}>When distressed, our words don't come easily. Having a practiced script reduces the cognitive load and helps you communicate clearly. Rehearsing it builds confidence. Asking for help is one of the bravest things you can do.</p>
      </C>

      <C>
        <Lbl text="Templates — tap to use" />
        {TEMPLATES.map((t, i) => (
          <div key={i} onClick={() => { setSituation(t.situation); setScript(t.script); setRelationship(t.relationship); }} style={{ padding: '12px 14px', background: '#f8f5ff', borderRadius: 14, marginBottom: 8, cursor: 'pointer', border: '1px solid #e0d8f0' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', margin: '0 0 2px' }}>🤝 {t.situation}</p>
            <p style={{ fontSize: 11, color: '#5C4D76', margin: 0 }}>For: {t.relationship}</p>
          </div>
        ))}
      </C>

      <C>
        <Lbl text="Create / Edit Script" />
        <Inp placeholder="Situation e.g. Telling my manager I need support" value={situation} onChange={setSituation} />
        <Inp placeholder="Relationship e.g. Close friend, Partner, Therapist" value={relationship} onChange={setRelationship} />
        <Inp placeholder="Write or paste your script here..." value={script} onChange={setScript} multiline rows={5} />
        <Btn label="💾 Save Script" onClick={save} disabled={!situation.trim() || !script.trim()} />
      </C>

      <C>
        <Lbl text="Your Saved Scripts" />
        {scripts.length === 0 ? <Empty emoji="🤝" title="No scripts yet" sub="Create scripts for situations where you need to ask for help" /> :
          scripts.map(s => (
            <div key={s.id} style={{ borderLeft: '3px solid #22c55e', paddingLeft: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: 0 }}>{s.situation}</p>
                <button onClick={() => del(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 14 }}>🗑️</button>
              </div>
              <p style={{ fontSize: 11, color: '#22c55e', margin: '2px 0 4px', fontWeight: 600 }}>For: {s.relationship}</p>
              <p style={{ fontSize: 12, color: '#5C4D76', lineHeight: 1.5, background: '#f8f5ff', padding: '10px 12px', borderRadius: 10, margin: 0 }}>"{s.script.slice(0, 150)}{s.script.length > 150 ? '...' : ''}"</p>
            </div>
          ))}
      </C>
    </div>
  );
}

// ─── 7. VALUES CLARIFICATION (ACT) ───
export function ValuesClarificationScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [values, setValues] = useState<ValuesClarification[]>([]);
  const [domain, setDomain] = useState('');
  const [value, setValue] = useState('');
  const [importance, setImportance] = useState(8);
  const [alignment, setAlignment] = useState(5);
  const [actionStep, setActionStep] = useState('');

  const DOMAINS = ['Family 👨‍👩‍👧', 'Career 💼', 'Health 💪', 'Relationships 💚', 'Growth 🌱', 'Spirituality 🙏', 'Creativity 🎨', 'Community 🤝', 'Fun/Play 🎉', 'Finance 💰', 'Authenticity 🦋', 'Service 🌍'];

  useEffect(() => { setValues(storage.getValuesClarifications()); }, []);

  const save = () => {
    if (!domain || !value.trim()) return;
    const v: ValuesClarification = { id: uid(), domain, value, importance, currentAlignment: alignment, actionStep, createdAt: Date.now() };
    storage.saveValuesClarification(v);
    setValues(storage.getValuesClarifications());
    showToast('🦋 Value clarified!');
    setDomain(''); setValue(''); setImportance(8); setAlignment(5); setActionStep('');
  };

  const gap = (v: ValuesClarification) => v.importance - v.currentAlignment;
  const sorted = [...values].sort((a, b) => gap(b) - gap(a));

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🦋" title="Values Clarification" sub="ACT therapy — align your life with what truly matters" onBack={() => nav('home')} />

      <C style={{ background: 'linear-gradient(135deg,#fff7ed,#fed7aa)', border: '1px solid #fdba74' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9a3412', margin: '0 0 4px' }}>🦋 ACT Principle</p>
        <p style={{ fontSize: 12, color: '#9a3412', lineHeight: 1.6 }}>Psychological suffering often comes from living out of alignment with our values. When your actions match your values, life has direction and meaning — even during difficult times.</p>
      </C>

      <C>
        <Lbl text="Life Domain" />
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
          {DOMAINS.map(d => <Chip key={d} label={d} active={domain === d} onClick={() => setDomain(d)} color="#f97316" />)}
        </div>
        <Lbl text="Your Core Value in this domain" />
        <Inp placeholder="e.g. Being present for my children, Creative self-expression..." value={value} onChange={setValue} />
        <Sld label="Importance to me" emoji="💎" value={importance} onChange={setImportance} color="#f97316" />
        <Sld label="Current alignment" emoji="🧭" value={alignment} onChange={setAlignment} color="#22c55e" />
        <Lbl text="One action step to close the gap" />
        <Inp placeholder="e.g. Schedule weekly family dinner every Sunday" value={actionStep} onChange={setActionStep} />
        <Btn label="🦋 Clarify This Value" onClick={save} disabled={!domain || !value.trim()} color="#f97316" />
      </C>

      <C>
        <Lbl text="Your Values Map (sorted by gap)" />
        {sorted.length === 0 ? <Empty emoji="🦋" title="No values defined yet" sub="Start mapping what matters most to you" /> :
          sorted.map(v => {
            const g = gap(v);
            const gColor = g >= 5 ? '#ef4444' : g >= 3 ? '#f97316' : '#22c55e';
            return (
              <div key={v.id} style={{ padding: '14px 16px', background: '#f8f5ff', borderRadius: 16, marginBottom: 10, border: `1px solid ${gColor}30` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 11, background: '#eadbff', color: '#5C4D76', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{v.domain}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: gColor }}>Gap: {g > 0 ? '+' : ''}{g}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '4px 0 6px' }}>🦋 {v.value}</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 11, color: '#5C4D76' }}>💎 Importance: {v.importance}/10</span>
                  <span style={{ fontSize: 11, color: '#5C4D76' }}>🧭 Alignment: {v.currentAlignment}/10</span>
                </div>
                {v.actionStep && <p style={{ fontSize: 12, color: '#8a6cf0', margin: '6px 0 0', fontWeight: 500 }}>→ {v.actionStep}</p>}
              </div>
            );
          })}
      </C>
    </div>
  );
}

// ─── 8. EMOTION WHEEL ───
export function EmotionWheelScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [entries, setEntries] = useState<EmotionWheelEntry[]>([]);
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [specific, setSpecific] = useState('');
  const [body, setBody] = useState<string[]>([]);
  const [trigger, setTrigger] = useState('');

  const WHEEL: Record<string, { secondary: string[]; color: string; emoji: string }> = {
    Joy: { secondary: ['Serenity', 'Ecstasy', 'Love', 'Optimism', 'Awe'], color: '#FFD93D', emoji: '😊' },
    Trust: { secondary: ['Acceptance', 'Admiration', 'Submission', 'Loathing'], color: '#6BCB77', emoji: '🤝' },
    Fear: { secondary: ['Apprehension', 'Terror', 'Awe', 'Submission'], color: '#9B59B6', emoji: '😨' },
    Surprise: { secondary: ['Distraction', 'Amazement', 'Disapproval', 'Awe'], color: '#4D96FF', emoji: '😲' },
    Sadness: { secondary: ['Pensiveness', 'Grief', 'Remorse', 'Contempt'], color: '#5C85D6', emoji: '😢' },
    Disgust: { secondary: ['Boredom', 'Loathing', 'Contempt', 'Remorse'], color: '#27AE60', emoji: '🤢' },
    Anger: { secondary: ['Annoyance', 'Rage', 'Contempt', 'Aggression'], color: '#E74C3C', emoji: '😤' },
    Anticipation: { secondary: ['Interest', 'Vigilance', 'Optimism', 'Aggressiveness'], color: '#F39C12', emoji: '🤔' },
  };

  const BODY_LOCS = ['Throat tight', 'Chest heavy', 'Stomach knot', 'Shoulders tense', 'Head foggy', 'Heart racing', 'Jaw clenched', 'Shallow breath', 'Hands trembling', 'Legs restless'];

  useEffect(() => { setEntries(storage.getEmotionWheelEntries()); }, []);

  const save = () => {
    if (!primary || !specific) return;
    const e: EmotionWheelEntry = { id: uid(), primaryEmotion: primary, secondaryEmotion: secondary, specificEmotion: specific, bodyFeelings: body, trigger, timestamp: Date.now() };
    storage.saveEmotionWheelEntry(e);
    setEntries(storage.getEmotionWheelEntries());
    showToast('🎨 Emotion mapped!');
    setPrimary(''); setSecondary(''); setSpecific(''); setBody([]); setTrigger('');
  };

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🎨" title="Emotion Wheel" sub="Name it to tame it — deeper emotion granularity" onBack={() => nav('home')} />

      <C style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1px solid #fcd34d' }}>
        <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>Research shows that naming emotions more precisely (emotional granularity) reduces their intensity. Moving from "bad" → "Sad" → "Grief" helps your brain process and regulate better.</p>
      </C>

      <C>
        <Lbl text="Core Emotion (Primary)" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {Object.entries(WHEEL).map(([name, data]) => (
            <div key={name} onClick={() => { setPrimary(name); setSecondary(''); setSpecific(''); }} style={{ padding: '12px 8px', borderRadius: 16, border: primary === name ? `2px solid ${data.color}` : '1.5px solid #e0d8f0', background: primary === name ? `${data.color}20` : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{data.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2e244c' }}>{name}</div>
            </div>
          ))}
        </div>

        {primary && (
          <>
            <Lbl text="Secondary Emotion" />
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
              {WHEEL[primary]?.secondary.map(s => <Chip key={s} label={s} active={secondary === s} onClick={() => { setSecondary(s); setSpecific(s); }} color={WHEEL[primary]?.color} />)}
            </div>
          </>
        )}

        {secondary && (
          <>
            <Lbl text="Specific Emotion (be precise)" />
            <Inp placeholder={`Describe the specific feeling beyond '${secondary}'...`} value={specific} onChange={setSpecific} />
          </>
        )}

        <Lbl text="Where do you feel this in your body?" />
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
          {BODY_LOCS.map(b => <Chip key={b} label={b} active={body.includes(b)} onClick={() => setBody(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])} color="#FF6B6B" />)}
        </div>

        <Lbl text="What triggered this?" />
        <Inp placeholder="What happened or what thought led to this emotion?" value={trigger} onChange={setTrigger} />
        <Btn label="🎨 Map This Emotion" onClick={save} disabled={!primary || !specific} color={WHEEL[primary]?.color || '#8a6cf0'} />
      </C>

      <C>
        <Lbl text="Recent Mappings" />
        {entries.length === 0 ? <Empty emoji="🎨" title="No emotions mapped yet" sub="Use the wheel to name your feelings with precision" /> :
          entries.slice(-5).reverse().map(e => (
            <div key={e.id} style={{ padding: '10px 14px', background: '#f8f5ff', borderRadius: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, background: '#eadbff', padding: '2px 8px', borderRadius: 10, fontWeight: 600, color: '#5C4D76' }}>{e.primaryEmotion}</span>
                <span style={{ fontSize: 11, color: '#999' }}>→</span>
                <span style={{ fontSize: 11, background: '#cbf3e5', padding: '2px 8px', borderRadius: 10, fontWeight: 600, color: '#166534' }}>{e.specificEmotion}</span>
              </div>
              {e.trigger && <p style={{ fontSize: 12, color: '#5C4D76', margin: 0 }}>Trigger: {e.trigger.slice(0, 60)}</p>}
              <p style={{ fontSize: 10, color: '#999', margin: '3px 0 0' }}>{new Date(e.timestamp).toLocaleDateString()}</p>
            </div>
          ))}
      </C>
    </div>
  );
}

// ─── 9. MICRO MOMENTS OF JOY ───
export function MicroJoyScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [entries, setEntries] = useState<MicroJoyEntry[]>([]);
  const [moment, setMoment] = useState('');
  const [category, setCategory] = useState('');
  const [intensity, setIntensity] = useState(7);

  const CATEGORIES = ['Nature 🌿', 'Connection 💚', 'Achievement 🏆', 'Sensory ☕', 'Play 🎈', 'Beauty 🌸', 'Laughter 😂', 'Gratitude 🙏', 'Peace 🌊', 'Surprise ✨'];
  const PROMPTS = ['The smell of fresh coffee ☕', 'Sunlight on my face 🌞', 'A kind text from someone 💌', 'Hearing a favorite song 🎵', 'A deep breath of fresh air 🌿', 'A child\'s laughter nearby 👶', 'Stretching after sitting 🤸', 'The first sip of a warm drink 🍵'];

  useEffect(() => { setEntries(storage.getMicroJoyEntries()); }, []);

  const save = () => {
    if (!moment.trim()) return;
    const e: MicroJoyEntry = { id: uid(), moment, category, intensityOfJoy: intensity, timestamp: Date.now() };
    storage.saveMicroJoyEntry(e);
    setEntries(storage.getMicroJoyEntries());
    showToast('✨ Joy moment captured!');
    setMoment(''); setCategory(''); setIntensity(7);
  };

  const del = (id: string) => { storage.deleteMicroJoyEntry(id); setEntries(storage.getMicroJoyEntries()); };

  const todayCount = entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length;
  const avgJoy = entries.length > 0 ? Math.round(entries.reduce((a, e) => a + e.intensityOfJoy, 0) / entries.length) : 0;

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="✨" title="Micro Moments of Joy" sub="Train your brain to notice positive experiences" onBack={() => nav('home')} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <C style={{ padding: 16, textAlign: 'center', marginBottom: 0, background: 'linear-gradient(135deg,#fffbeb,#fef3c7)' }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b', margin: 0 }}>{todayCount}</p>
          <p style={{ fontSize: 11, color: '#92400e', margin: '4px 0 0', fontWeight: 600 }}>Joy Moments Today</p>
        </C>
        <C style={{ padding: 16, textAlign: 'center', marginBottom: 0, background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)' }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#22c55e', margin: 0 }}>{avgJoy}/10</p>
          <p style={{ fontSize: 11, color: '#065f46', margin: '4px 0 0', fontWeight: 600 }}>Average Joy</p>
        </C>
      </div>

      <C style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1px solid #fcd34d', marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>🧠 The Science</p>
        <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>Our brains have a negativity bias — we notice bad experiences 3x more than good ones. Deliberately noticing micro-moments of joy rewires this bias and builds positive neuroplasticity over time.</p>
      </C>

      <C>
        <Lbl text="Quick capture — tap a prompt" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {PROMPTS.slice(0, 6).map(p => (
            <div key={p} onClick={() => setMoment(p)} style={{ padding: '10px 12px', background: moment === p ? '#eadbff' : '#f8f5ff', borderRadius: 12, cursor: 'pointer', border: moment === p ? '1.5px solid #8a6cf0' : '1px solid #e0d8f0', fontSize: 12, color: '#2e244c', fontWeight: 500, textAlign: 'center' }}>{p}</div>
          ))}
        </div>
        <Lbl text="Or describe your own moment" />
        <Inp placeholder="What tiny beautiful thing happened today?" value={moment} onChange={setMoment} multiline rows={2} />
        <Lbl text="Category" />
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
          {CATEGORIES.map(c => <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} color="#f59e0b" />)}
        </div>
        <Sld label="Intensity of Joy" emoji="✨" value={intensity} onChange={setIntensity} color="#f59e0b" />
        <Btn label="✨ Capture This Moment" onClick={save} disabled={!moment.trim()} color="#f59e0b" />
      </C>

      <C>
        <Lbl text={`Joy Archive (${entries.length} moments)`} />
        {entries.length === 0 ? <Empty emoji="✨" title="Capture your first moment" sub="Notice the small beautiful things — they add up" /> :
          entries.slice(-8).reverse().map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0ecf7' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>✨</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: '#2e244c', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>{e.moment}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                  {e.category && <span style={{ fontSize: 10, background: '#fffbeb', padding: '2px 8px', borderRadius: 10, color: '#92400e', fontWeight: 600 }}>{e.category}</span>}
                  <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>Joy: {e.intensityOfJoy}/10</span>
                  <span style={{ fontSize: 10, color: '#999' }}>{new Date(e.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => del(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 12 }}>✕</button>
            </div>
          ))}
      </C>
    </div>
  );
}

// ─── 10. EXERCISE MOOD LOGGER ───
export function ExerciseLogScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState(5);
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [notes, setNotes] = useState('');

  const TYPES = ['🚶 Walking', '🏃 Running', '🚴 Cycling', '🏊 Swimming', '🧘 Yoga', '🏋️ Strength', '🤸 Stretching', '💃 Dancing', '🥊 HIIT', '🏔️ Hiking', '⚽ Sports', '🛶 Other'];

  useEffect(() => { setLogs(storage.getExerciseLogs()); }, []);

  const save = () => {
    if (!type) return;
    const today = new Date().toISOString().slice(0, 10);
    const l: ExerciseLog = { id: uid(), type, durationMinutes: duration, intensityLevel: intensity, moodBefore, moodAfter, energyAfter: energy, notes, date: today };
    storage.saveExerciseLog(l);
    setLogs(storage.getExerciseLogs());
    showToast('🏃 Exercise logged!');
    setType(''); setNotes('');
  };

  const avgMoodLift = logs.length > 0 ? Math.round((logs.reduce((a, l) => a + (l.moodAfter - l.moodBefore), 0) / logs.length) * 10) / 10 : 0;
  const totalMinutes = logs.reduce((a, l) => a + l.durationMinutes, 0);

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🏃" title="Exercise & Mood" sub="Track how movement affects your mental health" onBack={() => nav('home')} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Sessions', value: String(logs.length), emoji: '📊', color: '#8a6cf0' },
          { label: 'Total mins', value: String(totalMinutes), emoji: '⏱️', color: '#4D96FF' },
          { label: 'Avg mood lift', value: avgMoodLift >= 0 ? `+${avgMoodLift}` : String(avgMoodLift), emoji: '📈', color: '#22c55e' },
        ].map(stat => (
          <C key={stat.label} style={{ padding: 14, textAlign: 'center', marginBottom: 0, background: `${stat.color}10` }}>
            <p style={{ fontSize: 11, margin: 0 }}>{stat.emoji}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: stat.color, margin: '4px 0 2px' }}>{stat.value}</p>
            <p style={{ fontSize: 10, color: '#5C4D76', margin: 0, fontWeight: 600 }}>{stat.label}</p>
          </C>
        ))}
      </div>

      <C>
        <Lbl text="Type of Exercise" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {TYPES.map(t => (
            <div key={t} onClick={() => setType(t)} style={{ padding: '10px 6px', borderRadius: 14, border: type === t ? '2px solid #8a6cf0' : '1.5px solid #e0d8f0', background: type === t ? '#eadbff' : '#fff', cursor: 'pointer', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#2e244c' }}>{t}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <Lbl text="Duration (min)" />
            <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0d8f0', fontSize: 14, outline: 'none', background: '#faf8ff', boxSizing: 'border-box' }} />
          </div>
        </div>
        <Sld label="Intensity" emoji="⚡" value={intensity} onChange={setIntensity} color="#f97316" />
        <Sld label="Mood Before" emoji="😊" value={moodBefore} onChange={setMoodBefore} />
        <Sld label="Mood After" emoji="🌟" value={moodAfter} onChange={setMoodAfter} color="#22c55e" />
        <Sld label="Energy After" emoji="⚡" value={energy} onChange={setEnergy} color="#f59e0b" />
        <Inp placeholder="Any notes? (optional)" value={notes} onChange={setNotes} multiline rows={2} />
        <Btn label="🏃 Log This Session" onClick={save} disabled={!type} color="#22c55e" />
      </C>

      <C>
        <Lbl text="Recent Exercise Logs" />
        {logs.length === 0 ? <Empty emoji="🏃" title="No exercise logged yet" sub="Start tracking how movement changes your mood" /> :
          logs.slice(-5).reverse().map(l => {
            const lift = l.moodAfter - l.moodBefore;
            return (
              <div key={l.id} style={{ padding: '12px 14px', background: '#f8f5ff', borderRadius: 14, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2e244c' }}>{l.type}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: lift >= 0 ? '#22c55e' : '#ef4444' }}>{lift >= 0 ? '↑' : '↓'} Mood {lift >= 0 ? '+' : ''}{lift}</span>
                </div>
                <div style={{ fontSize: 11, color: '#5C4D76' }}>{l.durationMinutes}m • Intensity: {l.intensityLevel}/10 • Energy after: {l.energyAfter}/10</div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{l.date}</div>
              </div>
            );
          })}
      </C>
    </div>
  );
}

// ─── 11. NATURE THERAPY LOG ───
export function NatureTherapyScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [logs, setLogs] = useState<NatureTherapyLog[]>([]);
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(20);
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(5);
  const [notes, setNotes] = useState('');

  const ACTIVITIES = ['🌳 Forest Walk', '🏖️ Beach Visit', '🌿 Garden Time', '🌅 Sunrise Watch', '🌇 Sunset Watch', '🌦️ Rain Watching', '🦋 Nature Observation', '🧘 Outdoor Meditation', '🌾 Park Sit', '🏔️ Mountain View', '🌻 Flower Garden', '⛲ Water Feature'];
  const BENEFITS = ['🌿 Reduces cortisol by 21% (research-proven)', '💚 23 minutes is enough to lower stress hormones', '🧠 Boosts serotonin and dopamine naturally', '👁️ Natural fractals calm the nervous system', '🫁 Phytoncides from trees boost immunity'];

  useEffect(() => { setLogs(storage.getNatureTherapyLogs()); }, []);

  const save = () => {
    if (!activity) return;
    const today = new Date().toISOString().slice(0, 10);
    const l: NatureTherapyLog = { id: uid(), activity, location, durationMinutes: duration, moodBefore: before, moodAfter: after, notes, date: today };
    storage.saveNatureTherapyLog(l);
    setLogs(storage.getNatureTherapyLogs());
    showToast('🌿 Nature session logged!');
    setActivity(''); setLocation(''); setNotes('');
  };

  const avgLift = logs.length > 0 ? Math.round((logs.reduce((a, l) => a + (l.moodAfter - l.moodBefore), 0) / logs.length) * 10) / 10 : 0;

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🌿" title="Nature Therapy" sub="Green prescriptions — evidence-based ecotherapy" onBack={() => nav('home')} />

      <C style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', border: '1px solid #6ee7b7' }}>
        <Lbl text="Science of Nature Therapy" />
        {BENEFITS.map((b, i) => <p key={i} style={{ fontSize: 12, color: '#065f46', margin: '4px 0', lineHeight: 1.5 }}>{b}</p>)}
      </C>

      {logs.length > 0 && (
        <C style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div><p style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', margin: 0 }}>{logs.length}</p><p style={{ fontSize: 11, color: '#166534', margin: '2px 0 0' }}>Sessions</p></div>
            <div><p style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', margin: 0 }}>{logs.reduce((a, l) => a + l.durationMinutes, 0)}m</p><p style={{ fontSize: 11, color: '#166534', margin: '2px 0 0' }}>Total</p></div>
            <div><p style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', margin: 0 }}>{avgLift >= 0 ? '+' : ''}{avgLift}</p><p style={{ fontSize: 11, color: '#166534', margin: '2px 0 0' }}>Avg Mood Lift</p></div>
          </div>
        </C>
      )}

      <C>
        <Lbl text="Activity" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {ACTIVITIES.map(a => (
            <div key={a} onClick={() => setActivity(a)} style={{ padding: '10px 8px', borderRadius: 14, border: activity === a ? '2px solid #22c55e' : '1.5px solid #e0d8f0', background: activity === a ? '#d1fae5' : '#fff', cursor: 'pointer', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#2e244c' }}>{a}</div>
          ))}
        </div>
        <Inp placeholder="Location (optional — park, garden, beach...)" value={location} onChange={setLocation} />
        <Sld label="Duration (minutes)" emoji="⏱️" value={duration} onChange={d => setDuration(d * 5)} max={12} color="#22c55e" />
        <p style={{ fontSize: 11, color: '#5C4D76', margin: '-8px 0 12px', fontWeight: 600 }}>≈ {duration}  minutes</p>
        <Sld label="Mood Before" emoji="😊" value={before} onChange={setBefore} />
        <Sld label="Mood After" emoji="🌿" value={after} onChange={setAfter} color="#22c55e" />
        <Inp placeholder="Observations — what did you notice? (optional)" value={notes} onChange={setNotes} multiline rows={2} />
        <Btn label="🌿 Log Nature Session" onClick={save} disabled={!activity} color="#22c55e" />
      </C>

      <C>
        <Lbl text="Nature Sessions" />
        {logs.length === 0 ? <Empty emoji="🌿" title="No sessions logged" sub="Step outside — even 5 minutes in green space helps" /> :
          logs.slice(-5).reverse().map(l => (
            <div key={l.id} style={{ padding: '12px 14px', background: '#f0fdf4', borderRadius: 14, marginBottom: 8, border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2e244c' }}>{l.activity}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>+{l.moodAfter - l.moodBefore} mood</span>
              </div>
              <p style={{ fontSize: 11, color: '#5C4D76', margin: '3px 0 0' }}>{l.durationMinutes}m {l.location ? `• ${l.location}` : ''} • {l.date}</p>
            </div>
          ))}
      </C>
    </div>
  );
}

// ─── 12. LETTER THERAPY ───
export function LetterTherapyScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [entries, setEntries] = useState<LetterTherapyEntry[]>([]);
  const [recipient, setRecipient] = useState('');
  const [letterType, setLetterType] = useState('');
  const [content, setContent] = useState('');
  const [intention, setIntention] = useState('');
  const [shift, setShift] = useState(5);

  const TYPES = [
    { key: 'unsent-hurt', label: 'To someone who hurt me', emoji: '💔', desc: 'Express what you never said — never to send' },
    { key: 'past-self', label: 'To my past self', emoji: '🕰️', desc: 'Compassion and wisdom for who you were' },
    { key: 'future-self', label: 'To my future self', emoji: '🌟', desc: 'Hope, intentions and encouragement' },
    { key: 'inner-child', label: 'To my inner child', emoji: '🧸', desc: 'Reparenting, love and protection' },
    { key: 'anxiety', label: 'To my anxiety', emoji: '😰', desc: 'Dialogue with the anxious part of you' },
    { key: 'grief', label: 'To someone I lost', emoji: '🕊️', desc: 'Continuing bonds after loss' },
    { key: 'forgiveness', label: 'Letter of forgiveness', emoji: '💜', desc: 'Release the burden — for yourself' },
    { key: 'gratitude', label: 'Letter of gratitude', emoji: '🙏', desc: 'Deep appreciation to someone meaningful' },
  ];

  useEffect(() => { setEntries(storage.getLetterTherapyEntries()); }, []);

  const save = () => {
    if (!content.trim() || !letterType) return;
    const e: LetterTherapyEntry = { id: uid(), recipient, letterType, content, intention, sentimentShift: shift, createdAt: Date.now() };
    storage.saveLetterTherapyEntry(e);
    setEntries(storage.getLetterTherapyEntries());
    showToast('💌 Letter saved privately');
    setContent(''); setRecipient(''); setLetterType(''); setIntention('');
  };

  const del = (id: string) => { storage.deleteLetterTherapyEntry(id); setEntries(storage.getLetterTherapyEntries()); };

  const selected = TYPES.find(t => t.key === letterType);

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="💌" title="Letter Therapy" sub="Write what cannot be spoken — emotional release & healing" onBack={() => nav('home')} />

      <C style={{ background: 'linear-gradient(135deg,#fdf2f8,#fce7f3)', border: '1px solid #fbcfe8' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9d174d', margin: '0 0 4px' }}>💌 The Healing Power of Letters</p>
        <p style={{ fontSize: 12, color: '#9d174d', lineHeight: 1.6 }}>Unsent letters create profound emotional release. You express what needs to be expressed — without consequences. These letters stay private, stored only on your device. This is for your healing, not for sending.</p>
      </C>

      <C>
        <Lbl text="Choose Letter Type" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {TYPES.map(t => (
            <div key={t.key} onClick={() => setLetterType(t.key)} style={{ padding: '12px 14px', borderRadius: 16, border: letterType === t.key ? '2px solid #e11d48' : '1.5px solid #e0d8f0', background: letterType === t.key ? '#fdf2f8' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{t.emoji}</div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2e244c', margin: '0 0 2px' }}>{t.label}</p>
              <p style={{ fontSize: 10, color: '#5C4D76', margin: 0, lineHeight: 1.4 }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {selected && (
          <>
            <Lbl text={`Recipient name (optional)`} />
            <Inp placeholder={`e.g. ${selected.label.includes('self') ? 'Younger Me' : 'A name or leave blank'}`} value={recipient} onChange={setRecipient} />
            <Lbl text={`Your letter ${selected.emoji}`} />
            <p style={{ fontSize: 12, color: '#5C4D76', margin: '-4px 0 10px', fontStyle: 'italic' }}>Write freely. Don't edit yourself. This is private and only for you. 💜</p>
            <Inp placeholder={`Dear ${recipient || '...'},${'  '}

I wanted to say...`} value={content} onChange={setContent} multiline rows={10} />
            <Lbl text="Intention for this letter" />
            <Inp placeholder="e.g. Release anger, find closure, express love..." value={intention} onChange={setIntention} />
            <Sld label="Emotional shift after writing" emoji="💜" value={shift} onChange={setShift} color="#e11d48" />
            <Btn label="💌 Save Letter Privately" onClick={save} disabled={!content.trim()} color="#e11d48" />
          </>
        )}
      </C>

      <C>
        <Lbl text={`Your Letters (${entries.length})`} />
        {entries.length === 0 ? <Empty emoji="💌" title="No letters yet" sub="Write your first letter — it does not need to be perfect" /> :
          entries.slice().reverse().map(e => {
            const t = TYPES.find(x => x.key === e.letterType);
            return (
              <div key={e.id} style={{ padding: '14px 16px', background: '#fdf2f8', borderRadius: 16, marginBottom: 10, border: '1px solid #fbcfe8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2e244c' }}>{t?.emoji} {t?.label}</span>
                  <button onClick={() => del(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 12 }}>🗑️</button>
                </div>
                {e.recipient && <p style={{ fontSize: 12, color: '#e11d48', margin: '0 0 4px', fontWeight: 600 }}>To: {e.recipient}</p>}
                <p style={{ fontSize: 12, color: '#5C4D76', margin: '0 0 4px', lineHeight: 1.5 }}>{e.content.slice(0, 120)}...</p>
                {e.intention && <p style={{ fontSize: 11, color: '#8a6cf0', margin: '4px 0 0' }}>Intention: {e.intention}</p>}
                <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0' }}>{new Date(e.createdAt).toLocaleDateString()}</p>
              </div>
            );
          })}
      </C>
    </div>
  );
}

// ─── 13. COMPASSION FATIGUE ASSESSMENT ───
export function CompassionFatigueScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [logs, setLogs] = useState<CompassionFatigueLog[]>([]);
  const [answers, setAnswers] = useState<number[]>(new Array(10).fill(0));

  const QUESTIONS = [
    'I feel emotionally exhausted at the end of most days',
    'I find it hard to care about things that used to matter to me',
    'I feel detached or numb towards others\' pain or problems',
    'I have little empathy or patience left for people around me',
    'I dread going to work or fulfilling my responsibilities',
    'I feel like my efforts don\'t make a real difference',
    'I have been avoiding interactions with people who need my help',
    'I feel resentful toward people who rely on me',
    'I feel hopeless about being able to help or support others',
    'My body feels tense, tired, or unwell without clear medical cause',
  ];

  const OPTIONS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

  const score = answers.reduce((a, b) => a + b, 0);
  const maxScore = QUESTIONS.length * 4;
  const percent = Math.round((score / maxScore) * 100);

  const getLevel = () => {
    if (percent < 25) return { level: 'Low', color: '#22c55e', emoji: '💚', recs: ['Maintain your self-care practices 🌿', 'Continue boundary-setting 🛡️', 'Celebrate your resilience 🏆'] };
    if (percent < 50) return { level: 'Mild', color: '#eab308', emoji: '💛', recs: ['Increase your self-care immediately 🌸', 'Schedule recovery time each week 📅', 'Talk to a trusted friend or colleague 🤝', 'Practice the 5-minute self-compassion break daily 💜'] };
    if (percent < 75) return { level: 'Moderate', color: '#f97316', emoji: '🧡', recs: ['Seriously consider speaking with a therapist 🏥', 'Reduce your helping/caretaking role temporarily ⬇️', 'Set firm boundaries immediately 🛡️', 'Daily grounding and body scan practices 🧘', 'Consider a leave of absence or role change 💼'] };
    return { level: 'Severe', color: '#ef4444', emoji: '❤️', recs: ['Please reach out to a mental health professional urgently 🏥', 'You cannot pour from an empty cup — you need immediate care 💜', 'Share with someone you trust today 🤝', 'This is a medical-level concern — please seek help 📞'] };
  };

  const result = getLevel();

  useEffect(() => { setLogs(storage.getCompassionFatigueLogs()); }, []);

  const save = () => {
    const l: CompassionFatigueLog = { id: uid(), answers, totalScore: score, level: result.level, recommendations: result.recs, loggedAt: Date.now() };
    storage.saveCompassionFatigueLog(l);
    setLogs(storage.getCompassionFatigueLogs());
    showToast(`🫀 Assessment saved — Level: ${result.level}`);
  };

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🫀" title="Compassion Fatigue" sub="Assessment for over-givers and empathic people" onBack={() => nav('home')} />

      <C style={{ background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '1px solid #fca5a5', marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', margin: '0 0 4px' }}>🫀 What is Compassion Fatigue?</p>
        <p style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.6 }}>Compassion fatigue (secondary traumatic stress) occurs when you absorb others' pain and it depletes your emotional resources. It's common in caregivers, parents, healthcare workers, and empathic people. It's different from burnout — and different treatment is needed.</p>
      </C>

      <C>
        <Lbl text="Self-Assessment (10 Questions)" />
        {QUESTIONS.map((q, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', margin: '0 0 8px', lineHeight: 1.5 }}>{i + 1}. {q}</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {OPTIONS.map((opt, j) => (
                <button key={j} onClick={() => { const a = [...answers]; a[i] = j; setAnswers(a); }} style={{ flex: 1, padding: '6px 4px', borderRadius: 10, border: answers[i] === j ? '2px solid #ef4444' : '1.5px solid #e0d8f0', background: answers[i] === j ? '#fff1f2' : '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer', color: answers[i] === j ? '#ef4444' : '#5C4D76' }}>{opt}</button>
              ))}
            </div>
          </div>
        ))}
      </C>

      <C style={{ background: `${result.color}10`, border: `1px solid ${result.color}40` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: 0 }}>{result.emoji} Compassion Fatigue Level</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: result.color, margin: '4px 0 0' }}>{result.level}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: result.color, margin: 0 }}>{percent}%</p>
            <p style={{ fontSize: 11, color: '#5C4D76', margin: '2px 0 0' }}>{score}/{maxScore}</p>
          </div>
        </div>
        <div style={{ height: 8, background: '#f0ecf7', borderRadius: 4, marginBottom: 12 }}>
          <div style={{ height: '100%', width: `${percent}%`, background: result.color, borderRadius: 4 }} />
        </div>
        <Lbl text="Recommendations" />
        {result.recs.map((r, i) => <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.7)', borderRadius: 10, marginBottom: 6, fontSize: 12, color: '#2e244c', fontWeight: 500 }}>{r}</div>)}
        <Btn label="💾 Save Assessment" onClick={save} color={result.color} />
        <p style={{ fontSize: 10, color: '#999', textAlign: 'center', marginTop: 8 }}>⚕️ This is a self-screening tool, not a clinical diagnosis. Please consult a professional.</p>
      </C>

      <C>
        <Lbl text="Assessment History" />
        {logs.length === 0 ? <Empty emoji="🫀" title="No assessments yet" sub="Complete your first assessment to track your compassion fatigue over time" /> :
          logs.slice(-4).reverse().map(l => (
            <div key={l.id} style={{ padding: '10px 14px', background: '#f8f5ff', borderRadius: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2e244c' }}>Level: {l.level}</span>
                <p style={{ fontSize: 11, color: '#5C4D76', margin: '2px 0 0' }}>Score: {l.totalScore}/{QUESTIONS.length * 4}</p>
              </div>
              <span style={{ fontSize: 11, color: '#999' }}>{new Date(l.loggedAt).toLocaleDateString()}</span>
            </div>
          ))}
      </C>
    </div>
  );
}

// ─── 14. SMART RECOVERY GOALS ───
export function RecoveryGoalsScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [goals, setGoals] = useState<RecoveryGoal[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [specific, setSpecific] = useState('');
  const [measurable, setMeasurable] = useState('');
  const [achievable, setAchievable] = useState('');
  const [relevant, setRelevant] = useState('');
  const [timeBound, setTimeBound] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('');
  const [milestoneText, setMilestoneText] = useState('');

  const CATEGORIES = ['Mental Health 🧠', 'Physical Health 💪', 'Relationships 💚', 'Work-Life 💼', 'Self-Care 🌸', 'Recovery 🌱', 'Skills 📚', 'Lifestyle 🌟'];
  const TEMPLATES = [
    { title: 'Daily mindfulness practice', specific: 'Practice 10 minutes of mindfulness every morning before checking phone', measurable: 'Track completion daily in app', achievable: 'Start with 5 minutes and build up', relevant: 'Reduces anxiety and improves focus for my recovery', timeBound: 'Establish habit within 30 days', category: 'Mental Health 🧠' },
    { title: 'Improve sleep quality', specific: 'Be in bed by 10:30pm and wake at 6:30am consistently', measurable: 'Rate sleep quality daily in sleep tracker', achievable: 'Gradually shift bedtime by 15 mins each week', relevant: 'Poor sleep worsens my mental health significantly', timeBound: 'Consistent for 3 weeks', category: 'Physical Health 💪' },
  ];

  useEffect(() => { setGoals(storage.getRecoveryGoals()); }, []);

  const save = () => {
    if (!title.trim()) return;
    const g: RecoveryGoal = { id: uid(), title, specific, measurable, achievable, relevant, timeBound, targetDate, progressPercent: 0, milestones: [], category, createdAt: Date.now(), updatedAt: Date.now() };
    storage.saveRecoveryGoal(g);
    setGoals(storage.getRecoveryGoals());
    showToast('🎯 Goal created!');
    setCreating(false); setTitle(''); setSpecific(''); setMeasurable(''); setAchievable(''); setRelevant(''); setTimeBound(''); setTargetDate(''); setCategory('');
  };

  const addMilestone = (goalId: string) => {
    if (!milestoneText.trim()) return;
    const all = storage.getRecoveryGoals();
    const g = all.find(x => x.id === goalId);
    if (!g) return;
    const m: GoalMilestone = { id: uid(), text: milestoneText, completed: false };
    g.milestones.push(m);
    g.updatedAt = Date.now();
    storage.saveRecoveryGoal(g);
    setGoals(storage.getRecoveryGoals());
    setMilestoneText('');
  };

  const toggleMilestone = (goalId: string, mId: string) => {
    const all = storage.getRecoveryGoals();
    const g = all.find(x => x.id === goalId);
    if (!g) return;
    const m = g.milestones.find(x => x.id === mId);
    if (!m) return;
    m.completed = !m.completed;
    m.completedAt = m.completed ? Date.now() : undefined;
    g.progressPercent = g.milestones.length > 0 ? Math.round((g.milestones.filter(m => m.completed).length / g.milestones.length) * 100) : 0;
    g.updatedAt = Date.now();
    storage.saveRecoveryGoal(g);
    setGoals(storage.getRecoveryGoals());
  };

  const delGoal = (id: string) => { storage.deleteRecoveryGoal(id); setGoals(storage.getRecoveryGoals()); };

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🎯" title="Recovery Goals" sub="SMART goals for structured, measurable healing" onBack={() => nav('home')} />

      {!creating ? (
        <>
          <Btn label="+ Create New SMART Goal" onClick={() => setCreating(true)} color="#8a6cf0" />

          <C style={{ marginTop: 14, background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '1px solid #c4b5fd' }}>
            <Lbl text="SMART Template — tap to use" />
            {TEMPLATES.map((t, i) => (
              <div key={i} onClick={() => { setTitle(t.title); setSpecific(t.specific); setMeasurable(t.measurable); setAchievable(t.achievable); setRelevant(t.relevant); setTimeBound(t.timeBound); setCategory(t.category); setCreating(true); }} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 14, marginBottom: 8, cursor: 'pointer' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: 0 }}>🎯 {t.title}</p>
                <p style={{ fontSize: 11, color: '#5C4D76', margin: '2px 0 0' }}>{t.category}</p>
              </div>
            ))}
          </C>

          <C style={{ marginTop: 14 }}>
            <Lbl text={`Active Goals (${goals.length})`} />
            {goals.length === 0 ? <Empty emoji="🎯" title="No goals set yet" sub="Create your first SMART recovery goal" /> :
              goals.map(g => (
                <div key={g.id} style={{ padding: '16px', background: '#f8f5ff', borderRadius: 18, marginBottom: 14, border: '1px solid #e0d8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 10, background: '#eadbff', padding: '2px 8px', borderRadius: 10, color: '#5C4D76', fontWeight: 600 }}>{g.category}</span>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#2e244c', margin: '6px 0 0' }}>🎯 {g.title}</p>
                    </div>
                    <button onClick={() => delGoal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 14, alignSelf: 'flex-start' }}>🗑️</button>
                  </div>
                  <div style={{ height: 8, background: '#e0d8f0', borderRadius: 4, marginBottom: 6 }}>
                    <div style={{ height: '100%', width: `${g.progressPercent}%`, background: 'linear-gradient(90deg,#8a6cf0,#cbf3e5)', borderRadius: 4, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#8a6cf0', fontWeight: 700 }}>{g.progressPercent}% complete</span>
                    {g.targetDate && <span style={{ fontSize: 11, color: '#999' }}>Target: {g.targetDate}</span>}
                  </div>
                  {g.specific && <p style={{ fontSize: 12, color: '#5C4D76', margin: '0 0 10px', lineHeight: 1.5 }}>📌 {g.specific}</p>}
                  {g.milestones.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <Lbl text="Milestones" />
                      {g.milestones.map(m => (
                        <div key={m.id} onClick={() => toggleMilestone(g.id, m.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }}>
                          <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${m.completed ? '#22c55e' : '#e0d8f0'}`, background: m.completed ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {m.completed && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 13, color: m.completed ? '#999' : '#2e244c', fontWeight: m.completed ? 400 : 500, textDecoration: m.completed ? 'line-through' : 'none' }}>{m.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={milestoneText} onChange={e => setMilestoneText(e.target.value)} placeholder="Add milestone..." style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e0d8f0', fontSize: 12, outline: 'none', background: '#fff' }} />
                    <button onClick={() => addMilestone(g.id)} style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: '#8a6cf0', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              ))}
          </C>
        </>
      ) : (
        <C>
          <Lbl text="SMART Goal Framework" />
          <p style={{ fontSize: 12, color: '#5C4D76', margin: '0 0 16px', lineHeight: 1.6 }}>Specific • Measurable • Achievable • Relevant • Time-bound</p>
          <Inp placeholder="Goal title e.g. 'Establish a daily mindfulness practice'" value={title} onChange={setTitle} />
          <Lbl text="Category" />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>{CATEGORIES.map(c => <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />)}</div>
          <Lbl text="S — Specific: What exactly will you do?" />
          <Inp placeholder="Be very specific about actions, location, and approach..." value={specific} onChange={setSpecific} multiline rows={2} />
          <Lbl text="M — Measurable: How will you track progress?" />
          <Inp placeholder="e.g. Rate sleep quality daily, Log 3x per week..." value={measurable} onChange={setMeasurable} />
          <Lbl text="A — Achievable: Why is this realistic for you now?" />
          <Inp placeholder="What makes this doable given your current situation?" value={achievable} onChange={setAchievable} />
          <Lbl text="R — Relevant: Why does this matter for your recovery?" />
          <Inp placeholder="How does this connect to your mental health and wellbeing?" value={relevant} onChange={setRelevant} />
          <Lbl text="T — Time-bound: What is your timeframe?" />
          <Inp placeholder="e.g. Daily for 30 days, Complete by end of month..." value={timeBound} onChange={setTimeBound} />
          <Lbl text="Target Date" />
          <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0d8f0', fontSize: 14, outline: 'none', background: '#faf8ff', boxSizing: 'border-box', marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn label="Cancel" onClick={() => setCreating(false)} color="#999" small />
            <Btn label="🎯 Create Goal" onClick={save} disabled={!title.trim()} small />
          </div>
        </C>
      )}
    </div>
  );
}

// ─── 15. BEDTIME WIND-DOWN RITUAL ───
export function WindDownScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [ritual, setRitual] = useState<WindDownRitual>({ steps: [], targetBedtime: '22:00', updatedAt: 0 });
  const [newActivity, setNewActivity] = useState('');
  const [newEmoji, setNewEmoji] = useState('🌙');
  const [newDuration, setNewDuration] = useState(5);
  const [activeSession, setActiveSession] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepElapsed, setStepElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const PRESETS: WindDownStep[] = [
    { id: uid(), order: 1, activity: 'Put phone on Do Not Disturb', emoji: '📵', durationMinutes: 1, completed: false },
    { id: uid(), order: 2, activity: 'Dim the lights in your room', emoji: '💡', durationMinutes: 1, completed: false },
    { id: uid(), order: 3, activity: 'Warm shower or wash face', emoji: '🚿', durationMinutes: 10, completed: false },
    { id: uid(), order: 4, activity: 'Change into comfortable clothes', emoji: '👕', durationMinutes: 2, completed: false },
    { id: uid(), order: 5, activity: 'Gratitude journal — 3 things', emoji: '🙏', durationMinutes: 5, completed: false },
    { id: uid(), order: 6, activity: 'Read a calming book (no screens)', emoji: '📖', durationMinutes: 15, completed: false },
    { id: uid(), order: 7, activity: 'Body scan meditation', emoji: '🧘', durationMinutes: 10, completed: false },
    { id: uid(), order: 8, activity: 'Deep breathing — 4-7-8 x5', emoji: '🫁', durationMinutes: 5, completed: false },
  ];

  const EMOJIS = ['🌙', '🛁', '📖', '🫁', '🧘', '🙏', '☕', '🎵', '💜', '🌿', '📵', '💡', '🚿', '👕', '🕯️', '🌸'];

  useEffect(() => {
    const saved = storage.getWindDownRitual();
    setRitual(saved);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const loadPresets = () => {
    const r: WindDownRitual = { steps: PRESETS, targetBedtime: '22:00', updatedAt: Date.now() };
    storage.saveWindDownRitual(r);
    setRitual(r);
    showToast('🌙 Preset routine loaded!');
  };

  const addStep = () => {
    if (!newActivity.trim()) return;
    const step: WindDownStep = { id: uid(), order: ritual.steps.length + 1, activity: newActivity, emoji: newEmoji, durationMinutes: newDuration, completed: false };
    const updated = { ...ritual, steps: [...ritual.steps, step], updatedAt: Date.now() };
    storage.saveWindDownRitual(updated);
    setRitual(updated);
    setNewActivity('');
    showToast('✅ Step added!');
  };

  const removeStep = (id: string) => {
    const updated = { ...ritual, steps: ritual.steps.filter(s => s.id !== id), updatedAt: Date.now() };
    storage.saveWindDownRitual(updated);
    setRitual(updated);
  };

  const startSession = () => {
    const reset = { ...ritual, steps: ritual.steps.map(s => ({ ...s, completed: false })), updatedAt: Date.now() };
    storage.saveWindDownRitual(reset);
    setRitual(reset);
    setActiveSession(true);
    setCurrentStep(0);
    setStepElapsed(0);
    if (ritual.steps[0]) {
      timerRef.current = setInterval(() => {
        setStepElapsed(p => p + 1);
      }, 1000);
    }
  };

  const completeStep = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const updated = { ...ritual, steps: ritual.steps.map((s, i) => i === currentStep ? { ...s, completed: true } : s) };
    storage.saveWindDownRitual(updated);
    setRitual(updated);
    if (currentStep < ritual.steps.length - 1) {
      setCurrentStep(p => p + 1);
      setStepElapsed(0);
      timerRef.current = setInterval(() => setStepElapsed(p => p + 1), 1000);
    } else {
      setActiveSession(false);
      showToast('🌙 Wind-down complete! Rest well 💜');
    }
  };

  const step = ritual.steps[currentStep];
  const totalMinutes = ritual.steps.reduce((a, s) => a + s.durationMinutes, 0);

  return (
    <div style={{ padding: '20px 16px', paddingBottom: 100, fontFamily: 'system-ui,sans-serif' }}>
      <Hdr emoji="🌙" title="Bedtime Wind-Down" sub="Pre-sleep ritual builder for better rest and recovery" onBack={() => nav('home')} />

      {!activeSession ? (
        <>
          <C style={{ background: 'linear-gradient(135deg,#1e1b4b15,#312e8115)', border: '1px solid #c7d2fe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#312e81', margin: 0 }}>🌙 Target Bedtime</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#312e81', margin: '4px 0 0' }}>{ritual.targetBedtime}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: '#4338ca', margin: 0 }}>Total ritual</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#4338ca', margin: '2px 0 0' }}>{totalMinutes}m</p>
              </div>
            </div>
          </C>

          <div style={{ display: 'flex', gap: 10, margin: '14px 0' }}>
            <input type="time" value={ritual.targetBedtime} onChange={e => { const u = { ...ritual, targetBedtime: e.target.value }; storage.saveWindDownRitual(u); setRitual(u); }} style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0d8f0', fontSize: 14, outline: 'none', background: '#faf8ff' }} />
            <button onClick={loadPresets} style={{ padding: '10px 16px', borderRadius: 12, border: 'none', background: '#eadbff', color: '#5C4D76', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Load Presets</button>
          </div>

          <C>
            <Lbl text="Your Wind-Down Steps" />
            {ritual.steps.length === 0 ? (
              <Empty emoji="🌙" title="No steps added" sub="Load presets or create your own custom wind-down ritual" />
            ) : (
              ritual.steps.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0ecf7' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', margin: 0 }}>{s.activity}</p>
                    <p style={{ fontSize: 11, color: '#5C4D76', margin: '2px 0 0' }}>{s.durationMinutes} minutes</p>
                  </div>
                  <span style={{ fontSize: 11, color: '#8a6cf0', fontWeight: 600 }}>Step {i + 1}</span>
                  <button onClick={() => removeStep(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 14 }}>✕</button>
                </div>
              ))
            )}
          </C>

          <C>
            <Lbl text="Add Custom Step" />
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {EMOJIS.map(e => <button key={e} onClick={() => setNewEmoji(e)} style={{ width: 34, height: 34, borderRadius: 10, border: newEmoji === e ? '2px solid #8a6cf0' : '1px solid #e0d8f0', background: newEmoji === e ? '#eadbff' : '#fff', fontSize: 18, cursor: 'pointer' }}>{e}</button>)}
            </div>
            <Inp placeholder="Activity description..." value={newActivity} onChange={setNewActivity} />
            <Sld label="Duration (minutes)" emoji="⏱️" value={newDuration} onChange={setNewDuration} max={30} color="#312e81" />
            <Btn label="+ Add Step" onClick={addStep} disabled={!newActivity.trim()} color="#312e81" small />
          </C>

          {ritual.steps.length > 0 && <Btn label="🌙 Start Tonight's Ritual" onClick={startSession} color="#312e81" />}
        </>
      ) : (
        <C style={{ background: 'linear-gradient(160deg,#1e1b4b,#312e81)', border: 'none' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 600, margin: '0 0 8px' }}>Step {currentStep + 1} of {ritual.steps.length}</p>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginBottom: 20 }}>
              <div style={{ height: '100%', width: `${((currentStep) / ritual.steps.length) * 100}%`, background: '#818cf8', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 64, marginBottom: 12 }}>{step?.emoji}</div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{step?.activity}</p>
            <p style={{ fontSize: 16, color: '#a5b4fc', margin: '0 0 16px' }}>{step?.durationMinutes} minutes suggested</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#818cf8', fontVariantNumeric: 'tabular-nums' }}>
              {Math.floor(stepElapsed / 60).toString().padStart(2, '0')}:{(stepElapsed % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <button onClick={completeStep} style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
            {currentStep < ritual.steps.length - 1 ? '✓ Done — Next Step →' : '🌙 Complete Ritual'}
          </button>
          <button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setActiveSession(false); }} style={{ width: '100%', padding: 12, marginTop: 10, borderRadius: 14, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#a5b4fc', fontSize: 13, cursor: 'pointer' }}>
            ✕ End Session Early
          </button>
        </C>
      )}
    </div>
  );
}
