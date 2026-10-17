import React, { useRef, useEffect } from 'react';
import { ActivePiece, BoardMatrix, ThemeName } from '../types/tetris';
import { THEME_COLORS } from '../game/tetrominoes';
import { FloatingText } from '../game/useTetris';
import { Flame } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  isCircle: boolean;
  rotation: number;
  vRot: number;
}

// Global particle array for line clear explosion effects
let particles: Particle[] = [];

export function spawnLineClearParticles(
  clearingRows: number[],
  board: BoardMatrix,
  colors: Record<string, { fill: string }>
) {
  clearingRows.forEach((rowIdx) => {
    for (let colIdx = 0; colIdx < 10; colIdx++) {
      const cellType = board[rowIdx]?.[colIdx];
      const colorHex = cellType && colors[cellType] ? colors[cellType].fill : '#22d3ee';

      const blockCenterX = colIdx * CELL_SIZE + CELL_SIZE / 2;
      const blockCenterY = rowIdx * CELL_SIZE + CELL_SIZE / 2;

      // Spawn 15-20 small particles per block in cleared rows
      const count = Math.floor(Math.random() * 6) + 15;
      for (let i = 0; i < count; i++) {
        // Random velocity exploding outward horizontally and slightly bouncing upward
        const angle = (Math.random() - 0.5) * Math.PI * 1.5;
        const speed = Math.random() * 5 + 2.5;
        const vx = Math.sin(angle) * speed + (Math.random() - 0.5) * 3;
        const vy = -Math.abs(Math.cos(angle) * speed) - Math.random() * 3.5;

        particles.push({
          x: blockCenterX + (Math.random() - 0.5) * (CELL_SIZE * 0.75),
          y: blockCenterY + (Math.random() - 0.5) * (CELL_SIZE * 0.75),
          vx,
          vy,
          size: Math.random() * 3.5 + 2.5,
          color: colorHex,
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.025, // reduces opacity over 35-45 frames
          isCircle: Math.random() > 0.45,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.25,
        });
      }
    }
  });
}

interface BoardProps {
  board: BoardMatrix;
  activePiece: ActivePiece | null;
  ghostY: number;
  clearingRows: number[];
  floatingTexts: FloatingText[];
  screenShake: boolean;
  theme?: ThemeName;
  showGhost?: boolean;
}

const CELL_SIZE = 28; // Size in px per grid block

export const Board: React.FC<BoardProps> = ({
  board,
  activePiece,
  ghostY,
  clearingRows,
  floatingTexts,
  screenShake,
  theme = 'cyberpunk',
  showGhost = true,
}) => {
  const colors = THEME_COLORS[theme] || THEME_COLORS.cyberpunk;

  // Composite active piece and ghost piece on top of static board
  // We'll create a 20x10 cell render map
  const activeCells = new Map<string, { type: string; isGhost: boolean }>();

  if (activePiece) {
    const { shape, x, y, type } = activePiece;

    // First map ghost piece if enabled and not already at bottom
    if (showGhost && ghostY !== y) {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const gy = ghostY + r;
            const gx = x + c;
            if (gy >= 0 && gy < 20 && gx >= 0 && gx < 10) {
              activeCells.set(`${gy}-${gx}`, { type, isGhost: true });
            }
          }
        }
      }
    }

    // Next map active falling piece (overrides ghost)
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const py = y + r;
          const px = x + c;
          if (py >= 0 && py < 20 && px >= 0 && px < 10) {
            activeCells.set(`${py}-${px}`, { type, isGhost: false });
          }
        }
      }
    }
  }

  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevClearingRef = useRef<number[]>([]);

  // Spawn particles whenever rows are marked for clearing
  useEffect(() => {
    if (clearingRows.length > 0 && clearingRows !== prevClearingRef.current) {
      spawnLineClearParticles(clearingRows, board, colors);
    }
    prevClearingRef.current = clearingRows;
  }, [clearingRows, board, colors]);

  // Independent canvas render loop for particle physics and drawing
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (particles.length > 0) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Velocity & gravity physics
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.16; // gravity
          p.vx *= 0.985; // horizontal air drag
          p.alpha -= p.decay; // reduce life timer opacity
          p.rotation += p.vRot;

          // Draw particle
          if (p.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;

            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            if (p.isCircle) {
              ctx.beginPath();
              ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }

            ctx.restore();
          }
        }

        // Filter out dead particles automatically so they don't consume memory
        particles = particles.filter((p) => p.alpha > 0);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className={`relative p-2 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-slate-700/80 shadow-[0_0_35px_rgba(0,0,0,0.8)] transition-transform duration-75 select-none ${
        screenShake ? 'translate-y-1.5 rotate-[-0.5deg]' : ''
      }`}
      style={{
        width: `${CELL_SIZE * 10 + 20}px`,
        height: `${CELL_SIZE * 20 + 20}px`,
      }}
    >
      {/* Background Matrix Grid Lines */}
      <div
        className="relative grid grid-cols-10 grid-rows-20 w-full h-full rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800/80 shadow-inner"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        }}
      >
        {board.map((row, rIdx) =>
          row.map((cellValue, cIdx) => {
            const isClearing = clearingRows.includes(rIdx);
            const activeInfo = activeCells.get(`${rIdx}-${cIdx}`);
            const cellType = activeInfo ? activeInfo.type : cellValue;
            const isGhost = activeInfo ? activeInfo.isGhost : false;
            const pieceColor = cellType ? colors[cellType as keyof typeof colors] : null;

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`relative flex items-center justify-center transition-all duration-75 ${
                  isClearing ? 'animate-pulse scale-95 brightness-200 bg-white/70' : ''
                }`}
                style={{
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                }}
              >
                {cellType && pieceColor && !isClearing && (
                  <div
                    className={`w-[92%] h-[92%] rounded-sm transition-transform ${
                      isGhost ? 'opacity-35 border-dashed border-2' : 'opacity-100'
                    }`}
                    style={{
                      backgroundColor: isGhost
                        ? `${pieceColor.fill}33`
                        : pieceColor.fill,
                      borderColor: pieceColor.border,
                      borderWidth: isGhost ? '2px' : '1px',
                      borderStyle: isGhost ? 'dashed' : 'solid',
                      boxShadow: isGhost
                        ? `0 0 6px ${pieceColor.glow}`
                        : `inset 2px 2px 3px ${pieceColor.border}, inset -2px -2px 3px rgba(0,0,0,0.6), 0 0 8px ${pieceColor.glow}`,
                    }}
                  >
                    {!isGhost && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40 ml-1 mt-1 blur-[0.5px]" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Independent Canvas for Line Clear Particle Explosions */}
        <canvas
          ref={particleCanvasRef}
          width={CELL_SIZE * 10}
          height={CELL_SIZE * 20}
          className="absolute inset-0 pointer-events-none z-20"
        />

        {/* Floating visual notifications (Combos, Line Clears, B2B) */}
        {floatingTexts.map((f) => {
          if (f.isCombo) {
            return (
              <div
                key={f.id}
                className="absolute pointer-events-none z-40 font-mono whitespace-nowrap animate-combo-pop"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                }}
              >
                <div
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 bg-slate-950/95 backdrop-blur-md font-black tracking-wider text-sm md:text-base drop-shadow-2xl"
                  style={{
                    borderColor: f.color,
                    color: f.color,
                    boxShadow: `0 0 24px ${f.color}99, inset 0 0 12px ${f.color}33`,
                    textShadow: `0 0 10px ${f.color}`,
                  }}
                >
                  <Flame className="w-4 h-4 fill-current animate-pulse" />
                  <span>{f.text}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={f.id}
              className="absolute pointer-events-none z-30 font-mono whitespace-nowrap animate-text-float"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
              }}
            >
              <div
                className="px-3 py-1 rounded-full border border-white/20 bg-slate-900/90 backdrop-blur-md font-black tracking-wider text-xs md:text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                style={{
                  color: f.color,
                  textShadow: `0 0 12px ${f.color}`,
                  borderColor: `${f.color}66`,
                }}
              >
                {f.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
