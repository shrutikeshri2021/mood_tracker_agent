import type { MoodEntry } from '../types';

const MOOD_SCORES: Record<string, number> = {
  happy: 10, calm: 9, neutral: 6, tired: 4, anxious: 3, sad: 2, angry: 2,
};

export function calculateBalance(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const recent = entries.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 7);
  
  const moodScore = recent.reduce((a, e) => a + (MOOD_SCORES[e.mood] || 5), 0) / recent.length / 10;
  const stressScore = 1 - (recent.reduce((a, e) => a + e.stress, 0) / recent.length / 10);
  const energyScore = recent.reduce((a, e) => a + e.energy, 0) / recent.length / 10;
  const sleepScore = recent.reduce((a, e) => a + e.sleep, 0) / recent.length / 10;

  const balance = Math.round((moodScore * 0.3 + stressScore * 0.3 + energyScore * 0.2 + sleepScore * 0.2) * 100);
  return Math.max(0, Math.min(100, balance));
}

export function getBalanceLabel(score: number): { label: string; emoji: string; color: string } {
  if (score >= 80) return { label: 'Thriving', emoji: '✨', color: '#4CAF50' };
  if (score >= 60) return { label: 'Balanced', emoji: '🌿', color: '#8BC34A' };
  if (score >= 40) return { label: 'Managing', emoji: '💛', color: '#FFC107' };
  if (score >= 20) return { label: 'Struggling', emoji: '🧡', color: '#FF9800' };
  return { label: 'Needs Care', emoji: '💜', color: '#E91E63' };
}
