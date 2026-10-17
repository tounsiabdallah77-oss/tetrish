import { HighScoreRecord, GameMode } from '../types/tetris';

const HIGH_SCORE_KEY = 'tetris_endless_high_score';
const LEVEL_HIGH_SCORE_KEY = 'tetris_level_high_score';
const DAILY_HIGH_SCORE_KEY = 'tetris_daily_high_score';
const LEADERBOARD_KEY = 'tetris_leaderboard_records';
const COMPLETED_LEVELS_KEY = 'tetris_completed_levels';

export function getHighScore(mode: GameMode = 'endless', dateStr?: string): number {
  if (typeof window === 'undefined') return 0;
  if (mode === 'daily' && dateStr) {
    const todayVal = localStorage.getItem(`tetris_daily_${dateStr}`);
    if (todayVal) return parseInt(todayVal, 10) || 0;
  }

  let key = HIGH_SCORE_KEY;
  if (mode === 'levels') key = LEVEL_HIGH_SCORE_KEY;
  if (mode === 'daily') key = DAILY_HIGH_SCORE_KEY;

  const val = localStorage.getItem(key);
  return val ? parseInt(val, 10) || 0 : 0;
}

export function saveHighScore(score: number, mode: GameMode = 'endless', dateStr?: string): boolean {
  if (typeof window === 'undefined') return false;

  let isNewOverall = false;
  let key = HIGH_SCORE_KEY;
  if (mode === 'levels') key = LEVEL_HIGH_SCORE_KEY;
  if (mode === 'daily') {
    key = DAILY_HIGH_SCORE_KEY;
    if (dateStr) {
      const todayKey = `tetris_daily_${dateStr}`;
      const todayCurrent = parseInt(localStorage.getItem(todayKey) || '0', 10);
      if (score > todayCurrent) {
        localStorage.setItem(todayKey, score.toString());
      }
    }
  }

  const current = getHighScore(mode);
  if (score > current) {
    localStorage.setItem(key, score.toString());
    isNewOverall = true;
  }

  return isNewOverall;
}

export function getLeaderboard(): HighScoreRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (!data) return [];
    return JSON.parse(data) as HighScoreRecord[];
  } catch {
    return [];
  }
}

export function addLeaderboardRecord(record: Omit<HighScoreRecord, 'id'>): HighScoreRecord[] {
  if (typeof window === 'undefined') return [];
  const current = getLeaderboard();
  const newRecord: HighScoreRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  const updated = [...current, newRecord]
    .sort((a, b) => b.score - a.score)
    .slice(0, 30); // Keep top 30
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  return updated;
}

export function getCompletedLevels(): number[] {
  if (typeof window === 'undefined') return [1]; // Level 1 is always unlocked
  try {
    const data = localStorage.getItem(COMPLETED_LEVELS_KEY);
    if (!data) return [1];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [1];
  } catch {
    return [1];
  }
}

export function markLevelCompleted(levelNum: number): number[] {
  if (typeof window === 'undefined') return [1];
  const completed = getCompletedLevels();
  const nextLevel = levelNum + 1;
  const set = new Set([...completed, levelNum, nextLevel]);
  const arr = Array.from(set).sort((a, b) => a - b);
  localStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(arr));
  return arr;
}
