import { DailyChallengeInfo, TetrominoType } from '../types/tetris';

// Mulberry32 PRNG - fast 32-bit deterministic seeded pseudo-random generator
export function createMulberry32(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert a string (e.g. "2026-10-17") to a 32-bit integer seed
export function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic 7-Bag generator using seeded PRNG
export function createSeededSevenBag(rng: () => number): TetrominoType[] {
  const pieces: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}

// Daily challenge presets based on day-of-week or seed
const DAILY_MODIFIERS = [
  {
    modifierName: 'Neon Overdrive',
    modifierDesc: 'Starts at Level 5 speed. All score values boosted by 1.5x!',
    startLevel: 5,
    scoreMultiplier: 1.5,
    initialGarbageRows: 0,
  },
  {
    modifierName: 'Swiss Cheese Excavation',
    modifierDesc: 'Dig through 3 rows of jagged cheese blocks from the start.',
    startLevel: 3,
    scoreMultiplier: 1.25,
    initialGarbageRows: 3,
  },
  {
    modifierName: 'Tetris Hunter',
    modifierDesc: 'Quad line clears (Tetrises) are rewarded with massive 2.0x points!',
    startLevel: 4,
    scoreMultiplier: 1.3,
    initialGarbageRows: 0,
  },
  {
    modifierName: 'Hyper Velocity Blitz',
    modifierDesc: 'Level 7 supersonic drop speed for maximum adrenaline.',
    startLevel: 7,
    scoreMultiplier: 1.75,
    initialGarbageRows: 0,
  },
  {
    modifierName: 'Deep Mineshaft',
    modifierDesc: '4 rows of chaotic ruins at the floor to excavate.',
    startLevel: 4,
    scoreMultiplier: 1.4,
    initialGarbageRows: 4,
  },
  {
    modifierName: 'Flow State',
    modifierDesc: 'Smooth Level 2 start with generous combo scaling multiplier.',
    startLevel: 2,
    scoreMultiplier: 1.2,
    initialGarbageRows: 0,
  },
  {
    modifierName: 'Grandmaster Trial',
    modifierDesc: 'Level 6 speed with 2 garbage rows. The ultimate weekly crucible.',
    startLevel: 6,
    scoreMultiplier: 1.6,
    initialGarbageRows: 2,
  },
];

// Get today's standardized challenge configuration
export function getDailyChallengeConfig(date: Date = new Date()): DailyChallengeInfo {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // Unique deterministic seed
  const seed = hashStringToSeed(`${dateStr}-ARCADE-TETRIS-DAILY-SEED`);

  // Day number since epoch / start
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const modifierIndex = Math.abs(seed) % DAILY_MODIFIERS.length;
  const mod = DAILY_MODIFIERS[modifierIndex];

  return {
    dateStr,
    dayNumber: dayIndex % 1000,
    seed,
    modifierName: mod.modifierName,
    modifierDesc: mod.modifierDesc,
    startLevel: mod.startLevel,
    scoreMultiplier: mod.scoreMultiplier,
    initialGarbageRows: mod.initialGarbageRows,
  };
}

// Calculate hours and minutes until next midnight reset
export function getTimeUntilNextDaily(): string {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const diffMs = tomorrow.getTime() - now.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}
