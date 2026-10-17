import { TetrominoType, RotationState } from '../types/tetris';

// Standard 4x4 or 3x3 matrices for tetrominoes in 0° orientation
export const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

// Rotate matrix 90 degrees clockwise
export function rotateMatrixCW(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

// Rotate matrix 90 degrees counter-clockwise
export function rotateMatrixCCW(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[n - 1 - c][r] = matrix[r][c];
    }
  }
  return result;
}

// Precomputed rotations for each piece
export const TETROMINO_ROTATIONS: Record<TetrominoType, number[][][]> = {
  I: [
    TETROMINO_SHAPES.I,
    rotateMatrixCW(TETROMINO_SHAPES.I),
    rotateMatrixCW(rotateMatrixCW(TETROMINO_SHAPES.I)),
    rotateMatrixCCW(TETROMINO_SHAPES.I),
  ],
  J: [
    TETROMINO_SHAPES.J,
    rotateMatrixCW(TETROMINO_SHAPES.J),
    rotateMatrixCW(rotateMatrixCW(TETROMINO_SHAPES.J)),
    rotateMatrixCCW(TETROMINO_SHAPES.J),
  ],
  L: [
    TETROMINO_SHAPES.L,
    rotateMatrixCW(TETROMINO_SHAPES.L),
    rotateMatrixCW(rotateMatrixCW(TETROMINO_SHAPES.L)),
    rotateMatrixCCW(TETROMINO_SHAPES.L),
  ],
  O: [
    TETROMINO_SHAPES.O,
    TETROMINO_SHAPES.O,
    TETROMINO_SHAPES.O,
    TETROMINO_SHAPES.O,
  ],
  S: [
    TETROMINO_SHAPES.S,
    rotateMatrixCW(TETROMINO_SHAPES.S),
    rotateMatrixCW(rotateMatrixCW(TETROMINO_SHAPES.S)),
    rotateMatrixCCW(TETROMINO_SHAPES.S),
  ],
  T: [
    TETROMINO_SHAPES.T,
    rotateMatrixCW(TETROMINO_SHAPES.T),
    rotateMatrixCW(rotateMatrixCW(TETROMINO_SHAPES.T)),
    rotateMatrixCCW(TETROMINO_SHAPES.T),
  ],
  Z: [
    TETROMINO_SHAPES.Z,
    rotateMatrixCW(TETROMINO_SHAPES.Z),
    rotateMatrixCW(rotateMatrixCW(TETROMINO_SHAPES.Z)),
    rotateMatrixCCW(TETROMINO_SHAPES.Z),
  ],
};

// Colors for visual themes
export interface PieceColor {
  fill: string;
  glow: string;
  border: string;
  accent: string;
}

export const THEME_COLORS: Record<string, Record<TetrominoType | 'G', PieceColor>> = {
  cyberpunk: {
    I: { fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)', border: '#67e8f9', accent: '#22d3ee' }, // Cyan
    J: { fill: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)', border: '#93c5fd', accent: '#60a5fa' }, // Blue
    L: { fill: '#f97316', glow: 'rgba(249, 115, 22, 0.6)', border: '#fdba74', accent: '#fb923c' }, // Orange
    O: { fill: '#eab308', glow: 'rgba(234, 179, 8, 0.6)', border: '#fef08a', accent: '#facc15' }, // Yellow
    S: { fill: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', border: '#86efac', accent: '#34d399' }, // Green
    T: { fill: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)', border: '#d8b4fe', accent: '#c084fc' }, // Purple
    Z: { fill: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)', border: '#fca5a5', accent: '#f87171' }, // Red
    G: { fill: '#4b5563', glow: 'rgba(75, 85, 99, 0.4)', border: '#6b7280', accent: '#9ca3af' }, // Garbage
  },
  synthwave: {
    I: { fill: '#00f0ff', glow: 'rgba(0, 240, 255, 0.7)', border: '#a5f3fc', accent: '#67e8f9' },
    J: { fill: '#4d4dff', glow: 'rgba(77, 77, 255, 0.7)', border: '#c7d2fe', accent: '#818cf8' },
    L: { fill: '#ff8800', glow: 'rgba(255, 136, 0, 0.7)', border: '#fed7aa', accent: '#fb923c' },
    O: { fill: '#ffee00', glow: 'rgba(255, 238, 0, 0.7)', border: '#fef9c3', accent: '#fde047' },
    S: { fill: '#00ff66', glow: 'rgba(0, 255, 102, 0.7)', border: '#bbf7d0', accent: '#4ade80' },
    T: { fill: '#ff00d4', glow: 'rgba(255, 0, 212, 0.7)', border: '#fbcfe8', accent: '#f472b6' },
    Z: { fill: '#ff0055', glow: 'rgba(255, 0, 85, 0.7)', border: '#fecdd3', accent: '#fb7185' },
    G: { fill: '#374151', glow: 'rgba(55, 65, 81, 0.4)', border: '#4b5563', accent: '#6b7280' },
  },
  gameboy: {
    I: { fill: '#8bac0f', glow: 'rgba(139, 172, 15, 0.5)', border: '#9bbc0f', accent: '#9bbc0f' },
    J: { fill: '#306230', glow: 'rgba(48, 98, 48, 0.5)', border: '#8bac0f', accent: '#408040' },
    L: { fill: '#8bac0f', glow: 'rgba(139, 172, 15, 0.5)', border: '#9bbc0f', accent: '#9bbc0f' },
    O: { fill: '#0f380f', glow: 'rgba(15, 56, 15, 0.5)', border: '#306230', accent: '#1f481f' },
    S: { fill: '#306230', glow: 'rgba(48, 98, 48, 0.5)', border: '#8bac0f', accent: '#408040' },
    T: { fill: '#8bac0f', glow: 'rgba(139, 172, 15, 0.5)', border: '#9bbc0f', accent: '#9bbc0f' },
    Z: { fill: '#0f380f', glow: 'rgba(15, 56, 15, 0.5)', border: '#306230', accent: '#1f481f' },
    G: { fill: '#1b2f1b', glow: 'rgba(27, 47, 27, 0.3)', border: '#2b442b', accent: '#3b553b' },
  },
  classic: {
    I: { fill: '#00d2d3', glow: 'rgba(0, 210, 211, 0.5)', border: '#54a0ff', accent: '#48dbfb' },
    J: { fill: '#2e86de', glow: 'rgba(46, 134, 222, 0.5)', border: '#54a0ff', accent: '#54a0ff' },
    L: { fill: '#ff9f43', glow: 'rgba(255, 159, 67, 0.5)', border: '#feca57', accent: '#feca57' },
    O: { fill: '#feca57', glow: 'rgba(254, 202, 87, 0.5)', border: '#ff9f43', accent: '#ffda79' },
    S: { fill: '#10ac84', glow: 'rgba(16, 172, 132, 0.5)', border: '#1dd1a1', accent: '#1dd1a1' },
    T: { fill: '#9b59b6', glow: 'rgba(155, 89, 182, 0.5)', border: '#c0392b', accent: '#be2edd' },
    Z: { fill: '#ee5253', glow: 'rgba(238, 82, 83, 0.5)', border: '#ff6b6b', accent: '#ff6b6b' },
    G: { fill: '#576574', glow: 'rgba(87, 101, 116, 0.4)', border: '#8395a7', accent: '#8395a7' },
  },
  monochrome: {
    I: { fill: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.5)', border: '#ffffff', accent: '#f8fafc' },
    J: { fill: '#cbd5e1', glow: 'rgba(203, 213, 225, 0.5)', border: '#e2e8f0', accent: '#f1f5f9' },
    L: { fill: '#94a3b8', glow: 'rgba(148, 163, 184, 0.5)', border: '#cbd5e1', accent: '#cbd5e1' },
    O: { fill: '#f1f5f9', glow: 'rgba(241, 245, 249, 0.6)', border: '#ffffff', accent: '#ffffff' },
    S: { fill: '#64748b', glow: 'rgba(100, 116, 139, 0.5)', border: '#94a3b8', accent: '#94a3b8' },
    T: { fill: '#475569', glow: 'rgba(71, 85, 105, 0.5)', border: '#64748b', accent: '#64748b' },
    Z: { fill: '#334155', glow: 'rgba(51, 65, 85, 0.5)', border: '#475569', accent: '#475569' },
    G: { fill: '#1e293b', glow: 'rgba(30, 41, 59, 0.4)', border: '#334155', accent: '#334155' },
  },
};

// Standard SRS (Super Rotation System) Wall Kick data
// Tests offsets [dx, dy] where +x is right, +y is down
export const WALL_KICK_DATA: Record<string, [number, number][]> = {
  // Standard J, L, S, T, Z pieces
  '0->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1->0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1->2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3->2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3->0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],

  // I piece kicks
  'I_0->1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  'I_1->0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  'I_1->2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  'I_2->1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  'I_2->3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  'I_3->2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  'I_3->0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  'I_0->3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

// 7-Bag generator
export function createSevenBag(): TetrominoType[] {
  const pieces: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}

// Initial spawn positions
export function getSpawnPosition(type: TetrominoType): { x: number; y: number } {
  if (type === 'O') {
    return { x: 4, y: 0 };
  }
  if (type === 'I') {
    return { x: 3, y: -1 };
  }
  return { x: 3, y: 0 };
}
