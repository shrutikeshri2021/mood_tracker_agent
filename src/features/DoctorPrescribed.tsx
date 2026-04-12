import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { 
  PHQ9Score, GAD7Score, CognitiveDistortion, BehavioralActivation, 
  DBTSkillLog, BoundaryPlan, 
  SomaticPainLog, 
  SelfCareTask, RelapsePlan, SunlightLog
} from '../types';

interface FeatureProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={`rounded-3xl p-4 backdrop-blur-md ${className || ''}`} style={{ background: 'rgba(12, 18, 35, 0.65)', border: '1px solid rgba(100, 120, 180, 0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
    {children}
  </div>
);

// 1. PHQ-9 Assessment Screen
export const PHQ9Screen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const questions = [
    "Little interest or pleasure in doing things?",
    "Feeling down, depressed, or hopeless?",
    "Trouble falling or staying asleep, or sleeping too much?",
    "Feeling tired or having little energy?",
    "Poor appetite or overeating?",
    "Feeling bad about yourself or that you are a failure?",
    "Trouble concentrating on things, such as reading the newspaper or watching television?",
    "Moving or speaking so slowly that other people could have noticed?",
    "Thoughts that you would be better off dead, or of hurting yourself?"
  ];

  const [answers, setAnswers] = useState<number[]>(new Array(9).fill(0));
  const [history, setHistory] = useState<PHQ9Score[]>([]);

  useEffect(() => {
    setHistory(storage.getPHQ9Scores());
  }, []);

  const calculateScore = () => answers.reduce((a, b) => a + b, 0);

  const getSeverity = (score: number) => {
    if (score < 5) return "Minimal";
    if (score < 10) return "Mild";
    if (score < 15) return "Moderate";
    if (score < 20) return "Moderately Severe";
    return "Severe";
  };

  const handleSave = () => {
    const score = calculateScore();
    const severity = getSeverity(score);
    const log: PHQ9Score = {
      id: crypto.randomUUID(),
      score,
      severity,
      answers,
      loggedAt: Date.now()
    };
    storage.savePHQ9Score(log);
    setHistory(prev => [log, ...prev]);
    showToast(`PHQ-9 saved! Score: ${score} (${severity})`);
    setAnswers(new Array(9).fill(0));
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">PHQ-9 Assessment</h2>
      </div>

      <Card className="p-4 bg-white/90">
        <p className="text-sm text-slate-600 mb-4">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
        
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="space-y-2 pb-2 border-b border-slate-100 last:border-0">
              <p className="text-sm font-medium text-slate-800">{i + 1}. {q}</p>
              <div className="flex justify-between">
                {[0, 1, 2, 3].map(val => (
                  <button
                    key={val}
                    onClick={() => {
                      const newAns = [...answers];
                      newAns[i] = val;
                      setAnswers(newAns);
                    }}
                    className={`text-xs px-2 py-1 rounded-full border transition-all ${
                      answers[i] === val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {val === 0 ? "None" : val === 1 ? "Several" : val === 2 ? "Half" : "Nearly All"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl">
          <p className="font-semibold text-slate-800">Total Score: {calculateScore()}</p>
          <p className="text-sm text-slate-600">Severity: {getSeverity(calculateScore())}</p>
        </div>

        <button onClick={handleSave} className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">
          Save Score
        </button>
      </Card>

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-800">History</h3>
          {history.map(h => (
            <Card key={h.id} className="p-3 bg-white/80 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">Score: {h.score} ({h.severity})</p>
                <p className="text-xs text-slate-500">{new Date(h.loggedAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                h.score < 10 ? 'bg-green-100 text-green-800' : h.score < 15 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                {h.severity}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// 2. GAD-7 Assessment Screen
export const GAD7Screen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const questions = [
    "Feeling nervous, anxious, or on edge?",
    "Not being able to stop or control worrying?",
    "Worrying too much about different things?",
    "Trouble relaxing?",
    "Being so restless that it is hard to sit still?",
    "Becoming easily annoyed or irritable?",
    "Feeling afraid, as if something awful might happen?"
  ];

  const [answers, setAnswers] = useState<number[]>(new Array(7).fill(0));
  const [history, setHistory] = useState<GAD7Score[]>([]);

  useEffect(() => {
    setHistory(storage.getGAD7Scores());
  }, []);

  const calculateScore = () => answers.reduce((a, b) => a + b, 0);

  const getSeverity = (score: number) => {
    if (score < 5) return "Minimal";
    if (score < 10) return "Mild";
    if (score < 15) return "Moderate";
    return "Severe";
  };

  const handleSave = () => {
    const score = calculateScore();
    const severity = getSeverity(score);
    const log: GAD7Score = {
      id: crypto.randomUUID(),
      score,
      severity,
      answers,
      loggedAt: Date.now()
    };
    storage.saveGAD7Score(log);
    setHistory(prev => [log, ...prev]);
    showToast(`GAD-7 saved! Score: ${score} (${severity})`);
    setAnswers(new Array(7).fill(0));
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">GAD-7 Anxiety Scale</h2>
      </div>

      <Card className="p-4 bg-white/90">
        <p className="text-sm text-slate-600 mb-4">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
        
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="space-y-2 pb-2 border-b border-slate-100 last:border-0">
              <p className="text-sm font-medium text-slate-800">{i + 1}. {q}</p>
              <div className="flex justify-between">
                {[0, 1, 2, 3].map(val => (
                  <button
                    key={val}
                    onClick={() => {
                      const newAns = [...answers];
                      newAns[i] = val;
                      setAnswers(newAns);
                    }}
                    className={`text-xs px-2 py-1 rounded-full border transition-all ${
                      answers[i] === val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {val === 0 ? "None" : val === 1 ? "Several" : val === 2 ? "Half" : "Nearly All"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl">
          <p className="font-semibold text-slate-800">Total Score: {calculateScore()}</p>
          <p className="text-sm text-slate-600">Severity: {getSeverity(calculateScore())}</p>
        </div>

        <button onClick={handleSave} className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">
          Save Score
        </button>
      </Card>

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-800">History</h3>
          {history.map(h => (
            <Card key={h.id} className="p-3 bg-white/80 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">Score: {h.score} ({h.severity})</p>
                <p className="text-xs text-slate-500">{new Date(h.loggedAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                h.score < 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {h.severity}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// 3. Cognitive Distortions Screen
export const CognitiveDistortionsScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const distortionsList = [
    "All-or-Nothing Thinking", "Catastrophizing", "Personalization", 
    "Mind Reading", "Fortune Telling", "Should Statements", 
    "Emotional Reasoning", "Mental Filtering"
  ];

  const [thought, setThought] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [reframed, setReframed] = useState('');
  const [history, setHistory] = useState<CognitiveDistortion[]>([]);

  useEffect(() => {
    setHistory(storage.getCognitiveDistortions());
  }, []);

  const handleSave = () => {
    if (!thought || selected.length === 0 || !reframed) {
      showToast("Please fill in all fields.");
      return;
    }
    const log: CognitiveDistortion = {
      id: crypto.randomUUID(),
      thought,
      distortions: selected,
      reframedThought: reframed,
      loggedAt: Date.now()
    };
    storage.saveCognitiveDistortion(log);
    setHistory(prev => [log, ...prev]);
    showToast("Distortion captured and reframed!");
    setThought('');
    setSelected([]);
    setReframed('');
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">Cognitive Distortions</h2>
      </div>

      <Card className="p-4 bg-white/90 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">What is the automatic thought?</label>
          <input
            type="text"
            value={thought}
            onChange={e => setThought(e.target.value)}
            className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm"
            placeholder="e.g. I failed the test, I am a loser."
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Which distortions are present?</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {distortionsList.map(d => (
              <button
                key={d}
                onClick={() => setSelected(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                className={`text-xs p-2 rounded-xl border text-left transition-all ${
                  selected.includes(d) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Reframe into balanced thought</label>
          <textarea
            value={reframed}
            onChange={e => setReframed(e.target.value)}
            className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm h-20"
            placeholder="e.g. I didn't do well, but I can study more. One test doesn't define me."
          />
        </div>

        <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">
          Log & Reframe
        </button>
      </Card>

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-800">History</h3>
          {history.map(h => (
            <Card key={h.id} className="p-4 bg-white/80 space-y-2">
              <p className="text-sm font-bold text-slate-800">Thought: <span className="font-normal text-slate-600">{h.thought}</span></p>
              <div className="flex flex-wrap gap-1">
                {h.distortions.map((d, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">{d}</span>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-800">Reframed: <span className="font-normal text-slate-600">{h.reframedThought}</span></p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. Behavioral Activation (Activity Scheduling)
export const BehavioralActivationScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [activity, setActivity] = useState('');
  const [type, setType] = useState<'pleasure' | 'mastery'>('pleasure');
  const [expectedMood, setExpectedMood] = useState(5);
  const [history, setHistory] = useState<BehavioralActivation[]>([]);

  useEffect(() => {
    setHistory(storage.getBehavioralActivations());
  }, []);

  const handleSave = () => {
    if (!activity) return;
    const log: BehavioralActivation = {
      id: crypto.randomUUID(),
      activity,
      type,
      expectedMood,
      actualMood: 0,
      completed: false,
      date: new Date().toLocaleDateString()
    };
    storage.saveBehavioralActivation(log);
    setHistory(prev => [log, ...prev]);
    showToast("Activity scheduled!");
    setActivity('');
  };

  const handleComplete = (id: string, actualMood: number) => {
    storage.updateBehavioralActivation(id, { completed: true, actualMood });
    setHistory(prev => prev.map(a => a.id === id ? { ...a, completed: true, actualMood } : a));
    showToast("Activity marked completed!");
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">Behavioral Activation</h2>
      </div>

      <Card className="p-4 bg-white/90 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Schedule Activity</label>
          <input
            type="text"
            value={activity}
            onChange={e => setActivity(e.target.value)}
            className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm"
            placeholder="e.g. Go for a 20 min walk, Organize desk"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Type</label>
          <div className="flex space-x-2 mt-1">
            <button onClick={() => setType('pleasure')} className={`flex-1 py-2 text-xs rounded-xl border ${type === 'pleasure' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700'}`}>Pleasure (Joy)</button>
            <button onClick={() => setType('mastery')} className={`flex-1 py-2 text-xs rounded-xl border ${type === 'mastery' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700'}`}>Mastery (Accomplishment)</button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Expected Mood Boost (1-10)</label>
          <input type="range" min="1" max="10" value={expectedMood} onChange={e => setExpectedMood(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-full appearance-none mt-2" />
          <div className="flex justify-between text-xs text-slate-500 mt-1"><span>1</span><span>{expectedMood}</span><span>10</span></div>
        </div>

        <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">
          Schedule Activity
        </button>
      </Card>

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-800">Schedule</h3>
          {history.map(a => (
            <Card key={a.id} className="p-4 bg-white/80 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-800">{a.activity}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${a.type === 'pleasure' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}`}>{a.type}</span>
              </div>
              <p className="text-xs text-slate-500">Expected Mood: {a.expectedMood}</p>
              {!a.completed ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-700">Actual mood:</span>
                  <input type="number" min="1" max="10" defaultValue="5" id={`mood-${a.id}`} className="w-16 p-1 bg-slate-100 rounded text-xs" />
                  <button onClick={() => {
                    const input = document.getElementById(`mood-${a.id}`) as HTMLInputElement;
                    handleComplete(a.id, Number(input.value));
                  }} className="px-3 py-1 bg-green-600 text-white rounded-xl text-xs">Complete</button>
                </div>
              ) : (
                <p className="text-xs text-green-700 font-medium">Completed! Actual Mood: {a.actualMood}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// 5. Hydration Tracking (Water vs Caffeine Balance)
export const HydrationScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [water, setWater] = useState(0);
  const [caffeine, setCaffeine] = useState(0);

  useEffect(() => {
    const todayLog = storage.getHydrationLogByDate(new Date().toLocaleDateString());
    if (todayLog) {
      setWater(todayLog.waterGlasses);
      setCaffeine(todayLog.caffeineCups);
    }
  }, []);

  const handleUpdate = (type: 'water' | 'caffeine', delta: number) => {
    const date = new Date().toLocaleDateString();
    let newWater = water;
    let newCaffeine = caffeine;

    if (type === 'water') {
      newWater = Math.max(0, water + delta);
      setWater(newWater);
    } else {
      newCaffeine = Math.max(0, caffeine + delta);
      setCaffeine(newCaffeine);
    }

    storage.saveHydrationLog({
      id: crypto.randomUUID(),
      waterGlasses: newWater,
      caffeineCups: newCaffeine,
      date
    });

    if (delta > 0) {
      showToast(`${type === 'water' ? 'Water 💧' : 'Caffeine ☕'} cup added!`);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">Hydration Balance</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 bg-white/90 flex flex-col items-center justify-center space-y-2">
          <span className="text-4xl">💧</span>
          <span className="font-medium text-slate-800">Water Glasses</span>
          <span className="text-2xl font-bold text-indigo-600">{water}</span>
          <div className="flex space-x-2">
            <button onClick={() => handleUpdate('water', -1)} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg">-</button>
            <button onClick={() => handleUpdate('water', 1)} className="px-3 py-1 bg-indigo-600 text-white rounded-lg">+</button>
          </div>
        </Card>

        <Card className="p-6 bg-white/90 flex flex-col items-center justify-center space-y-2">
          <span className="text-4xl">☕</span>
          <span className="font-medium text-slate-800">Caffeine Cups</span>
          <span className="text-2xl font-bold text-orange-600">{caffeine}</span>
          <div className="flex space-x-2">
            <button onClick={() => handleUpdate('caffeine', -1)} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg">-</button>
            <button onClick={() => handleUpdate('caffeine', 1)} className="px-3 py-1 bg-orange-600 text-white rounded-lg">+</button>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-white/90">
        <h3 className="font-semibold text-slate-800 mb-2">Clinical Note</h3>
        <p className="text-xs text-slate-600">Doctors recommend drinking at least 8 cups of water. Excess caffeine can fuel anxiety and disrupt sleep.</p>
        {caffeine > water / 2 && caffeine > 2 && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-lg text-xs">
            ⚠️ Alert: Your caffeine intake is high relative to water. Try to balance it out with a cup of water.
          </div>
        )}
      </Card>
    </div>
  );
};

// 6. Sunlight Tracker Screen
export const SunlightScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [minutes, setMinutes] = useState(0);
  const [type, setType] = useState<'morning' | 'afternoon'>('morning');
  const [history, setHistory] = useState<SunlightLog[]>([]);

  useEffect(() => {
    setHistory(storage.getSunlightLogs());
  }, []);

  const handleSave = () => {
    if (minutes <= 0) return;
    const log: SunlightLog = {
      id: crypto.randomUUID(),
      minutes,
      type,
      date: new Date().toLocaleDateString()
    };
    storage.saveSunlightLog(log);
    setHistory(prev => [log, ...prev]);
    showToast(`Sunlight exposure saved for today: ${minutes} min!`);
    setMinutes(0);
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">Sunlight Tracker</h2>
      </div>

      <Card className="p-4 bg-white/90 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Time under direct sunlight (Minutes)</label>
          <input
            type="number"
            value={minutes || ''}
            onChange={e => setMinutes(Number(e.target.value))}
            className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm"
            placeholder="e.g. 15, 30"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Type of exposure</label>
          <div className="flex space-x-2 mt-1">
            <button onClick={() => setType('morning')} className={`flex-1 py-2 text-xs rounded-xl border ${type === 'morning' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-700'}`}>☀️ Morning Light</button>
            <button onClick={() => setType('afternoon')} className={`flex-1 py-2 text-xs rounded-xl border ${type === 'afternoon' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-700'}`}>⛅ Afternoon Light</button>
          </div>
        </div>

        <button onClick={handleSave} className="w-full py-3 bg-orange-600 text-white rounded-xl font-medium">
          Log Sunlight
        </button>
      </Card>

      <Card className="p-4 bg-white/90">
        <h3 className="font-semibold text-slate-800 mb-2">Clinical Importance</h3>
        <p className="text-xs text-slate-600">Morning sunlight resets your circadian rhythm, promoting better sleep at night and improving serotonin production for mood.</p>
      </Card>

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-800">Log History</h3>
          {history.map(h => (
            <Card key={h.id} className="p-3 bg-white/80 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">{h.minutes} mins ({h.type})</p>
                <p className="text-xs text-slate-500">{h.date}</p>
              </div>
              <span className="text-2xl">☀️</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// 7. DBT Skills Screen
export const DBTSkillsScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [skillType, setSkillType] = useState<'TIPP' | 'STOP' | 'WiseMind' | 'SelfSoothe'>('TIPP');
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(5);
  const [history, setHistory] = useState<DBTSkillLog[]>([]);

  useEffect(() => {
    setHistory(storage.getDBTSkillLogs());
  }, []);

  const handleSave = () => {
    const log: DBTSkillLog = {
      id: crypto.randomUUID(),
      skillType,
      intensityBefore: before,
      intensityAfter: after,
      loggedAt: Date.now()
    };
    storage.saveDBTSkillLog(log);
    setHistory(prev => [log, ...prev]);
    showToast(`${skillType} DBT Skill Logged!`);
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">DBT Skills</h2>
      </div>

      <Card className="p-4 bg-white/90 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Dialectical Behavior Skill Applied</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {['TIPP', 'STOP', 'WiseMind', 'SelfSoothe'].map(s => (
              <button key={s} onClick={() => setSkillType(s as any)} className={`p-2 text-xs rounded-xl border ${skillType === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700'}`}>
                {s === 'TIPP' ? '🌡️ TIPP' : s === 'STOP' ? '✋ STOP' : s === 'WiseMind' ? '☯️ Wise Mind' : '💆 Self-Soothe'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-700">Distress Before (1-10)</label>
            <input type="number" min="1" max="10" value={before} onChange={e => setBefore(Number(e.target.value))} className="w-full mt-1 p-2 bg-slate-50 border-0 rounded-xl text-xs" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Distress After (1-10)</label>
            <input type="number" min="1" max="10" value={after} onChange={e => setAfter(Number(e.target.value))} className="w-full mt-1 p-2 bg-slate-50 border-0 rounded-xl text-xs" />
          </div>
        </div>

        <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">
          Log Skill Use
        </button>
      </Card>

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-800">History</h3>
          {history.map(h => (
            <Card key={h.id} className="p-3 bg-white/80 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">{h.skillType}</p>
                <p className="text-xs text-slate-500">Dropped distress from {h.intensityBefore} to {h.intensityAfter}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const BoundariesScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [person, setPerson] = useState('');
  const [boundary, setBoundary] = useState('');
  const [script, setScript] = useState('');
  const [history, setHistory] = useState<BoundaryPlan[]>([]);

  useEffect(() => {
    setHistory(storage.getBoundaryPlans());
  }, []);

  const handleSave = () => {
    if (!person || !boundary) return;
    const log: BoundaryPlan = {
      id: crypto.randomUUID(),
      person,
      boundary,
      script,
      successLevel: 0,
      loggedAt: Date.now()
    };
    storage.saveBoundaryPlan(log);
    setHistory(prev => [log, ...prev]);
    showToast("Boundary planned!");
    setPerson('');
    setBoundary('');
    setScript('');
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">Interpersonal Boundaries</h2>
      </div>

      <Card className="p-4 bg-white/90 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">With Whom?</label>
          <input type="text" value={person} onChange={e => setPerson(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm" placeholder="e.g. Spouse, Boss" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">The Boundary</label>
          <input type="text" value={boundary} onChange={e => setBoundary(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm" placeholder="e.g. No emails after 7pm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">What will you say? (Script)</label>
          <textarea value={script} onChange={e => setScript(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm h-16" placeholder="e.g. I won't respond to work emails after 7pm." />
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">Save Boundary Plan</button>
      </Card>

      {history.length > 0 && (
        <div className="space-y-2">
          {history.map(h => (
            <Card key={h.id} className="p-4 bg-white/80 space-y-2">
              <p className="text-sm font-bold text-slate-800">With: {h.person}</p>
              <p className="text-xs text-slate-700">Constraint: {h.boundary}</p>
              <div className="p-2 bg-slate-50 rounded-lg text-xs italic text-slate-600">"{h.script}"</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const SomaticPainScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [location, setLocation] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState<SomaticPainLog[]>([]);

  useEffect(() => {
    setHistory(storage.getSomaticPainLogs());
  }, []);

  const handleSave = () => {
    if (!location) return;
    const log: SomaticPainLog = {
      id: crypto.randomUUID(),
      location,
      intensity,
      description,
      loggedAt: Date.now()
    };
    storage.saveSomaticPainLog(log);
    setHistory(prev => [log, ...prev]);
    showToast("Pain log saved!");
    setLocation('');
    setDescription('');
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">Pain Mapping</h2>
      </div>

      <Card className="p-4 bg-white/90 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Location</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Intensity (1-10)</label>
          <input type="range" min="1" max="10" value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-full appearance-none mt-2" />
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">Log Pain</button>
      </Card>

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-800">History</h3>
          {history.map(h => (
            <Card key={h.id} className="p-3 bg-white/80 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">{h.location}</p>
                <p className="text-xs text-slate-500">Intensity: {h.intensity}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const BehavioralExperimentScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [prediction, setPrediction] = useState('');
  const [percent, setPercent] = useState(50);
  const [outcome, setOutcome] = useState('');

  const handleSave = () => {
    if (!prediction) return;
    storage.saveBehavioralExperiment({
      id: crypto.randomUUID(),
      prediction,
      expectedDisasterPercent: percent,
      actualOutcome: outcome,
      learnt: '',
      loggedAt: Date.now()
    });
    showToast("Behavioral experiment recorded!");
    setPrediction('');
    setOutcome('');
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">Behavioral Experiments</h2>
      </div>

      <Card className="p-4 bg-white/90 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Anxious Prediction</label>
          <textarea value={prediction} onChange={e => setPrediction(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm h-16" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">How likely is it? (1-100%)</label>
          <input type="range" min="1" max="100" value={percent} onChange={e => setPercent(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-full appearance-none mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Actual Outcome</label>
          <textarea value={outcome} onChange={e => setOutcome(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm h-16" />
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">Log Experiment</button>
      </Card>
    </div>
  );
};

export const SelfCareChecklistScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [task, setTask] = useState('');
  const [history, setHistory] = useState<SelfCareTask[]>([]);

  useEffect(() => {
    setHistory(storage.getSelfCareTasks());
  }, []);

  const handleSave = () => {
    if (!task) return;
    const log: SelfCareTask = {
      id: crypto.randomUUID(),
      task,
      category: 'hygiene',
      completed: false,
      date: new Date().toLocaleDateString()
    };
    storage.saveSelfCareTask(log);
    setHistory(prev => [log, ...prev]);
    showToast("Self-care task added!");
    setTask('');
  };

  const handleToggle = (id: string, completed: boolean) => {
    storage.updateSelfCareTask(id, { completed });
    setHistory(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">Self-Care Checklist</h2>
      </div>

      <Card className="p-4 bg-white/90 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Add Task</label>
          <input type="text" value={task} onChange={e => setTask(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm" />
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">Add Task</button>
      </Card>

      {history.length > 0 && (
        <div className="space-y-2">
          {history.map(t => (
            <Card key={t.id} className="p-3 bg-white/80 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={t.completed} onChange={e => handleToggle(t.id, e.target.checked)} className="h-4 w-4" />
                <span className={`text-sm ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.task}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const RelapsePlanScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [trigger, setTrigger] = useState('');
  const [sign, setSign] = useState('');
  const [action, setAction] = useState('');
  const [plan, setPlan] = useState<RelapsePlan | null>(null);

  useEffect(() => {
    setPlan(storage.getRelapsePlan() || {
      id: crypto.randomUUID(),
      triggers: [],
      earlySigns: [],
      preventiveActions: [],
      rescueContacts: [],
      updatedAt: Date.now()
    });
  }, []);

  const handleUpdate = (type: 'triggers' | 'signs' | 'actions', value: string) => {
    if (!value || !plan) return;
    const updatedPlan = { ...plan };
    if (type === 'triggers') updatedPlan.triggers.push(value);
    if (type === 'signs') updatedPlan.earlySigns.push(value);
    if (type === 'actions') updatedPlan.preventiveActions.push(value);
    updatedPlan.updatedAt = Date.now();

    storage.saveRelapsePlan(updatedPlan);
    setPlan(updatedPlan);
    showToast("Plan updated!");
    setTrigger(''); setSign(''); setAction('');
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">Relapse Plan</h2>
      </div>

      <Card className="p-4 bg-white/90 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Add Trigger</label>
          <div className="flex space-x-2 mt-1">
            <input type="text" value={trigger} onChange={e => setTrigger(e.target.value)} className="flex-1 p-3 bg-slate-50 border-0 rounded-xl text-sm" />
            <button onClick={() => handleUpdate('triggers', trigger)} className="px-4 bg-indigo-600 text-white rounded-xl">+</button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Add Early Signs</label>
          <div className="flex space-x-2 mt-1">
            <input type="text" value={sign} onChange={e => setSign(e.target.value)} className="flex-1 p-3 bg-slate-50 border-0 rounded-xl text-sm" />
            <button onClick={() => handleUpdate('signs', sign)} className="px-4 bg-indigo-600 text-white rounded-xl">+</button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Add Action</label>
          <div className="flex space-x-2 mt-1">
            <input type="text" value={action} onChange={e => setAction(e.target.value)} className="flex-1 p-3 bg-slate-50 border-0 rounded-xl text-sm" />
            <button onClick={() => handleUpdate('actions', action)} className="px-4 bg-indigo-600 text-white rounded-xl">+</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const DigitalWellbeingScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const today = new Date().toISOString().slice(0,10);
  const [appHours, setAppHours] = useState(2);
  const [detoxMinutes, setDetoxMinutes] = useState(30);
  const [moodImpact, setMoodImpact] = useState(5);

  const handleSave = () => {
    storage.saveDigitalWellbeingLog({ id: crypto.randomUUID(), appHours, detoxMinutes, moodImpact, date: today });
    showToast('📱 Digital wellbeing logged!');
  };

  const tips = ['No phone 30 min before bed 🌙', 'Greyscale screen after 9pm 🎨', 'Use app timers for social media ⏱️', 'Phone-free meals 🍽️', 'Airplane mode during focus 🛫'];

  return (
    <div style={{ padding: '20px 16px', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: '#5C4D76', cursor: 'pointer', fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#2e244c', margin: '0 0 4px' }}>📱 Digital Wellbeing</h2>
      <p style={{ fontSize: 14, color: '#5C4D76', margin: '0 0 20px' }}>Track screen time and its impact on your mood</p>
      <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#2e244c' }}>📱 Screen Time Today (hours): {appHours}h</label>
          <input type="range" min={0} max={16} value={appHours} onChange={e => setAppHours(+e.target.value)} style={{ width: '100%', marginTop: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#2e244c' }}>🧘 Digital Detox Time (min): {detoxMinutes}m</label>
          <input type="range" min={0} max={120} value={detoxMinutes} onChange={e => setDetoxMinutes(+e.target.value)} style={{ width: '100%', marginTop: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#2e244c' }}>😊 Mood Impact from screens: {moodImpact}/10</label>
          <input type="range" min={1} max={10} value={moodImpact} onChange={e => setMoodImpact(+e.target.value)} style={{ width: '100%', marginTop: 8 }} />
        </div>
        <button onClick={handleSave} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#8a6cf0,#6c4fd8)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Save Log</button>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '0 0 12px' }}>💡 Healthy Digital Habits</p>
        {tips.map((t, i) => <div key={i} style={{ padding: '10px 14px', background: '#f8f5ff', borderRadius: 12, marginBottom: 8, fontSize: 13, color: '#2e244c' }}>{t}</div>)}
      </div>
    </div>
  );
};

export const ForgivenessScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [grudge, setGrudge] = useState('');
  const [willingness, setWillingness] = useState(5);
  const [affirmation, setAffirmation] = useState('');

  const handleSave = () => {
    if (!grudge.trim()) return;
    storage.saveForgivenessLog({ id: crypto.randomUUID(), grudge, willingnessToRelease: willingness, replacementAffirmation: affirmation, loggedAt: Date.now() });
    showToast('💜 Forgiveness practice saved');
    setGrudge(''); setAffirmation(''); setWillingness(5);
  };

  return (
    <div style={{ padding: '20px 16px', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: '#5C4D76', cursor: 'pointer', fontWeight: 600, marginBottom: 20 }}>← Back</button>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#2e244c', margin: '0 0 4px' }}>💜 Forgiveness Practice</h2>
      <p style={{ fontSize: 14, color: '#5C4D76', margin: '0 0 20px' }}>Release what weighs you down — for your own peace</p>
      <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', display: 'block', marginBottom: 6 }}>What are you holding onto?</label>
          <textarea value={grudge} onChange={e => setGrudge(e.target.value)} placeholder="Describe the grudge or hurt..." rows={3} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e0d8f0', fontSize: 14, resize: 'none', outline: 'none', background: '#faf8ff', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#2e244c' }}>Willingness to release ({willingness}/10)</label>
          <input type="range" min={0} max={10} value={willingness} onChange={e => setWillingness(+e.target.value)} style={{ width: '100%', marginTop: 8 }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#2e244c', display: 'block', marginBottom: 6 }}>Replacement affirmation</label>
          <input value={affirmation} onChange={e => setAffirmation(e.target.value)} placeholder="e.g. I choose peace over resentment" style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e0d8f0', fontSize: 14, outline: 'none', background: '#faf8ff', boxSizing: 'border-box' }} />
        </div>
        <button onClick={handleSave} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#8a6cf0,#6c4fd8)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Save Practice</button>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#f3e8ff,#fce7f3)', borderRadius: 20, padding: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#2e244c', margin: '0 0 8px' }}>💡 Remember</p>
        <p style={{ fontSize: 13, color: '#5C4D76', lineHeight: 1.6 }}>Forgiveness is not condoning what happened. It is choosing to free yourself from the burden of carrying it. You deserve peace. 💜</p>
      </div>
    </div>
  );
};

export const MeaningExistentialScreen: React.FC<FeatureProps> = ({ onBack, showToast }) => {
  const [value, setValue] = useState('');
  const [action, setAction] = useState('');

  const handleSave = () => {
    if (!value) return;
    storage.saveExistentialLog({
      id: crypto.randomUUID(),
      value,
      alignedActions: [action],
      fulfillmentScore: 0,
      loggedAt: Date.now()
    });
    showToast("Values & Meaning aligned!");
    setValue('');
    setAction('');
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 bg-white/80 rounded-full shadow-sm">←</button>
        <h2 className="text-xl font-bold text-slate-800">Values & Meaning</h2>
      </div>

      <Card className="p-4 bg-white/90 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Core Value</label>
          <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Committed Action</label>
          <input type="text" value={action} onChange={e => setAction(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-sm" />
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium">Log Intention</button>
      </Card>
    </div>
  );
};
