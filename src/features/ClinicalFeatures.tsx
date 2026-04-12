import { useState, useEffect, useRef } from 'react';
import { storage } from '../services/storage';
import type { ScreenName, ThoughtRecord, GratitudeEntry, SleepLog, MedicationEntry, SocialLog, EnergyBudget, EnergyActivity, AffirmationEntry, WorryEntry, SelfCompassionEntry, EmergencyContact, DailyWellnessScore, MoodEntry, SafetyContact } from '../types';

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Shared card component for consistency - Dark mode compatible
function FC({ children, style, onClick, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void; className?: string }) {
  return (
    <div onClick={onClick} className={className} style={{
      background: 'rgba(12, 18, 35, 0.65)', backdropFilter: 'blur(16px)', borderRadius: 20,
      border: '1px solid rgba(100, 120, 180, 0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      padding: 20, cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s', ...style,
    }}>{children}</div>
  );
}

function BackBtn({ nav, to }: { nav: (s: ScreenName) => void; to: ScreenName }) {
  return <button onClick={() => nav(to)} style={{ background: 'none', border: 'none', fontSize: 16, color: '#94A3B8', cursor: 'pointer', fontWeight: 600, marginBottom: 20 }}>← Back</button>;
}

function SectionTitle({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#E2E8F0', margin: '0 0 4px' }}>{emoji} {title}</h2>
      <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 20px' }}>{subtitle}</p>
    </>
  );
}

function InputField({ placeholder, value, onChange, multiline, rows }: { placeholder: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number }) {
  const style: React.CSSProperties = { width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(100,120,180,0.2)', fontSize: 14, outline: 'none', background: 'rgba(15,20,40,0.8)', color: '#E2E8F0', boxSizing: 'border-box' as const, marginBottom: 12, fontFamily: 'inherit' };
  if (multiline) return <textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} rows={rows || 3} style={{ ...style, resize: 'none', lineHeight: 1.6 }} />;
  return <input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={style} />;
}

function PrimaryBtn({ label, onClick, color, disabled }: { label: string; onClick: () => void; color?: string; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: 16, borderRadius: 16, border: 'none', fontSize: 16, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#334155' : `linear-gradient(135deg, ${color || '#8a6cf0'}, ${color ? color + 'cc' : '#6c4fd8'})`,
      color: '#fff', boxShadow: disabled ? 'none' : `0 4px 20px ${color || '#8a6cf0'}40`, marginTop: 8, opacity: disabled ? 0.6 : 1,
    }}>{label}</button>
  );
}

function MiniSlider({ label, emoji, value, onChange, max }: { label: string; emoji: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{emoji} {label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD' }}>{value}/{max || 10}</span>
      </div>
      <input type="range" min={1} max={max || 10} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', height: 6, borderRadius: 3, appearance: 'none', background: 'linear-gradient(90deg, rgba(139,92,246,0.3), #8a6cf0)', outline: 'none', cursor: 'pointer' }} />
    </div>
  );
}

function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <p style={{ fontSize: 48 }}>{emoji}</p>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', margin: '12px 0 4px' }}>{title}</p>
      <p style={{ fontSize: 13, color: '#94A3B8' }}>{subtitle}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 1. CBT THOUGHT RECORD — Core cognitive behavioral therapy tool
// ═══════════════════════════════════════════════════
export function CBTScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [records, setRecords] = useState<ThoughtRecord[]>([]);
  const [creating, setCreating] = useState(false);
  const [situation, setSituation] = useState('');
  const [autoThought, setAutoThought] = useState('');
  const [emotion, setEmotion] = useState('');
  const [emotionInt, setEmotionInt] = useState(7);
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [balanced, setBalanced] = useState('');
  const [newInt, setNewInt] = useState(3);

  useEffect(() => { setRecords(storage.getThoughtRecords()); }, []);

  const save = () => {
    if (!situation || !autoThought) return;
    const r: ThoughtRecord = { id: uid(), situation, automaticThought: autoThought, emotion, emotionIntensity: emotionInt, evidenceFor, evidenceAgainst, balancedThought: balanced, newEmotionIntensity: newInt, createdAt: Date.now() };
    storage.saveThoughtRecord(r);
    setRecords(storage.getThoughtRecords());
    setCreating(false);
    setSituation(''); setAutoThought(''); setEmotion(''); setEvidenceFor(''); setEvidenceAgainst(''); setBalanced('');
    showToast('🧠 Thought record saved!');
  };

  if (creating) {
    return (
      <div style={{ padding: '20px 16px' }}>
        <BackBtn nav={() => setCreating(false) as any} to={'home'} />
        <SectionTitle emoji="🧠" title="New Thought Record" subtitle="Challenge unhelpful thinking patterns" />

        <FC style={{ marginBottom: 12, background: '#f8f5ff', padding: 14 }}>
          <p style={{ fontSize: 12, color: '#8a6cf0', fontWeight: 600, margin: 0 }}>💡 CBT helps you identify and reframe negative automatic thoughts. Walk through each step honestly.</p>
        </FC>

        <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '16px 0 6px' }}>1️⃣ What happened?</p>
        <InputField placeholder="Describe the situation briefly..." value={situation} onChange={setSituation} multiline />

        <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '8px 0 6px' }}>2️⃣ Automatic thought</p>
        <InputField placeholder="What went through your mind?" value={autoThought} onChange={setAutoThought} multiline />

        <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '8px 0 6px' }}>3️⃣ Emotion & intensity</p>
        <InputField placeholder="e.g. Anxious, Sad, Angry..." value={emotion} onChange={setEmotion} />
        <MiniSlider label="Intensity before" emoji="💢" value={emotionInt} onChange={setEmotionInt} />

        <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '8px 0 6px' }}>4️⃣ Evidence FOR this thought</p>
        <InputField placeholder="What facts support this thought?" value={evidenceFor} onChange={setEvidenceFor} multiline />

        <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '8px 0 6px' }}>5️⃣ Evidence AGAINST this thought</p>
        <InputField placeholder="What facts challenge this thought?" value={evidenceAgainst} onChange={setEvidenceAgainst} multiline />

        <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '8px 0 6px' }}>6️⃣ Balanced thought</p>
        <InputField placeholder="A more balanced, realistic perspective..." value={balanced} onChange={setBalanced} multiline />

        <MiniSlider label="Intensity after" emoji="🌿" value={newInt} onChange={setNewInt} />

        <PrimaryBtn label="✨ Save Thought Record" onClick={save} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="🧠" title="CBT Thought Records" subtitle="Challenge automatic negative thoughts" />

      <PrimaryBtn label="➕ New Thought Record" onClick={() => setCreating(true)} />

      <div style={{ marginTop: 20 }}>
        {records.length === 0 ? (
          <EmptyState emoji="🧠" title="No records yet" subtitle="Start by challenging a negative thought pattern" />
        ) : (
          records.slice().reverse().map(r => (
            <FC key={r.id} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '0 0 4px' }}>📌 {r.situation.slice(0, 60)}{r.situation.length > 60 ? '...' : ''}</p>
              <p style={{ fontSize: 12, color: '#FF6B6B', margin: '0 0 4px' }}>💭 "{r.automaticThought.slice(0, 80)}"</p>
              {r.balancedThought && <p style={{ fontSize: 12, color: '#6BCB77', margin: '0 0 4px' }}>🌿 "{r.balancedThought.slice(0, 80)}"</p>}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#FF6B6B', fontWeight: 700 }}>Before: {r.emotionIntensity}/10</span>
                <span style={{ color: '#ccc' }}>→</span>
                <span style={{ fontSize: 11, color: '#6BCB77', fontWeight: 700 }}>After: {r.newEmotionIntensity}/10</span>
              </div>
              <p style={{ fontSize: 10, color: '#999', margin: '6px 0 0' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
            </FC>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 2. SAFETY PLAN — Clinical crisis prevention tool
// ═══════════════════════════════════════════════════
export function SafetyPlanScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [plan, setPlan] = useState(storage.getSafetyPlan());
  const [newWarn, setNewWarn] = useState('');
  const [newCope, setNewCope] = useState('');
  const [newDist, setNewDist] = useState('');
  const [newReason, setNewReason] = useState('');
  const [safeEnv, setSafeEnv] = useState(plan.safeEnvironment);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  // Professional contacts use the same supportPeople flow

  const save = (updated: typeof plan) => { setPlan(updated); storage.saveSafetyPlan({ ...updated, updatedAt: Date.now() }); };
  const addItem = (key: 'warningSigns' | 'copingStrategies' | 'distractions' | 'reasonsToLive', val: string, setter: (v: string) => void) => {
    if (!val.trim()) return;
    const updated = { ...plan, [key]: [...plan[key], val.trim()] };
    save(updated); setter('');
  };
  const removeItem = (key: 'warningSigns' | 'copingStrategies' | 'distractions' | 'reasonsToLive', idx: number) => {
    const updated = { ...plan, [key]: plan[key].filter((_: string, i: number) => i !== idx) };
    save(updated);
  };
  const addContact = (key: 'supportPeople' | 'professionals', contact: SafetyContact, setter: (v: any) => void) => {
    if (!contact.name) return;
    const updated = { ...plan, [key]: [...plan[key], contact] };
    save(updated); setter({ name: '', phone: '', relationship: '' });
  };

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="🛡️" title="Safety Plan" subtitle="Your private crisis prevention plan" />

      <FC style={{ marginBottom: 16, background: 'linear-gradient(135deg, #fce7f320, #eadbff20)', padding: 14 }}>
        <p style={{ fontSize: 12, color: '#8a6cf0', fontWeight: 600, margin: 0 }}>💜 This is YOUR plan for difficult moments. Keep it updated. Share with your therapist if you have one.</p>
      </FC>

      {/* Warning Signs */}
      <FC style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 8px' }}>⚠️ Warning Signs</p>
        <p style={{ fontSize: 11, color: '#5C4D76', margin: '0 0 10px' }}>Thoughts, feelings, or behaviors that signal a crisis is developing</p>
        {plan.warningSigns.map((s: string, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f5f0ff' }}>
            <span style={{ fontSize: 13, color: '#2e244c' }}>• {s}</span>
            <button onClick={() => removeItem('warningSigns', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ccc' }}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Add a warning sign..." value={newWarn} onChange={e => setNewWarn(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e0d8f0', fontSize: 13, outline: 'none' }} />
          <button onClick={() => addItem('warningSigns', newWarn, setNewWarn)} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: '#8a6cf0', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+</button>
        </div>
      </FC>

      {/* Coping Strategies */}
      <FC style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 8px' }}>🧘 My Coping Strategies</p>
        {plan.copingStrategies.map((s: string, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f0ff' }}>
            <span style={{ fontSize: 13, color: '#2e244c' }}>• {s}</span>
            <button onClick={() => removeItem('copingStrategies', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ccc' }}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Add a strategy..." value={newCope} onChange={e => setNewCope(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e0d8f0', fontSize: 13, outline: 'none' }} />
          <button onClick={() => addItem('copingStrategies', newCope, setNewCope)} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: '#6BCB77', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+</button>
        </div>
      </FC>

      {/* Distractions */}
      <FC style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 8px' }}>🎨 Healthy Distractions</p>
        {plan.distractions.map((s: string, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f0ff' }}>
            <span style={{ fontSize: 13, color: '#2e244c' }}>• {s}</span>
            <button onClick={() => removeItem('distractions', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ccc' }}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Add a distraction..." value={newDist} onChange={e => setNewDist(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e0d8f0', fontSize: 13, outline: 'none' }} />
          <button onClick={() => addItem('distractions', newDist, setNewDist)} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: '#4D96FF', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+</button>
        </div>
      </FC>

      {/* Support People */}
      <FC style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 8px' }}>👥 People I Can Reach Out To</p>
        {plan.supportPeople.map((c: SafetyContact, i: number) => (
          <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f5f0ff' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', margin: 0 }}>{c.name} — {c.relationship}</p>
            {c.phone && <a href={`tel:${c.phone}`} style={{ fontSize: 12, color: '#8a6cf0' }}>📞 {c.phone}</a>}
          </div>
        ))}
        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
          <input placeholder="Name" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} style={{ padding: 10, borderRadius: 10, border: '1px solid #e0d8f0', fontSize: 13, outline: 'none' }} />
          <input placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} style={{ padding: 10, borderRadius: 10, border: '1px solid #e0d8f0', fontSize: 13, outline: 'none' }} />
          <input placeholder="Relationship" value={newContact.relationship} onChange={e => setNewContact({ ...newContact, relationship: e.target.value })} style={{ padding: 10, borderRadius: 10, border: '1px solid #e0d8f0', fontSize: 13, outline: 'none' }} />
          <button onClick={() => addContact('supportPeople', newContact, setNewContact)} style={{ padding: 10, borderRadius: 10, border: 'none', background: '#8a6cf0', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add Contact</button>
        </div>
      </FC>

      {/* Reasons to Live */}
      <FC style={{ marginBottom: 12, background: 'linear-gradient(135deg, #cbf3e520, #fff)' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 8px' }}>🌟 My Reasons to Keep Going</p>
        {plan.reasonsToLive.map((s: string, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0fff5' }}>
            <span style={{ fontSize: 13, color: '#2e244c' }}>💚 {s}</span>
            <button onClick={() => removeItem('reasonsToLive', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ccc' }}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Add a reason..." value={newReason} onChange={e => setNewReason(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e0d8f0', fontSize: 13, outline: 'none' }} />
          <button onClick={() => addItem('reasonsToLive', newReason, setNewReason)} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: '#6BCB77', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+</button>
        </div>
      </FC>

      {/* Safe Environment */}
      <FC style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 8px' }}>🏠 Making My Environment Safe</p>
        <InputField placeholder="Steps to make my space safer..." value={safeEnv} onChange={setSafeEnv} multiline />
        <button onClick={() => { save({ ...plan, safeEnvironment: safeEnv }); showToast('✅ Saved!'); }} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#8a6cf0', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save</button>
      </FC>

      <p style={{ fontSize: 11, color: '#999', textAlign: 'center', lineHeight: 1.5, marginTop: 16 }}>
        ⚕️ If you are in immediate danger, please call emergency services or a crisis helpline now.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 3. GRATITUDE PRACTICE
// ═══════════════════════════════════════════════════
export function GratitudeScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [items, setItems] = useState(['', '', '']);
  const [reflection, setReflection] = useState('');

  useEffect(() => { setEntries(storage.getGratitudeEntries()); }, []);

  const save = () => {
    const filled = items.filter(i => i.trim());
    if (filled.length === 0) return;
    storage.saveGratitudeEntry({ id: uid(), items: filled, reflection, createdAt: Date.now() });
    setEntries(storage.getGratitudeEntries());
    setItems(['', '', '']); setReflection('');
    showToast('🙏 Gratitude saved!');
  };

  const streak = (() => {
    let count = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 90; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (entries.some(e => new Date(e.createdAt).toDateString() === d.toDateString())) count++;
      else if (i > 0) break;
    }
    return count;
  })();

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="🙏" title="Gratitude Practice" subtitle="Train your brain to notice the good" />

      {streak > 0 && (
        <FC style={{ marginBottom: 16, background: 'linear-gradient(135deg, #FFD93D20, #fff)', textAlign: 'center', padding: 14 }}>
          <span style={{ fontSize: 28 }}>🔥</span>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#2e244c', margin: '4px 0 0' }}>{streak} Day Streak</p>
        </FC>
      )}

      <FC style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 12px' }}>🌸 Today I'm grateful for...</p>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>🌱</span>
            <input placeholder={`Gratitude ${i + 1}...`} value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; setItems(n); }}
              style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #e0d8f0', fontSize: 14, outline: 'none', background: '#faf8ff' }} />
          </div>
        ))}
        {items.length < 5 && (
          <button onClick={() => setItems([...items, ''])} style={{ background: 'none', border: 'none', color: '#8a6cf0', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0' }}>+ Add another</button>
        )}
        <InputField placeholder="Reflection on today's gratitude (optional)..." value={reflection} onChange={setReflection} multiline />
        <PrimaryBtn label="🙏 Save Gratitude" onClick={save} color="#FFD93D" />
      </FC>

      {entries.length > 0 && (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#5C4D76', margin: '0 0 10px', textTransform: 'uppercase' }}>Past Entries</p>
          {entries.slice().reverse().slice(0, 10).map(e => (
            <FC key={e.id} style={{ marginBottom: 10, padding: 14 }}>
              <p style={{ fontSize: 11, color: '#999', margin: '0 0 6px' }}>{new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              {e.items.map((item, i) => <p key={i} style={{ fontSize: 13, color: '#2e244c', margin: '2px 0' }}>🌱 {item}</p>)}
              {e.reflection && <p style={{ fontSize: 12, color: '#5C4D76', margin: '6px 0 0', fontStyle: 'italic' }}>"{e.reflection}"</p>}
            </FC>
          ))}
        </>
      )}
      {entries.length === 0 && <EmptyState emoji="🌱" title="Plant your first seeds" subtitle="Gratitude rewires your brain toward what is good" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 4. SLEEP TRACKER
// ═══════════════════════════════════════════════════
export function SleepTrackerScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(6);
  const [bedtime, setBedtime] = useState('23:00');
  const [wake, setWake] = useState('07:00');
  const [factors, setFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => { setLogs(storage.getSleepLogs()); }, []);

  const SLEEP_FACTORS = ['😰 Stress', '📱 Screen', '☕ Caffeine', '🍷 Alcohol', '💭 Racing thoughts', '🌡️ Temperature', '🔊 Noise', '💊 Medication', '🏋️ Late exercise', '😤 Anxiety'];

  const save = () => {
    storage.saveSleepLog({ id: uid(), bedtime, wakeTime: wake, quality, hoursSlept: hours, factors, notes, createdAt: Date.now() });
    setLogs(storage.getSleepLogs());
    setNotes(''); setFactors([]);
    showToast('🌙 Sleep log saved!');
  };

  const avgQuality = logs.length > 0 ? (logs.reduce((a, l) => a + l.quality, 0) / logs.length).toFixed(1) : '—';
  const avgHours = logs.length > 0 ? (logs.reduce((a, l) => a + l.hoursSlept, 0) / logs.length).toFixed(1) : '—';

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="🌙" title="Sleep Tracker" subtitle="Quality sleep is the foundation of mental health" />

      {logs.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <FC style={{ padding: 14, textAlign: 'center' }}>
            <span style={{ fontSize: 20 }}>⭐</span>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#8a6cf0', margin: '4px 0 0' }}>{avgQuality}</p>
            <p style={{ fontSize: 10, color: '#5C4D76', textTransform: 'uppercase' }}>Avg Quality</p>
          </FC>
          <FC style={{ padding: 14, textAlign: 'center' }}>
            <span style={{ fontSize: 20 }}>⏰</span>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#6BCB77', margin: '4px 0 0' }}>{avgHours}h</p>
            <p style={{ fontSize: 10, color: '#5C4D76', textTransform: 'uppercase' }}>Avg Hours</p>
          </FC>
        </div>
      )}

      <FC style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 12px' }}>Log Last Night's Sleep</p>
        <MiniSlider label="Hours Slept" emoji="⏰" value={hours} onChange={setHours} max={12} />
        <MiniSlider label="Sleep Quality" emoji="⭐" value={quality} onChange={setQuality} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#5C4D76', margin: '0 0 4px' }}>🌙 Bedtime</p>
            <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e0d8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#5C4D76', margin: '0 0 4px' }}>🌅 Wake Time</p>
            <input type="time" value={wake} onChange={e => setWake(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e0d8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        <p style={{ fontSize: 12, fontWeight: 600, color: '#5C4D76', margin: '0 0 8px' }}>Sleep Disruptors</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {SLEEP_FACTORS.map(f => (
            <button key={f} onClick={() => setFactors(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])} style={{
              padding: '6px 12px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              border: factors.includes(f) ? '2px solid #FF6B6B' : '1px solid #e0d8f0',
              background: factors.includes(f) ? '#fff0f0' : '#fff', color: '#2e244c',
            }}>{f}</button>
          ))}
        </div>

        <InputField placeholder="Notes (optional)..." value={notes} onChange={setNotes} />
        <PrimaryBtn label="🌙 Save Sleep Log" onClick={save} color="#4D96FF" />
      </FC>

      {logs.length > 0 && (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#5C4D76', textTransform: 'uppercase', margin: '0 0 10px' }}>Recent Logs</p>
          {logs.slice().reverse().slice(0, 7).map(l => (
            <FC key={l.id} style={{ marginBottom: 8, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', margin: 0 }}>😴 {l.hoursSlept}h · Quality {l.quality}/10</p>
                <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>{new Date(l.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} style={{ fontSize: 12, opacity: i < Math.round(l.quality / 2) ? 1 : 0.2 }}>⭐</span>
                ))}
              </div>
            </FC>
          ))}
        </>
      )}
      {logs.length === 0 && <EmptyState emoji="🌙" title="Start tracking sleep" subtitle="Good sleep is the #1 burnout prevention tool" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 5. GROUNDING EXERCISES (5-4-3-2-1)
// ═══════════════════════════════════════════════════
export function GroundingScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [distressBefore, setDistressBefore] = useState(7);
  const [distressAfter, setDistressAfter] = useState(3);
  const [answers, setAnswers] = useState<string[][]>([[], [], [], [], []]);
  const [currentInput, setCurrentInput] = useState('');
  const [done, setDone] = useState(false);

  const steps = [
    { count: 5, sense: 'SEE', emoji: '👁️', prompt: 'Name 5 things you can see right now', color: '#4D96FF' },
    { count: 4, sense: 'TOUCH', emoji: '🤲', prompt: 'Name 4 things you can feel or touch', color: '#6BCB77' },
    { count: 3, sense: 'HEAR', emoji: '👂', prompt: 'Name 3 things you can hear', color: '#FFD93D' },
    { count: 2, sense: 'SMELL', emoji: '👃', prompt: 'Name 2 things you can smell or imagine', color: '#FF9800' },
    { count: 1, sense: 'TASTE', emoji: '👅', prompt: 'Name 1 thing you can taste or want to taste', color: '#E91E63' },
  ];

  const addAnswer = () => {
    if (!currentInput.trim()) return;
    const newAnswers = [...answers];
    newAnswers[step] = [...newAnswers[step], currentInput.trim()];
    setAnswers(newAnswers);
    setCurrentInput('');
    if (newAnswers[step].length >= steps[step].count) {
      if (step < 4) setStep(step + 1);
      else setDone(true);
    }
  };

  const finish = () => {
    storage.saveGroundingSession({ id: uid(), technique: '5-4-3-2-1', distressBefore, distressAfter, completedAt: Date.now() });
    setActive(false); setDone(false); setStep(0); setAnswers([[], [], [], [], []]);
    showToast('🌿 You anchored yourself beautifully!');
  };

  if (done) {
    return (
      <div style={{ padding: '20px 16px', textAlign: 'center', paddingTop: 60 }}>
        <p style={{ fontSize: 64 }}>🌿</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2e244c', margin: '16px 0 8px' }}>You're here. You're present.</h2>
        <p style={{ fontSize: 14, color: '#5C4D76', margin: '0 0 24px' }}>How does your distress feel now?</p>
        <MiniSlider label="Distress After" emoji="🌿" value={distressAfter} onChange={setDistressAfter} />
        <PrimaryBtn label="✨ Complete" onClick={finish} color="#6BCB77" />
      </div>
    );
  }

  if (active) {
    const s = steps[step];
    return (
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= i ? s.color : '#e0d8f0', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 56 }}>{s.emoji}</span>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2e244c', margin: '12px 0 4px' }}>{s.prompt}</h3>
          <p style={{ fontSize: 13, color: '#5C4D76' }}>{answers[step].length} of {s.count}</p>
        </div>

        {answers[step].map((a, i) => (
          <div key={i} style={{ padding: '10px 14px', background: `${s.color}15`, borderRadius: 12, marginBottom: 6, fontSize: 14, color: '#2e244c' }}>
            ✓ {a}
          </div>
        ))}

        {answers[step].length < s.count && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input placeholder={`Something you can ${s.sense.toLowerCase()}...`} value={currentInput} onChange={e => setCurrentInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAnswer()} autoFocus
              style={{ flex: 1, padding: 14, borderRadius: 14, border: `2px solid ${s.color}40`, fontSize: 14, outline: 'none' }} />
            <button onClick={addAnswer} style={{ padding: '14px 20px', borderRadius: 14, border: 'none', background: s.color, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>+</button>
          </div>
        )}
      </div>
    );
  }

  const sessions = storage.getGroundingSessions();
  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="🌿" title="Grounding" subtitle="Anchor yourself to the present moment" />

      <FC style={{ marginBottom: 16, background: 'linear-gradient(135deg, #cbf3e530, #eadbff20)' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 44 }}>🧘</span>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2e244c', margin: '12px 0 4px' }}>5-4-3-2-1 Technique</h3>
          <p style={{ fontSize: 13, color: '#5C4D76', margin: '0 0 16px', lineHeight: 1.5 }}>Use your senses to bring yourself back to the present. This technique activates your parasympathetic nervous system.</p>
          <MiniSlider label="Current Distress" emoji="😰" value={distressBefore} onChange={setDistressBefore} />
          <PrimaryBtn label="🌿 Begin Grounding" onClick={() => setActive(true)} color="#6BCB77" />
        </div>
      </FC>

      {sessions.length > 0 && (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#5C4D76', textTransform: 'uppercase', margin: '0 0 10px' }}>Past Sessions</p>
          {sessions.slice().reverse().slice(0, 5).map(s => (
            <FC key={s.id} style={{ marginBottom: 8, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#2e244c' }}>🌿 {s.technique}</span>
                <span style={{ fontSize: 12, color: '#999' }}>{new Date(s.completedAt).toLocaleDateString()}</span>
              </div>
              <p style={{ fontSize: 11, color: '#6BCB77', margin: '4px 0 0' }}>Distress: {s.distressBefore} → {s.distressAfter} ({s.distressBefore > s.distressAfter ? '↓ Reduced' : '→ Stable'})</p>
            </FC>
          ))}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 6. MEDICATION TRACKER
// ═══════════════════════════════════════════════════
export function MedicationScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [meds, setMeds] = useState<MedicationEntry[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('09:00');

  useEffect(() => { setMeds(storage.getMedications()); }, []);

  const today = new Date().toDateString();
  const todayMeds = meds.filter(m => m.date === today);

  const addMed = () => {
    if (!name) return;
    const m: MedicationEntry = { id: uid(), name, dosage, time, taken: false, date: today, notes: '' };
    storage.saveMedication(m);
    setMeds(storage.getMedications());
    setAdding(false); setName(''); setDosage('');
    showToast('💊 Medication added!');
  };

  const toggleTaken = (id: string) => {
    const med = meds.find(m => m.id === id);
    if (med) {
      med.taken = !med.taken;
      storage.saveMedication(med);
      setMeds(storage.getMedications());
      showToast(med.taken ? '✅ Taken!' : '⬜ Unmarked');
    }
  };

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="💊" title="Medications" subtitle="Track your daily medications & supplements" />

      {todayMeds.length > 0 && (
        <FC style={{ marginBottom: 16, background: 'linear-gradient(135deg, #eadbff20, #fff)', padding: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#5C4D76', margin: '0 0 10px' }}>Today's Medications</p>
          {todayMeds.map(m => (
            <div key={m.id} onClick={() => toggleTaken(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f0ff', cursor: 'pointer' }}>
              <span style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{m.taken ? '✅' : '⬜'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#2e244c', margin: 0, textDecoration: m.taken ? 'line-through' : 'none' }}>{m.name}</p>
                <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>{m.dosage} · {m.time}</p>
              </div>
            </div>
          ))}
        </FC>
      )}

      {adding ? (
        <FC style={{ marginBottom: 16 }}>
          <InputField placeholder="Medication/Supplement name" value={name} onChange={setName} />
          <InputField placeholder="Dosage (e.g. 10mg, 1 tablet)" value={dosage} onChange={setDosage} />
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#5C4D76', margin: '0 0 4px' }}>⏰ Time</p>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #e0d8f0', fontSize: 14, outline: 'none' }} />
          </div>
          <PrimaryBtn label="💊 Add Medication" onClick={addMed} color="#9B59B6" />
        </FC>
      ) : (
        <PrimaryBtn label="➕ Add Medication" onClick={() => setAdding(true)} />
      )}

      {todayMeds.length === 0 && !adding && <EmptyState emoji="💊" title="No medications today" subtitle="Add your medications and supplements to track them" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 7. SOCIAL CONNECTION TRACKER
// ═══════════════════════════════════════════════════
export function SocialScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [logs, setLogs] = useState<SocialLog[]>([]);
  const [person, setPerson] = useState('');
  const [type, setType] = useState<SocialLog['type']>('in-person');
  const [quality, setQuality] = useState(7);
  const [notes, setNotes] = useState('');

  useEffect(() => { setLogs(storage.getSocialLogs()); }, []);

  const save = () => {
    if (!person) return;
    storage.saveSocialLog({ id: uid(), person, type, quality, duration: '', notes, createdAt: Date.now() });
    setLogs(storage.getSocialLogs()); setPerson(''); setNotes('');
    showToast('👥 Connection logged!');
  };

  const typeEmojis: Record<string, string> = { 'call': '📞', 'text': '💬', 'in-person': '🤝', 'video': '📹' };
  const thisWeek = logs.filter(l => Date.now() - l.createdAt < 7 * 24 * 60 * 60 * 1000);

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="👥" title="Social Connection" subtitle="Isolation accelerates burnout — connection heals" />

      {thisWeek.length > 0 && (
        <FC style={{ marginBottom: 16, textAlign: 'center', padding: 14 }}>
          <p style={{ fontSize: 28, margin: 0 }}>💜</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#2e244c', margin: '4px 0 0' }}>{thisWeek.length}</p>
          <p style={{ fontSize: 11, color: '#5C4D76' }}>Connections this week</p>
        </FC>
      )}

      <FC style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 12px' }}>Log a Connection</p>
        <InputField placeholder="Who did you connect with?" value={person} onChange={setPerson} />

        <p style={{ fontSize: 12, fontWeight: 600, color: '#5C4D76', margin: '0 0 8px' }}>Type</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['in-person', 'call', 'text', 'video'] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              border: type === t ? '2px solid #8a6cf0' : '1px solid #e0d8f0', background: type === t ? '#f3eeff' : '#fff', color: '#2e244c',
            }}>{typeEmojis[t]} {t}</button>
          ))}
        </div>

        <MiniSlider label="Connection Quality" emoji="💜" value={quality} onChange={setQuality} />
        <InputField placeholder="Notes (optional)..." value={notes} onChange={setNotes} />
        <PrimaryBtn label="👥 Log Connection" onClick={save} color="#E91E63" />
      </FC>

      {logs.slice().reverse().slice(0, 10).map(l => (
        <FC key={l.id} style={{ marginBottom: 8, padding: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', margin: 0 }}>{typeEmojis[l.type]} {l.person}</p>
          <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>{new Date(l.createdAt).toLocaleDateString()} · Quality: {l.quality}/10</p>
        </FC>
      ))}
      {logs.length === 0 && <EmptyState emoji="🤝" title="No connections logged" subtitle="Even a short text to a friend counts" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 8. ENERGY BUDGET (Spoon Theory)
// ═══════════════════════════════════════════════════
export function EnergyBudgetScreen({ nav }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [budget, setBudget] = useState<EnergyBudget | null>(null);
  const [totalSpoons, setTotalSpoons] = useState(12);
  const [actName, setActName] = useState('');
  const [actCost, setActCost] = useState(2);
  const [actCat, setActCat] = useState<EnergyActivity['category']>('work');

  const today = new Date().toDateString();
  useEffect(() => {
    const budgets = storage.getEnergyBudgets();
    const todayBudget = budgets.find(b => b.date === today);
    setBudget(todayBudget || null);
  }, []);

  const createBudget = () => {
    const b: EnergyBudget = { id: uid(), date: today, totalSpoons, activities: [], createdAt: Date.now() };
    storage.saveEnergyBudget(b);
    setBudget(b);
  };

  const addActivity = () => {
    if (!actName || !budget) return;
    const updated = { ...budget, activities: [...budget.activities, { name: actName, spoonCost: actCost, completed: false, category: actCat }] };
    storage.saveEnergyBudget(updated);
    setBudget(updated); setActName('');
  };

  const toggleActivity = (idx: number) => {
    if (!budget) return;
    const updated = { ...budget, activities: budget.activities.map((a, i) => i === idx ? { ...a, completed: !a.completed } : a) };
    storage.saveEnergyBudget(updated);
    setBudget(updated);
  };

  const usedSpoons = budget ? budget.activities.filter(a => a.completed).reduce((sum, a) => sum + a.spoonCost, 0) : 0;
  const plannedSpoons = budget ? budget.activities.reduce((sum, a) => sum + a.spoonCost, 0) : 0;
  const remaining = budget ? budget.totalSpoons - usedSpoons : 0;

  const catEmojis: Record<string, string> = { work: '💼', 'self-care': '🧘', social: '👥', health: '🏃', essential: '🏠' };

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="🥄" title="Energy Budget" subtitle="Plan your energy wisely — you have limited spoons" />

      {!budget ? (
        <FC style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 36 }}>🥄</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#2e244c', margin: '12px 0 4px' }}>How many spoons do you have today?</p>
          <p style={{ fontSize: 12, color: '#5C4D76', margin: '0 0 16px' }}>Rate your available energy (6=very low, 12=normal, 18=great)</p>
          <MiniSlider label="Today's Spoons" emoji="🥄" value={totalSpoons} onChange={setTotalSpoons} max={20} />
          <PrimaryBtn label="🥄 Set Today's Budget" onClick={createBudget} color="#FF9800" />
        </FC>
      ) : (
        <>
          {/* Budget Overview */}
          <FC style={{ marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#5C4D76', textTransform: 'uppercase', margin: '0 0 8px' }}>Today's Energy</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 8, flexWrap: 'wrap' }}>
              {Array.from({ length: budget.totalSpoons }, (_, i) => (
                <span key={i} style={{ fontSize: 20, opacity: i < remaining ? 1 : 0.2, transition: 'opacity 0.3s' }}>🥄</span>
              ))}
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: remaining > 3 ? '#6BCB77' : remaining > 0 ? '#FF9800' : '#E74C3C' }}>
              {remaining} spoons remaining
            </p>
            <p style={{ fontSize: 11, color: '#999' }}>{usedSpoons} used · {plannedSpoons} planned</p>
          </FC>

          {/* Activities */}
          {budget.activities.map((a, i) => (
            <FC key={i} onClick={() => toggleActivity(i)} style={{ marginBottom: 8, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', opacity: a.completed ? 0.6 : 1 }}>
              <span style={{ fontSize: 18 }}>{a.completed ? '✅' : '⬜'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#2e244c', margin: 0, textDecoration: a.completed ? 'line-through' : 'none' }}>{a.name}</p>
                <p style={{ fontSize: 11, color: '#999' }}>{catEmojis[a.category]} {a.category} · {a.spoonCost} 🥄</p>
              </div>
            </FC>
          ))}

          {/* Add Activity */}
          <FC style={{ marginTop: 12 }}>
            <InputField placeholder="Activity name..." value={actName} onChange={setActName} />
            <MiniSlider label="Energy Cost" emoji="🥄" value={actCost} onChange={setActCost} max={6} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {(['work', 'self-care', 'social', 'health', 'essential'] as const).map(c => (
                <button key={c} onClick={() => setActCat(c)} style={{
                  padding: '6px 12px', borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: actCat === c ? '2px solid #8a6cf0' : '1px solid #e0d8f0', background: actCat === c ? '#f3eeff' : '#fff', color: '#2e244c',
                }}>{catEmojis[c]} {c}</button>
              ))}
            </div>
            <PrimaryBtn label="➕ Add Activity" onClick={addActivity} color="#FF9800" />
          </FC>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 9. AFFIRMATION CARDS
// ═══════════════════════════════════════════════════
export function AffirmationScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const PRESET = [
    { cat: '💜 Self-Worth', text: "I am enough, exactly as I am right now." },
    { cat: '💪 Strength', text: "I have survived 100% of my hardest days." },
    { cat: '🌿 Peace', text: "I give myself permission to rest without guilt." },
    { cat: '🌱 Growth', text: "I am learning and growing, even when it's hard." },
    { cat: '🧠 Clarity', text: "My feelings are valid. My boundaries are necessary." },
    { cat: '☀️ Hope', text: "This difficult season will not last forever." },
    { cat: '🫁 Calm', text: "I can take things one breath at a time." },
    { cat: '💚 Compassion', text: "I deserve the same kindness I give others." },
    { cat: '🔒 Safety', text: "I am safe right now, in this moment." },
    { cat: '✨ Worth', text: "My worth is not defined by my productivity." },
    { cat: '🌙 Rest', text: "Rest is not laziness — it is recovery." },
    { cat: '🌸 Healing', text: "Healing is not linear, and that's okay." },
  ];

  const [saved, setSaved] = useState<AffirmationEntry[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [custom, setCustom] = useState('');

  useEffect(() => { setSaved(storage.getAffirmations()); }, []);

  const saveAffirmation = (text: string, cat: string) => {
    storage.saveAffirmation({ id: uid(), text, category: cat, isFavorite: false, createdAt: Date.now() });
    setSaved(storage.getAffirmations());
    showToast('💜 Affirmation saved!');
  };

  const card = PRESET[cardIndex];

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="💜" title="Affirmations" subtitle="Words of kindness for yourself" />

      {/* Card Display */}
      <FC style={{ marginBottom: 16, background: 'linear-gradient(135deg, #eadbff40, #ffd5c720)', textAlign: 'center', padding: '32px 20px', minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#8a6cf0', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>{card.cat}</p>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#2e244c', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>"{card.text}"</p>
      </FC>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setCardIndex((cardIndex - 1 + PRESET.length) % PRESET.length)} style={{
          flex: 1, padding: 14, borderRadius: 14, border: '1px solid #e0d8f0', background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#5C4D76'
        }}>← Previous</button>
        <button onClick={() => saveAffirmation(card.text, card.cat)} style={{
          padding: '14px 20px', borderRadius: 14, border: 'none', background: '#8a6cf0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer'
        }}>💜 Save</button>
        <button onClick={() => setCardIndex((cardIndex + 1) % PRESET.length)} style={{
          flex: 1, padding: 14, borderRadius: 14, border: '1px solid #e0d8f0', background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#5C4D76'
        }}>Next →</button>
      </div>

      {/* Custom */}
      <FC style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '0 0 8px' }}>✍️ Write Your Own</p>
        <InputField placeholder="I am..." value={custom} onChange={setCustom} />
        <button onClick={() => { if (custom) { saveAffirmation(custom, '✍️ Custom'); setCustom(''); } }} style={{
          padding: '10px 20px', borderRadius: 12, border: 'none', background: '#6BCB77', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer'
        }}>Save Custom Affirmation</button>
      </FC>

      {saved.length > 0 && (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#5C4D76', textTransform: 'uppercase', margin: '0 0 10px' }}>My Saved ({saved.length})</p>
          {saved.slice().reverse().slice(0, 8).map(a => (
            <FC key={a.id} style={{ marginBottom: 8, padding: 12, background: '#faf8ff' }}>
              <p style={{ fontSize: 13, color: '#2e244c', margin: 0, fontStyle: 'italic' }}>"{a.text}"</p>
              <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0' }}>{a.category}</p>
            </FC>
          ))}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 10. PROGRESSIVE MUSCLE RELAXATION
// ═══════════════════════════════════════════════════
export function PMRScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'tense' | 'release' | 'rest'>('tense');
  const [tensionBefore, setTensionBefore] = useState(7);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const muscles = [
    { name: 'Hands & Fists', emoji: '✊', tenseInst: 'Squeeze your fists as tight as you can', releaseInst: 'Let go completely — feel the warmth' },
    { name: 'Arms & Biceps', emoji: '💪', tenseInst: 'Flex your biceps hard', releaseInst: 'Let your arms go heavy and limp' },
    { name: 'Shoulders', emoji: '🤷', tenseInst: 'Raise your shoulders to your ears', releaseInst: 'Drop them — let all tension melt away' },
    { name: 'Face & Jaw', emoji: '😬', tenseInst: 'Scrunch your face tight, clench your jaw', releaseInst: 'Relax your face — let your jaw drop open' },
    { name: 'Chest & Breathing', emoji: '🫁', tenseInst: 'Take a deep breath and hold it', releaseInst: 'Exhale slowly — let your chest soften' },
    { name: 'Stomach', emoji: '🤸', tenseInst: 'Tighten your core muscles', releaseInst: 'Release — let your belly be soft' },
    { name: 'Legs & Thighs', emoji: '🦵', tenseInst: 'Press your legs together firmly', releaseInst: 'Let them fall apart — heavy and relaxed' },
    { name: 'Feet & Toes', emoji: '🦶', tenseInst: 'Curl your toes tightly', releaseInst: 'Spread them out — feel the release' },
  ];

  const startPMR = () => {
    setActive(true); setStep(0); setPhase('tense'); runPhase('tense', 0);
  };

  const runPhase = (p: 'tense' | 'release' | 'rest', s: number) => {
    const duration = p === 'tense' ? 7 : p === 'release' ? 5 : 3;
    setPhase(p); setSeconds(duration);
    let remaining = duration;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      remaining--;
      setSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (p === 'tense') runPhase('release', s);
        else if (p === 'release') runPhase('rest', s);
        else {
          if (s + 1 < muscles.length) { setStep(s + 1); runPhase('tense', s + 1); }
          else { setActive(false); storage.savePMRSession({ id: uid(), duration: muscles.length * 15, muscleGroups: muscles.map(m => m.name), tensionBefore, tensionAfter: 0, completedAt: Date.now() }); showToast('🧘 PMR session complete!'); }
        }
      }
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (active) {
    const m = muscles[step];
    const phaseColor = phase === 'tense' ? '#FF6B6B' : phase === 'release' ? '#6BCB77' : '#4D96FF';
    return (
      <div style={{ padding: '20px 16px', textAlign: 'center', paddingTop: 40 }}>
        <div style={{ display: 'flex', gap: 3, marginBottom: 24 }}>
          {muscles.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#8a6cf0' : '#e0d8f0' }} />
          ))}
        </div>

        <span style={{ fontSize: 56 }}>{m.emoji}</span>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2e244c', margin: '12px 0' }}>{m.name}</h3>

        <div style={{
          width: 120, height: 120, borderRadius: 60, background: `radial-gradient(circle, ${phaseColor}30, ${phaseColor}10)`,
          border: `3px solid ${phaseColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          margin: '0 auto 20px',
        }}>
          <p style={{ fontSize: 32, fontWeight: 800, color: phaseColor, margin: 0 }}>{seconds}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#2e244c', margin: 0 }}>
            {phase === 'tense' ? 'TENSE' : phase === 'release' ? 'RELEASE' : 'REST'}
          </p>
        </div>

        <p style={{ fontSize: 15, color: '#2e244c', fontWeight: 500, lineHeight: 1.6, padding: '0 20px' }}>
          {phase === 'tense' ? m.tenseInst : phase === 'release' ? m.releaseInst : 'Breathe naturally... notice the difference'}
        </p>

        <button onClick={() => { clearInterval(timerRef.current); setActive(false); }} style={{
          marginTop: 30, padding: '12px 28px', borderRadius: 14, border: '2px solid #e0d8f0', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#5C4D76',
        }}>Stop Session</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="🧘" title="Muscle Relaxation" subtitle="Release physical tension from stress" />

      <FC style={{ marginBottom: 16, textAlign: 'center', background: 'linear-gradient(135deg, #eadbff20, #cbf3e520)' }}>
        <p style={{ fontSize: 40 }}>🧘</p>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2e244c', margin: '12px 0 4px' }}>Progressive Muscle Relaxation</h3>
        <p style={{ fontSize: 13, color: '#5C4D76', margin: '0 0 4px' }}>8 muscle groups · ~2 minutes</p>
        <p style={{ fontSize: 12, color: '#999', margin: '0 0 16px', lineHeight: 1.5 }}>Tense each muscle group for 7 seconds, then release. This teaches your body the difference between tension and relaxation.</p>
        <MiniSlider label="Current Tension" emoji="😬" value={tensionBefore} onChange={setTensionBefore} />
        <PrimaryBtn label="🧘 Start PMR Session" onClick={startPMR} color="#8a6cf0" />
      </FC>

      {(() => {
        const sessions = storage.getPMRSessions();
        if (sessions.length === 0) return <EmptyState emoji="🧘" title="No sessions yet" subtitle="PMR is clinically proven to reduce physical tension from stress" />;
        return (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#5C4D76', textTransform: 'uppercase', margin: '0 0 10px' }}>Past Sessions</p>
            {sessions.slice().reverse().slice(0, 5).map(s => (
              <FC key={s.id} style={{ marginBottom: 8, padding: 14 }}>
                <p style={{ fontSize: 13, color: '#2e244c', margin: 0 }}>🧘 {s.muscleGroups.length} muscle groups · {Math.round(s.duration / 60)}min</p>
                <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>{new Date(s.completedAt).toLocaleDateString()}</p>
              </FC>
            ))}
          </>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 11. MOOD CALENDAR
// ═══════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CalendarScreen({ nav, entries }: { nav: (s: ScreenName) => void; entries: MoodEntry[] }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const moodColors: Record<string, string> = { happy: '#FFD93D', calm: '#6BCB77', neutral: '#4D96FF', anxious: '#FF6B6B', sad: '#9B59B6', angry: '#E74C3C', tired: '#95A5A6' };
  const moodEmojis: Record<string, string> = { happy: '😊', calm: '😌', neutral: '😐', anxious: '😟', sad: '😢', angry: '😤', tired: '😮‍💨' };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getEntryForDay = (day: number) => {
    const date = new Date(year, month, day).toDateString();
    return entries.find(e => new Date(e.timestamp).toDateString() === date);
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="📅" title="Mood Calendar" subtitle="See your emotional journey over time" />

      {/* Month Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#5C4D76', padding: 8 }}>←</button>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2e244c', margin: 0 }}>{monthName}</h3>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#5C4D76', padding: 8 }}>→</button>
      </div>

      {/* Day Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#999', padding: 4 }}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const entry = getEntryForDay(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          return (
            <div key={day} onClick={() => entry && setSelectedEntry(entry)} style={{
              textAlign: 'center', padding: '8px 2px', borderRadius: 12, cursor: entry ? 'pointer' : 'default',
              background: entry ? `${moodColors[entry.mood]}20` : isToday ? '#f3eeff' : 'transparent',
              border: isToday ? '2px solid #8a6cf0' : '1px solid transparent',
            }}>
              <p style={{ fontSize: 10, color: '#2e244c', margin: 0, fontWeight: isToday ? 800 : 400 }}>{day}</p>
              {entry && <span style={{ fontSize: 14 }}>{moodEmojis[entry.mood]}</span>}
            </div>
          );
        })}
      </div>

      {/* Selected Entry Detail */}
      {selectedEntry && (
        <FC style={{ marginTop: 16, background: `${moodColors[selectedEntry.mood]}10` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: 0 }}>{moodEmojis[selectedEntry.mood]} {selectedEntry.mood}</p>
            <button onClick={() => setSelectedEntry(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc' }}>✕</button>
          </div>
          <p style={{ fontSize: 12, color: '#999', margin: '4px 0 8px' }}>{new Date(selectedEntry.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#5C4D76' }}>😰 Stress: {selectedEntry.stress}/10</span>
            <span style={{ fontSize: 12, color: '#5C4D76' }}>⚡ Energy: {selectedEntry.energy}/10</span>
            <span style={{ fontSize: 12, color: '#5C4D76' }}>😴 Sleep: {selectedEntry.sleep}/10</span>
            <span style={{ fontSize: 12, color: '#5C4D76' }}>📋 Workload: {selectedEntry.workload}/10</span>
          </div>
          {selectedEntry.notes && <p style={{ fontSize: 12, color: '#5C4D76', margin: '8px 0 0', fontStyle: 'italic' }}>📝 {selectedEntry.notes}</p>}
        </FC>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 12. WORRY TIME — CBT Containment Technique
// ═══════════════════════════════════════════════════
export function WorryTimeScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [worries, setWorries] = useState<WorryEntry[]>([]);
  const [worry, setWorry] = useState('');
  const [cat, setCat] = useState<'controllable' | 'uncontrollable'>('controllable');
  const [action, setAction] = useState('');
  const [intensity, setIntensity] = useState(6);

  useEffect(() => { setWorries(storage.getWorryEntries()); }, []);

  const save = () => {
    if (!worry) return;
    storage.saveWorryEntry({ id: uid(), worry, category: cat, actionStep: action, intensity, resolved: false, createdAt: Date.now() });
    setWorries(storage.getWorryEntries()); setWorry(''); setAction('');
    showToast('📋 Worry captured!');
  };

  const resolve = (id: string) => {
    const w = worries.find(x => x.id === id);
    if (w) { w.resolved = true; storage.saveWorryEntry(w); setWorries(storage.getWorryEntries()); showToast('✅ Resolved!'); }
  };

  const active = worries.filter(w => !w.resolved);
  const resolved = worries.filter(w => w.resolved);

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="📋" title="Worry Time" subtitle="Contain your worries — don't carry them all day" />

      <FC style={{ marginBottom: 16, background: '#f8f5ff', padding: 14 }}>
        <p style={{ fontSize: 12, color: '#8a6cf0', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>💡 CBT Technique: Write down worries during a scheduled "worry time" instead of letting them run all day. Classify them as controllable or not, then plan action for what you can control.</p>
      </FC>

      <FC style={{ marginBottom: 16 }}>
        <InputField placeholder="What's worrying you?" value={worry} onChange={setWorry} multiline />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['controllable', 'uncontrollable'] as const).map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flex: 1, padding: 10, borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: cat === c ? '2px solid #8a6cf0' : '1px solid #e0d8f0', background: cat === c ? '#f3eeff' : '#fff', color: '#2e244c',
            }}>{c === 'controllable' ? '✅ I can control' : '🌊 Out of my control'}</button>
          ))}
        </div>
        {cat === 'controllable' && <InputField placeholder="My action step..." value={action} onChange={setAction} />}
        <MiniSlider label="Worry Intensity" emoji="😰" value={intensity} onChange={setIntensity} />
        <PrimaryBtn label="📋 Capture Worry" onClick={save} />
      </FC>

      {active.length > 0 && (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#5C4D76', textTransform: 'uppercase', margin: '0 0 10px' }}>Active Worries ({active.length})</p>
          {active.map(w => (
            <FC key={w.id} style={{ marginBottom: 8, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', margin: 0 }}>{w.worry.slice(0, 80)}</p>
                  <p style={{ fontSize: 11, color: w.category === 'controllable' ? '#6BCB77' : '#FF9800', margin: '4px 0 0' }}>
                    {w.category === 'controllable' ? '✅ Controllable' : '🌊 Uncontrollable'}
                  </p>
                  {w.actionStep && <p style={{ fontSize: 11, color: '#8a6cf0', margin: '2px 0 0' }}>🎯 {w.actionStep}</p>}
                </div>
                <button onClick={() => resolve(w.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✅</button>
              </div>
            </FC>
          ))}
        </>
      )}

      {resolved.length > 0 && (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#6BCB77', textTransform: 'uppercase', margin: '16px 0 10px' }}>Resolved ({resolved.length}) ✨</p>
          {resolved.slice(-5).map(w => (
            <FC key={w.id} style={{ marginBottom: 6, padding: 12, opacity: 0.6 }}>
              <p style={{ fontSize: 12, color: '#2e244c', margin: 0, textDecoration: 'line-through' }}>{w.worry.slice(0, 60)}</p>
            </FC>
          ))}
        </>
      )}

      {worries.length === 0 && <EmptyState emoji="📋" title="No worries captured" subtitle="Write it down — getting it out of your head is the first step" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 13. SELF-COMPASSION BREAK (Kristin Neff Protocol)
// ═══════════════════════════════════════════════════
export function SelfCompassionScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [entries, setEntries] = useState<SelfCompassionEntry[]>([]);
  const [situation, setSituation] = useState('');
  const [kindness, setKindness] = useState('');
  const [humanity, setHumanity] = useState('');
  const [mindfulness, setMindfulness] = useState('');

  useEffect(() => { setEntries(storage.getSelfCompassionEntries()); }, []);

  const save = () => {
    if (!situation) return;
    storage.saveSelfCompassionEntry({ id: uid(), situation, selfKindness: kindness, commonHumanity: humanity, mindfulness, createdAt: Date.now() });
    setEntries(storage.getSelfCompassionEntries());
    setSituation(''); setKindness(''); setHumanity(''); setMindfulness('');
    showToast('💚 Self-compassion practice saved!');
  };

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="💚" title="Self-Compassion Break" subtitle="Based on Dr. Kristin Neff's research" />

      <FC style={{ marginBottom: 16, background: 'linear-gradient(135deg, #cbf3e520, #eadbff10)', padding: 14 }}>
        <p style={{ fontSize: 12, color: '#6BCB77', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>💚 Three components: 1) Mindfulness — acknowledge the pain 2) Common Humanity — others feel this too 3) Self-Kindness — treat yourself as you'd treat a friend</p>
      </FC>

      <FC style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '0 0 12px' }}>What's causing you suffering right now?</p>
        <InputField placeholder="Describe the difficult situation..." value={situation} onChange={setSituation} multiline />

        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '8px 0 6px' }}>🧘 Mindfulness</p>
        <p style={{ fontSize: 11, color: '#5C4D76', margin: '0 0 6px' }}>Acknowledge your feelings without judgment</p>
        <InputField placeholder="This is a moment of suffering. I feel..." value={mindfulness} onChange={setMindfulness} multiline />

        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '8px 0 6px' }}>🤝 Common Humanity</p>
        <p style={{ fontSize: 11, color: '#5C4D76', margin: '0 0 6px' }}>Remember you're not alone in this</p>
        <InputField placeholder="Others also struggle with this. I'm not alone because..." value={humanity} onChange={setHumanity} multiline />

        <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: '8px 0 6px' }}>💜 Self-Kindness</p>
        <p style={{ fontSize: 11, color: '#5C4D76', margin: '0 0 6px' }}>What would you say to a dear friend?</p>
        <InputField placeholder="May I give myself what I need. I deserve..." value={kindness} onChange={setKindness} multiline />

        <PrimaryBtn label="💚 Save Practice" onClick={save} color="#6BCB77" />
      </FC>

      {entries.length > 0 && entries.slice().reverse().slice(0, 5).map(e => (
        <FC key={e.id} style={{ marginBottom: 10, padding: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', margin: '0 0 4px' }}>{e.situation.slice(0, 60)}</p>
          {e.selfKindness && <p style={{ fontSize: 12, color: '#6BCB77', margin: '2px 0' }}>💜 {e.selfKindness.slice(0, 80)}</p>}
          <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0' }}>{new Date(e.createdAt).toLocaleDateString()}</p>
        </FC>
      ))}
      {entries.length === 0 && <EmptyState emoji="💚" title="Start your first practice" subtitle="Self-compassion is a skill — the more you practice, the stronger it gets" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 14. EMERGENCY CONTACTS
// ═══════════════════════════════════════════════════
export function EmergencyScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rel, setRel] = useState('');
  const [isTherapist, setIsTherapist] = useState(false);

  useEffect(() => { setContacts(storage.getEmergencyContacts()); }, []);

  const save = () => {
    if (!name) return;
    storage.saveEmergencyContact({ id: uid(), name, phone, relationship: rel, isTherapist });
    setContacts(storage.getEmergencyContacts());
    setAdding(false); setName(''); setPhone(''); setRel('');
    showToast('📞 Contact saved!');
  };

  const remove = (id: string) => {
    storage.deleteEmergencyContact(id);
    setContacts(storage.getEmergencyContacts());
    showToast('🗑️ Contact removed');
  };

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="📞" title="Emergency Contacts" subtitle="Quick access to people who matter" />

      {/* Crisis Lines */}
      <FC style={{ marginBottom: 16, background: 'linear-gradient(135deg, #FF6B6B10, #fff)', borderLeft: '3px solid #FF6B6B' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#E74C3C', margin: '0 0 8px' }}>🆘 Crisis Helplines</p>
        <div style={{ display: 'grid', gap: 6 }}>
          <a href="tel:988" style={{ fontSize: 13, color: '#2e244c', textDecoration: 'none', fontWeight: 600 }}>📞 988 Suicide & Crisis Lifeline (US)</a>
          <a href="tel:741741" style={{ fontSize: 13, color: '#2e244c', textDecoration: 'none', fontWeight: 600 }}>💬 Text HOME to 741741 (Crisis Text)</a>
          <a href="tel:9152987821" style={{ fontSize: 13, color: '#2e244c', textDecoration: 'none', fontWeight: 600 }}>📞 iCall: 9152987821 (India)</a>
          <a href="tel:18602662345" style={{ fontSize: 13, color: '#2e244c', textDecoration: 'none', fontWeight: 600 }}>📞 Vandrevala: 1860-2662-345 (India)</a>
        </div>
      </FC>

      {/* Personal Contacts */}
      {contacts.map(c => (
        <FC key={c.id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: c.isTherapist ? 'linear-gradient(135deg, #6BCB77, #4CAF50)' : 'linear-gradient(135deg, #8a6cf0, #6c4fd8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 20, color: '#fff' }}>{c.isTherapist ? '🏥' : '👤'}</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2e244c', margin: 0 }}>{c.name}</p>
            <p style={{ fontSize: 11, color: '#5C4D76', margin: '2px 0 0' }}>{c.relationship}{c.isTherapist ? ' · Therapist' : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {c.phone && <a href={`tel:${c.phone}`} style={{ padding: '8px 12px', borderRadius: 10, background: '#6BCB77', color: '#fff', fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>📞</a>}
            <button onClick={() => remove(c.id)} style={{ padding: '8px 12px', borderRadius: 10, background: '#fff0f0', border: 'none', cursor: 'pointer', fontSize: 14 }}>🗑️</button>
          </div>
        </FC>
      ))}

      {adding ? (
        <FC style={{ marginTop: 12 }}>
          <InputField placeholder="Name" value={name} onChange={setName} />
          <InputField placeholder="Phone number" value={phone} onChange={setPhone} />
          <InputField placeholder="Relationship" value={rel} onChange={setRel} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input type="checkbox" checked={isTherapist} onChange={e => setIsTherapist(e.target.checked)} />
            <span style={{ fontSize: 13, color: '#2e244c' }}>This is a therapist/professional</span>
          </div>
          <PrimaryBtn label="📞 Save Contact" onClick={save} color="#6BCB77" />
        </FC>
      ) : (
        <PrimaryBtn label="➕ Add Contact" onClick={() => setAdding(true)} />
      )}

      <p style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 16 }}>🔒 All contacts stored locally on your device only</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 15. DAILY WELLNESS SCORE
// ═══════════════════════════════════════════════════
export function WellnessScoreScreen({ nav, showToast }: { nav: (s: ScreenName) => void; showToast: (m: string) => void }) {
  const [scores, setScores] = useState<DailyWellnessScore[]>([]);
  const [physical, setPhysical] = useState(5);
  const [emotional, setEmotional] = useState(5);
  const [social, setSocial] = useState(5);
  const [cognitive, setCognitive] = useState(5);
  const [spiritual, setSpiritual] = useState(5);

  useEffect(() => { setScores(storage.getWellnessScores()); }, []);

  const today = new Date().toDateString();
  const todayScore = scores.find(s => s.date === today);

  const overall = Math.round((physical + emotional + social + cognitive + spiritual) / 5 * 10);

  const save = () => {
    storage.saveWellnessScore({ id: uid(), date: today, physical, emotional, social, cognitive, spiritual, overall, createdAt: Date.now() });
    setScores(storage.getWellnessScores());
    showToast('✨ Wellness score saved!');
  };

  const dimensions = [
    { label: 'Physical', emoji: '🏃', value: physical, onChange: setPhysical, color: '#6BCB77', desc: 'Body, sleep, nutrition, exercise' },
    { label: 'Emotional', emoji: '💜', value: emotional, onChange: setEmotional, color: '#8a6cf0', desc: 'Mood, feelings, emotional regulation' },
    { label: 'Social', emoji: '👥', value: social, onChange: setSocial, color: '#E91E63', desc: 'Connections, support, belonging' },
    { label: 'Cognitive', emoji: '🧠', value: cognitive, onChange: setCognitive, color: '#4D96FF', desc: 'Focus, clarity, mental sharpness' },
    { label: 'Spiritual', emoji: '✨', value: spiritual, onChange: setSpiritual, color: '#FFD93D', desc: 'Purpose, meaning, inner peace' },
  ];

  const overallColor = overall >= 80 ? '#6BCB77' : overall >= 60 ? '#8BC34A' : overall >= 40 ? '#FFC107' : overall >= 20 ? '#FF9800' : '#E74C3C';
  const overallLabel = overall >= 80 ? 'Thriving ✨' : overall >= 60 ? 'Balanced 🌿' : overall >= 40 ? 'Managing 💛' : overall >= 20 ? 'Struggling 🧡' : 'Needs Care 💜';

  return (
    <div style={{ padding: '20px 16px' }}>
      <BackBtn nav={nav} to="home" />
      <SectionTitle emoji="✨" title="Wellness Score" subtitle="A holistic view of your wellbeing" />

      {todayScore ? (
        <FC style={{ marginBottom: 16, textAlign: 'center', background: `linear-gradient(135deg, ${overallColor}15, #fff)` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#5C4D76', textTransform: 'uppercase', margin: '0 0 8px' }}>Today's Score</p>
          <div style={{ width: 100, height: 100, borderRadius: 50, background: `conic-gradient(${overallColor} ${todayScore.overall * 3.6}deg, #f0f0f0 0deg)`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: overallColor }}>{todayScore.overall}%</span>
            </div>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#2e244c' }}>{overallLabel}</p>
        </FC>
      ) : (
        <>
          {/* Overall Preview */}
          <FC style={{ marginBottom: 16, textAlign: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: 50, background: `conic-gradient(${overallColor} ${overall * 3.6}deg, #f0f0f0 0deg)`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 40, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: overallColor }}>{overall}%</span>
              </div>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#2e244c' }}>{overallLabel}</p>
          </FC>

          <FC style={{ marginBottom: 16 }}>
            {dimensions.map(d => (
              <div key={d.label}>
                <p style={{ fontSize: 11, color: '#999', margin: '0 0 2px' }}>{d.desc}</p>
                <MiniSlider label={d.label} emoji={d.emoji} value={d.value} onChange={d.onChange} />
              </div>
            ))}
            <PrimaryBtn label="✨ Save Today's Score" onClick={save} />
          </FC>
        </>
      )}

      {/* History */}
      {scores.length > 0 && (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#5C4D76', textTransform: 'uppercase', margin: '16px 0 10px' }}>History</p>
          {scores.slice().reverse().slice(0, 7).map(s => (
            <FC key={s.id} style={{ marginBottom: 8, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', margin: 0 }}>{new Date(s.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>🏃{s.physical} 💜{s.emotional} 👥{s.social} 🧠{s.cognitive} ✨{s.spiritual}</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: `conic-gradient(${s.overall >= 60 ? '#6BCB77' : '#FFC107'} ${s.overall * 3.6}deg, #f0f0f0 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: 17, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#2e244c' }}>{s.overall}</span>
                </div>
              </div>
            </FC>
          ))}
        </>
      )}
    </div>
  );
}
