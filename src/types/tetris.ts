export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type RotationState = 0 | 1 | 2 | 3; // 0: 0°, 1: 90°, 2: 180°, 3: 270°

export interface Position {
  x: number;
  y: number;
}

export interface ActivePiece {
  type: TetrominoType;
  shape: number[][];
  rotation: RotationState;
  x: number;
  y: number;
}

export type CellValue = TetrominoType | null | 'G' | 'FLASH'; // 'G' for garbage block

export type BoardMatrix = CellValue[][]; // 20 rows x 10 cols

export type GameMode = 'endless' | 'levels' | 'daily';

export interface HighScoreRecord {
  id: string;
  score: number;
  lines: number;
  level: number;
  mode: GameMode;
  date: string;
  durationSeconds: number;
  note?: string; // e.g. "Completed", "Game Over", "Quit (Saved)"
}

export interface LevelConfig {
  levelNumber: number;
  name: string;
  speedMs: number;
  targetLines: number;
  targetScore?: number;
  description: string;
  initialGarbageRows?: number;
  tag: string;
}

export interface DailyChallengeInfo {
  dateStr: string; // e.g. "2026-10-17"
  dayNumber: number;
  seed: number;
  modifierName: string;
  modifierDesc: string;
  startLevel: number;
  scoreMultiplier: number;
  initialGarbageRows: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  lines: number;
  level: number;
  combo: number;
  maxCombo: number;
  backToBack: boolean;
  tetrisCount: number;
  singleCount: number;
  doubleCount: number;
  tripleCount: number;
  piecesDropped: number;
  timeElapsed: number; // in seconds
}

export type ThemeName = 'cyberpunk' | 'classic' | 'gameboy' | 'synthwave' | 'monochrome';
