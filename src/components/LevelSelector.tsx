import React from 'react';
import { DailyChallengeInfo, GameMode } from '../types/tetris';
import { BASE_LEVEL_SPEEDS, LEVEL_MISSIONS } from '../game/levelData';
import { Gauge, Sparkles, CheckCircle2, Lock, Calendar, Flame, Clock, Hash } from 'lucide-react';
import { getCompletedLevels } from '../utils/storage';
import { getTimeUntilNextDaily } from '../game/dailyChallenge';

interface LevelSelectorProps {
  currentLevel: number;
  onSelectLevel: (level: number) => void;
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  dailyConfig?: DailyChallengeInfo;
  disabled?: boolean;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  onSelectLevel,
  mode,
  onSelectMode,
  dailyConfig,
  disabled = false,
}) => {
  const completedLevels = getCompletedLevels();

  const getDifficultyLabel = (lvl: number) => {
    if (lvl <= 2) return { label: 'Gentle', color: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (lvl <= 4) return { label: 'Moderate', color: 'text-cyan-400', border: 'border-cyan-500/30' };
    if (lvl <= 6) return { label: 'Brisk', color: 'text-yellow-400', border: 'border-yellow-500/30' };
    if (lvl <= 8) return { label: 'Rapid', color: 'text-orange-400', border: 'border-orange-500/30' };
    return { label: 'Hyper Sonic', color: 'text-red-400', border: 'border-red-500/40' };
  };

  const activeLevel = mode === 'daily' && dailyConfig ? dailyConfig.startLevel : currentLevel;
  const currentDiff = getDifficultyLabel(activeLevel);
  const currentSpeed = BASE_LEVEL_SPEEDS[activeLevel] || 850;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* MODE TABS: ENDLESS | DAILY CHALLENGE | STAGE MISSIONS */}
      <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-800/80 mb-4 gap-1">
        <button
          onClick={() => onSelectMode('endless')}
          disabled={disabled}
          className={`py-2 px-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
            mode === 'endless'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Endless High-Score Run"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="truncate">ENDLESS</span>
        </button>

        <button
          onClick={() => onSelectMode('daily')}
          disabled={disabled}
          className={`py-2 px-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
            mode === 'daily'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Daily Challenge with Fixed Seed"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-300" />
          <span className="truncate">DAILY</span>
        </button>

        <button
          onClick={() => onSelectMode('levels')}
          disabled={disabled}
          className={`py-2 px-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
            mode === 'levels'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Stage Missions"
        >
          <Gauge className="w-3.5 h-3.5" />
          <span className="truncate">STAGES</span>
        </button>
      </div>

      {/* DAILY CHALLENGE VIEW */}
      {mode === 'daily' && dailyConfig ? (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs font-mono">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm">
                <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
                <span>{dailyConfig.modifierName}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-[10px] text-amber-300 font-bold">
                {dailyConfig.scoreMultiplier}x SCORE BONUS
              </span>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
              {dailyConfig.modifierDesc}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-[10px] text-slate-400">
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-cyan-400" />
                <span>Seed: <strong className="text-slate-200">{dailyConfig.seed.toString().slice(0, 7)}</strong></span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Resets in: <strong className="text-slate-200">{getTimeUntilNextDaily()}</strong></span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Fixed Starting Speed:</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-400">Level {dailyConfig.startLevel}</span>
              <span className="text-[10px] text-slate-500 font-bold">({currentSpeed}ms/drop)</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* LEVEL 1 TO 10 SELECTOR HEADER */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider block">
                {mode === 'endless' ? 'Starting Base Level' : 'Mission Stage'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Choose difficulty (Levels 1 - 10)
              </span>
            </div>

            <div className={`px-2.5 py-1 rounded-lg bg-slate-950 border ${currentDiff.border} flex items-center gap-2`}>
              <span className={`text-xs font-extrabold font-mono ${currentDiff.color}`}>
                {currentDiff.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentSpeed}ms/drop
              </span>
            </div>
          </div>

          {/* LEVEL NUMBER BUTTONS (1 TO 10) */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mb-3">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
              const isSelected = currentLevel === lvl;
              const isUnlocked = mode === 'endless' || completedLevels.includes(lvl);
              const speed = BASE_LEVEL_SPEEDS[lvl];

              return (
                <button
                  key={lvl}
                  onClick={() => {
                    if (isUnlocked && !disabled) {
                      onSelectLevel(lvl);
                    }
                  }}
                  disabled={disabled || !isUnlocked}
                  title={`Level ${lvl} (${speed}ms)`}
                  className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl font-mono transition-all group ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-white ring-2 ring-cyan-300 shadow-md shadow-cyan-500/40 scale-105 z-10'
                      : isUnlocked
                      ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60'
                      : 'bg-slate-950/60 text-slate-600 border border-slate-900 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="text-sm font-extrabold">{lvl}</span>
                  <span className="text-[9px] opacity-75 font-mono">{speed}ms</span>

                  {mode === 'levels' && !isUnlocked && (
                    <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-slate-500" />
                  )}
                  {mode === 'levels' && isUnlocked && completedLevels.includes(lvl + 1) && (
                    <CheckCircle2 className="w-2.5 h-2.5 absolute top-1 right-1 text-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* CURRENT MISSION / DESCRIPTION PREVIEW */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono">
            {mode === 'endless' ? (
              <div className="text-slate-300">
                <span className="text-cyan-400 font-bold">Endless Rule: </span>
                Blocks drop at <span className="text-white font-bold">{currentSpeed}ms</span>. Speed smoothly ramps up continuously as you clear lines and survive. No level limits!
              </div>
            ) : (
              (() => {
                const mission = LEVEL_MISSIONS.find((m) => m.levelNumber === currentLevel);
                return (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-pink-400 font-bold">{mission?.name}</span>
                      <span className="text-slate-400 text-[10px]">{mission?.tag}</span>
                    </div>
                    <div className="text-slate-300 text-[11px]">{mission?.description}</div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Goal: <strong className="text-white">{mission?.targetLines} Lines</strong></span>
                      {mission?.targetScore && (
                        <span>Score: <strong className="text-white">{mission.targetScore.toLocaleString()}</strong></span>
                      )}
                      {mission?.initialGarbageRows && (
                        <span className="text-amber-400 font-bold">{mission.initialGarbageRows} Garbage Rows</span>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </>
      )}
    </div>
  );
};
