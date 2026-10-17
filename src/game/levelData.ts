import { LevelConfig } from '../types/tetris';

// Standard speed curve: Level 1 to 15 (falling interval in ms)
// Level 1 = 800ms, Level 5 = 450ms, Level 10 = 160ms, etc.
export const BASE_LEVEL_SPEEDS: Record<number, number> = {
  1: 850,
  2: 720,
  3: 600,
  4: 500,
  5: 420,
  6: 340,
  7: 280,
  8: 220,
  9: 170,
  10: 130,
  11: 100,
  12: 80,
  13: 65,
  14: 50,
  15: 38,
};

// Calculate falling speed in Endless Mode
// Smooth gradual continuous ramp-up as lines and time increase!
export function calculateEndlessSpeed(startLevel: number, linesCleared: number, elapsedSeconds: number): number {
  const baseSpeed = BASE_LEVEL_SPEEDS[Math.min(startLevel, 10)] || 850;
  // Speed reduces by 3% for every line cleared, and 1% for every 10 seconds of survival
  const lineFactor = Math.pow(0.97, Math.min(linesCleared, 100));
  const timeFactor = Math.pow(0.99, Math.min(elapsedSeconds / 10, 60));
  const calculated = baseSpeed * lineFactor * timeFactor;
  // Min speed floor 40ms so it remains playable for superhuman reflex
  return Math.max(40, Math.round(calculated));
}

// 12 Handcrafted Stage / Level Missions for Levels Mode
export const LEVEL_MISSIONS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: 'Neon Dawn',
    speedMs: 850,
    targetLines: 10,
    description: 'Master the basics. Clear 10 lines at a relaxed rhythm.',
    tag: 'Intro',
  },
  {
    levelNumber: 2,
    name: 'Pulse Accelerate',
    speedMs: 720,
    targetLines: 12,
    description: 'Pick up the tempo. Clear 12 lines to calibrate your reflex.',
    tag: 'Flow',
  },
  {
    levelNumber: 3,
    name: 'Double Up',
    speedMs: 600,
    targetLines: 15,
    description: 'Reach 15 lines. Try stacking clean Doubles and Triples.',
    tag: 'Stacking',
  },
  {
    levelNumber: 4,
    name: 'Swiss Cheese Dig',
    speedMs: 520,
    targetLines: 15,
    initialGarbageRows: 3,
    description: 'Excavate 3 rows of irregular garbage blocks at the bottom!',
    tag: 'Garbage Dig',
  },
  {
    levelNumber: 5,
    name: 'Tetris Hunter',
    speedMs: 420,
    targetLines: 16,
    targetScore: 4000,
    description: 'Hunt for 4-line Tetrises to rack up 4,000 points.',
    tag: 'Score Rush',
  },
  {
    levelNumber: 6,
    name: 'High Frequency',
    speedMs: 340,
    targetLines: 18,
    description: 'Fast drops require quick placement and rotation foresight.',
    tag: 'Speed',
  },
  {
    levelNumber: 7,
    name: 'Deep Canyon',
    speedMs: 280,
    targetLines: 15,
    initialGarbageRows: 5,
    description: 'Dig down through 5 layers of jagged garbage blocks!',
    tag: 'Heavy Dig',
  },
  {
    levelNumber: 8,
    name: 'Combo Surge',
    speedMs: 230,
    targetLines: 20,
    description: 'Maintain consecutive clears to build massive combo multipliers.',
    tag: 'Mastery',
  },
  {
    levelNumber: 9,
    name: 'Hyper Velocity',
    speedMs: 180,
    targetLines: 20,
    description: 'Blocks drop in under 200ms. Keep your stack flat and low.',
    tag: 'High Speed',
  },
  {
    levelNumber: 10,
    name: 'Apex Grandmaster',
    speedMs: 130,
    targetLines: 25,
    initialGarbageRows: 4,
    description: 'The ultimate test: 4 garbage rows at Level 10 supersonic speed!',
    tag: 'Grandmaster',
  },
];
