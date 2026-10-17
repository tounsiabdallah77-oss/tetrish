import React from 'react';
import { TetrominoType, ThemeName } from '../types/tetris';
import { TETROMINO_SHAPES, THEME_COLORS } from '../game/tetrominoes';

interface PiecePreviewProps {
  type: TetrominoType | null;
  label: string;
  theme?: ThemeName;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({
  type,
  label,
  theme = 'cyberpunk',
  size = 'md',
  disabled = false,
}) => {
  const shape = type ? TETROMINO_SHAPES[type] : null;
  const colors = THEME_COLORS[theme] || THEME_COLORS.cyberpunk;
  const pieceColor = type ? colors[type] : null;

  const cellSize = size === 'sm' ? 18 : 22;
  const gridSize = 4;

  return (
    <div className="flex flex-col items-center bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-lg shadow-black/40 backdrop-blur-sm">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono flex items-center justify-between w-full">
        <span>{label}</span>
        {disabled && (
          <span className="text-[9px] text-amber-400/80 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
            LOCKED
          </span>
        )}
      </div>

      <div
        className="relative flex items-center justify-center bg-slate-950/70 border border-slate-800/80 rounded-lg p-2 overflow-hidden transition-all duration-200"
        style={{
          width: `${cellSize * gridSize + 16}px`,
          height: `${cellSize * 3 + 16}px`,
        }}
      >
        {shape && pieceColor ? (
          <div
            className={`grid gap-0.5 transition-opacity ${
              disabled ? 'opacity-40 grayscale' : 'opacity-100'
            }`}
            style={{
              gridTemplateColumns: `repeat(${shape[0].length}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${shape.length}, ${cellSize}px)`,
            }}
          >
            {shape.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="rounded-sm transition-transform"
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: cell ? pieceColor.fill : 'transparent',
                    boxShadow: cell
                      ? `inset 1px 1px 2px ${pieceColor.border}, inset -1px -1px 2px rgba(0,0,0,0.5), 0 0 6px ${pieceColor.glow}`
                      : 'none',
                    border: cell ? `1px solid ${pieceColor.border}` : 'none',
                  }}
                />
              ))
            )}
          </div>
        ) : (
          <div className="text-slate-600 text-xs font-mono font-medium tracking-widest">
            EMPTY
          </div>
        )}
      </div>
    </div>
  );
};
