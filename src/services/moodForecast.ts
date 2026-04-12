import type { MoodEntry, MoodType } from '../types';

const MOOD_VALUES: Record<string, number> = {
  happy: 5, calm: 4, neutral: 3, tired: 2, anxious: 1.5, sad: 1, angry: 1,
};

export function forecastMood(entries: MoodEntry[]): { predicted: MoodType; confidence: number; reason: string } | null {
  if (entries.length < 5) return null;
  const sorted = entries.slice().sort((a, b) => b.timestamp - a.timestamp);
  const last5 = sorted.slice(0, 5);
  
  // Momentum: recent trend
  const values = last5.map(e => MOOD_VALUES[e.mood] || 3);
  const trend = (values[0] - values[values.length - 1]) / values.length;
  
  // Day of week pattern
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDay();
  const sameDayEntries = sorted.filter(e => new Date(e.timestamp).getDay() === tomorrowDay);
  
  let predictedValue = values[0] + trend;
  if (sameDayEntries.length >= 2) {
    const dayAvg = sameDayEntries.reduce((a, e) => a + (MOOD_VALUES[e.mood] || 3), 0) / sameDayEntries.length;
    predictedValue = predictedValue * 0.6 + dayAvg * 0.4;
  }
  
  predictedValue = Math.max(1, Math.min(5, predictedValue));
  
  let predicted: MoodType;
  if (predictedValue >= 4.5) predicted = 'happy';
  else if (predictedValue >= 3.5) predicted = 'calm';
  else if (predictedValue >= 2.5) predicted = 'neutral';
  else if (predictedValue >= 1.5) predicted = 'tired';
  else predicted = 'anxious';
  
  const confidence = Math.min(90, 40 + entries.length * 3);
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const reason = sameDayEntries.length >= 2
    ? `Based on your ${dayNames[tomorrowDay]} patterns and recent momentum`
    : `Based on your recent mood trend and activity patterns`;
  
  return { predicted, confidence, reason };
}
