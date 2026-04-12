import type { MoodEntry, JournalEntry, BurnoutResult, BurnoutSignal } from '../types';

const NEGATIVE_MOODS = ['anxious', 'sad', 'angry', 'tired'];

export function calculateBurnout(entries: MoodEntry[], journals: JournalEntry[]): BurnoutResult {
  const recent = entries.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 14);
  const last7 = recent.slice(0, 7);

  if (last7.length < 3) {
    return { score: 0, level: 'low', trend: 'stable', signals: [], recommendation: 'Log a few more check-ins to activate burnout prediction.', calculatedAt: Date.now() };
  }

  const signals: BurnoutSignal[] = [];
  let score = 0;

  // High stress sustained
  const highStressDays = last7.filter(e => e.stress > 7).length;
  if (highStressDays >= 3) {
    score += 20;
    signals.push({ name: 'Sustained High Stress', emoji: '😰', description: `Stress above 7 for ${highStressDays} of the last 7 days`, severity: highStressDays >= 5 ? 'alert' : 'warning' });
  }

  // Low energy sustained
  const lowEnergyDays = last7.filter(e => e.energy < 4).length;
  if (lowEnergyDays >= 3) {
    score += 15;
    signals.push({ name: 'Low Energy Pattern', emoji: '🔋', description: `Energy below 4 for ${lowEnergyDays} of the last 7 days`, severity: lowEnergyDays >= 5 ? 'alert' : 'warning' });
  }

  // Poor sleep sustained
  const poorSleepDays = last7.filter(e => e.sleep < 5).length;
  if (poorSleepDays >= 3) {
    score += 20;
    signals.push({ name: 'Poor Sleep Pattern', emoji: '😴', description: `Sleep quality below 5 for ${poorSleepDays} days`, severity: poorSleepDays >= 5 ? 'alert' : 'warning' });
  }

  // Negative mood dominance
  const negativeMoodCount = last7.filter(e => NEGATIVE_MOODS.includes(e.mood)).length;
  if (negativeMoodCount > last7.length * 0.6) {
    score += 15;
    signals.push({ name: 'Negative Mood Dominance', emoji: '😟', description: `${negativeMoodCount} of ${last7.length} recent entries show difficult moods`, severity: 'warning' });
  }

  // High workload
  const highWorkloadDays = last7.filter(e => e.workload > 7).length;
  if (highWorkloadDays >= 3) {
    score += 10;
    signals.push({ name: 'Workload Overload', emoji: '📋', description: `Heavy workload for ${highWorkloadDays} days`, severity: 'watch' });
  }

  // Recovery deficit
  const calmDays = last7.filter(e => e.mood === 'calm' || e.mood === 'happy').length;
  if (calmDays === 0 && last7.length >= 5) {
    score += 10;
    signals.push({ name: 'Recovery Deficit', emoji: '🔄', description: 'No calm or happy days detected recently', severity: 'warning' });
  }

  // Missing self-care
  const last5days = 5 * 24 * 60 * 60 * 1000;
  const recentJournals = journals.filter(j => Date.now() - j.createdAt < last5days);
  if (recentJournals.length === 0 && entries.length >= 5) {
    score += 10;
    signals.push({ name: 'Missing Self-Care', emoji: '✍️', description: 'No journal entries in the last 5 days', severity: 'watch' });
  }

  score = Math.min(100, score);

  // Trend
  const prev7 = recent.slice(7, 14);
  let trend: 'improving' | 'stable' | 'worsening' = 'stable';
  if (prev7.length >= 3) {
    const prevStress = prev7.reduce((a, e) => a + e.stress, 0) / prev7.length;
    const curStress = last7.reduce((a, e) => a + e.stress, 0) / last7.length;
    if (curStress < prevStress - 1) trend = 'improving';
    else if (curStress > prevStress + 1) trend = 'worsening';
  }

  const level = score <= 25 ? 'low' : score <= 50 ? 'moderate' : score <= 75 ? 'high' : 'critical';

  const recommendations: Record<string, string> = {
    low: 'You\'re managing well. Keep up your wellness habits! 🌿',
    moderate: 'Some pressure is building. Try a breathing exercise or journal tonight. 🌙',
    high: 'Multiple burnout signals detected. Please prioritize rest and reach out for support. 💜',
    critical: 'Strong burnout pattern detected. Please take a break and consider speaking with a professional. 🆘',
  };

  return {
    score, level, trend, signals,
    recommendation: recommendations[level],
    calculatedAt: Date.now(),
  };
}
