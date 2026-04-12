import type { MoodEntry, DetectedPattern } from '../types';

const NEGATIVE_MOODS = ['anxious', 'sad', 'angry', 'tired'];

export function detectPatterns(entries: MoodEntry[]): DetectedPattern[] {
  if (entries.length < 3) return [];
  const patterns: DetectedPattern[] = [];
  const sorted = entries.slice().sort((a, b) => b.timestamp - a.timestamp);
  let pid = 0;

  // Tag → outcome correlations
  const tagOutcomes: Record<string, { stress: number[]; energy: number[]; moods: string[] }> = {};
  sorted.forEach(e => {
    e.tags.forEach(tag => {
      if (!tagOutcomes[tag]) tagOutcomes[tag] = { stress: [], energy: [], moods: [] };
      tagOutcomes[tag].stress.push(e.stress);
      tagOutcomes[tag].energy.push(e.energy);
      tagOutcomes[tag].moods.push(e.mood);
    });
  });

  // Detect stress triggers
  for (const [tag, data] of Object.entries(tagOutcomes)) {
    if (data.stress.length >= 3) {
      const avgStress = data.stress.reduce((a, b) => a + b, 0) / data.stress.length;
      if (avgStress > 6) {
        patterns.push({
          id: `p${pid++}`, emoji: '📅', title: `${tag} → Stress Spike`,
          description: `When "${tag}" is present, your average stress is ${avgStress.toFixed(1)}/10`,
          confidence: data.stress.length >= 7 ? 'strong' : data.stress.length >= 5 ? 'confirmed' : 'emerging',
          category: 'trigger', dataPoints: data.stress.length,
        });
      }
    }
  }

  // Recovery patterns: exercise, rest, breaks → lower stress
  for (const [tag, data] of Object.entries(tagOutcomes)) {
    if (['exercise', 'rest', 'breaks', 'meditation', 'walk'].includes(tag) && data.stress.length >= 2) {
      const avgStress = data.stress.reduce((a, b) => a + b, 0) / data.stress.length;
      const globalAvg = sorted.reduce((a, e) => a + e.stress, 0) / sorted.length;
      if (avgStress < globalAvg - 0.5) {
        patterns.push({
          id: `p${pid++}`, emoji: '🌿', title: `${tag} → Lower Stress`,
          description: `Your stress is ${(globalAvg - avgStress).toFixed(1)} points lower on "${tag}" days`,
          confidence: data.stress.length >= 5 ? 'confirmed' : 'emerging',
          category: 'recovery', dataPoints: data.stress.length,
        });
      }
    }
  }

  // Sleep → mood correlation
  const goodSleepEntries = sorted.filter(e => e.sleep >= 7);
  const poorSleepEntries = sorted.filter(e => e.sleep <= 4);
  if (goodSleepEntries.length >= 2 && poorSleepEntries.length >= 2) {
    const goodMoodRate = goodSleepEntries.filter(e => !NEGATIVE_MOODS.includes(e.mood)).length / goodSleepEntries.length;
    const poorMoodRate = poorSleepEntries.filter(e => !NEGATIVE_MOODS.includes(e.mood)).length / poorSleepEntries.length;
    if (goodMoodRate > poorMoodRate + 0.2) {
      patterns.push({
        id: `p${pid++}`, emoji: '🌙', title: 'Sleep → Better Mood',
        description: 'Good sleep nights lead to significantly better mood the next day',
        confidence: goodSleepEntries.length + poorSleepEntries.length >= 8 ? 'strong' : 'confirmed',
        category: 'correlation', dataPoints: goodSleepEntries.length + poorSleepEntries.length,
      });
    }
  }

  // Time of day patterns
  const mornings = sorted.filter(e => e.timeOfDay === 'morning');
  const evenings = sorted.filter(e => e.timeOfDay === 'evening');
  if (mornings.length >= 3 && evenings.length >= 3) {
    const mornEnergy = mornings.reduce((a, e) => a + e.energy, 0) / mornings.length;
    const eveEnergy = evenings.reduce((a, e) => a + e.energy, 0) / evenings.length;
    if (mornEnergy > eveEnergy + 1) {
      patterns.push({
        id: `p${pid++}`, emoji: '🌅', title: 'Morning Person',
        description: 'Your energy and mood tend to be stronger in the morning',
        confidence: 'confirmed', category: 'correlation', dataPoints: mornings.length + evenings.length,
      });
    }
  }

  // Negative mood streak pattern
  const last7 = sorted.slice(0, 7);
  const negStreak = last7.filter(e => NEGATIVE_MOODS.includes(e.mood)).length;
  if (negStreak >= 5) {
    patterns.push({
      id: `p${pid++}`, emoji: '⚠️', title: 'Sustained Difficult Period',
      description: `${negStreak} of your last 7 entries show challenging moods`,
      confidence: 'strong', category: 'trigger', dataPoints: negStreak,
    });
  }

  return patterns;
}
