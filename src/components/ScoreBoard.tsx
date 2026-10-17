import React from 'react';
import { GameMode, GameStats } from '../types/tetris';
import { Trophy, Flame, Zap, Timer, Award } from 'lucide-react';
import { calculateEndlessSpeed, BASE_LEVEL_SPEEDS } from '../game/levelData';

interface ScoreBoardProps {
  stats: GameStats;
  mode: GameMode;
  startingLevel: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ stats, mode, startingLevel }) => {
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Current falling speed in ms
  const currentSpeed =
    mode === 'endless'
      ? calculateEndlessSpeed(startingLevel, stats.lines, stats.timeElapsed)
      : BASE_LEVEL_SPEEDS[Math.min(startingLevel, 10)] || 500;

  const getHighScoreLabel = () => {
    if (mode === 'daily') return "Today's Challenge High";
    if (mode === 'levels') return 'Stage High Score';
    return 'Endless High Score';
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* ALL-TIME HIGH SCORE (PROMINENT BADGE) */}
      <div
        className={`relative overflow-hidden rounded-xl p-3 border transition-all duration-300 ${
          isNewHighScore
            ? 'bg-gradient-to-r from-amber-950/80 via-yellow-900/50 to-amber-950/80 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.35)] animate-pulse'
            : 'bg-slate-900/90 border-amber-500/40 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono block">
                {getHighScoreLabel()}
              </span>
              <span className="text-xl font-extrabold text-amber-300 font-mono tracking-tight">
                {stats.highScore.toLocaleString()}
              </span>
            </div>
          </div>
          {isNewHighScore && (
            <span className="text-[10px] font-bold text-amber-900 bg-amber-400 px-2 py-0.5 rounded-full font-mono animate-bounce">
              NEW RECORD!
            </span>
          )}
        </div>
      </div>

      {/* CURRENT RUN SCORE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md backdrop-blur-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
          Current Score
        </span>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
            {stats.score.toLocaleString()}
          </span>
          {stats.backToBack && (
            <span className="text-[9px] font-bold text-fuchsia-400 bg-fuchsia-950/80 border border-fuchsia-800 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
              <Award className="w-3 h-3" /> B2B ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* STATS TILES: LINES & LEVEL */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
            Lines
          </span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            {stats.lines}
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
            {mode === 'endless' ? 'Base Level' : 'Level'}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-purple-400 font-mono">
              {stats.level}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {currentSpeed}ms
            </span>
          </div>
        </div>
      </div>

      {/* SPEED & COMBO STATUS */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] font-mono text-slate-400">Tempo</span>
          </div>
          <span className="text-xs font-bold text-yellow-400 font-mono">
            {Math.round(1000 / currentSpeed)} drops/s
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className={`w-3.5 h-3.5 ${stats.combo > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`} />
            <span className="text-[10px] font-mono text-slate-400">Combo</span>
          </div>
          <span className={`text-xs font-bold font-mono ${stats.combo > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
            {stats.combo > 0 ? `x${stats.combo}` : '0'}
          </span>
        </div>
      </div>

      {/* TIME SURVIVED */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center justify-between text-slate-400 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-cyan-400" />
          <span>Survival Time</span>
        </div>
        <span className="text-slate-200 font-bold">{formatTime(stats.timeElapsed)}</span>
      </div>
    </div>
  );
};
