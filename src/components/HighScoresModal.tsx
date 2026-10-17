import React from 'react';
import { Trophy, X, Layers, Gauge, Timer, Award, Calendar, BookmarkCheck } from 'lucide-react';
import { getLeaderboard } from '../utils/storage';

interface HighScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEndlessHigh: number;
  currentLevelHigh: number;
  currentDailyHigh: number;
}

export const HighScoresModal: React.FC<HighScoresModalProps> = ({
  isOpen,
  onClose,
  currentEndlessHigh,
  currentLevelHigh,
  currentDailyHigh,
}) => {
  if (!isOpen) return null;

  const records = getLeaderboard();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-mono text-white tracking-wide">
                HIGH SCORES & RECORDS
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Hall of Fame records saved on this device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Highlights: 3 Modes */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-2.5 flex flex-col">
            <span className="text-[9px] uppercase font-mono font-bold text-cyan-400 truncate">
              Endless Best
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-cyan-300 mt-0.5 truncate">
              {currentEndlessHigh.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-2.5 flex flex-col">
            <span className="text-[9px] uppercase font-mono font-bold text-amber-400 truncate">
              Daily Best
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-amber-300 mt-0.5 truncate">
              {currentDailyHigh.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-purple-500/40 rounded-xl p-2.5 flex flex-col">
            <span className="text-[9px] uppercase font-mono font-bold text-purple-400 truncate">
              Stages Best
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-purple-300 mt-0.5 truncate">
              {currentLevelHigh.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Records Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-sm">
              No game records yet. Start playing Endless, Daily, or Stage missions!
            </div>
          ) : (
            records.map((rec, index) => {
              const isGold = index === 0;
              const isSilver = index === 1;
              const isBronze = index === 2;

              return (
                <div
                  key={rec.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isGold
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-md shadow-amber-500/10'
                      : isSilver
                      ? 'bg-slate-800/60 border-slate-500/60'
                      : isBronze
                      ? 'bg-amber-900/20 border-amber-700/50'
                      : 'bg-slate-950/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center font-mono font-black text-sm ${
                        isGold
                          ? 'text-amber-400'
                          : isSilver
                          ? 'text-slate-300'
                          : isBronze
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      #{index + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold font-mono text-white text-base">
                          {rec.score.toLocaleString()}
                        </span>
                        <span
                          className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase ${
                            rec.mode === 'daily'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : rec.mode === 'endless'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              : 'bg-purple-950 text-purple-400 border border-purple-800'
                          }`}
                        >
                          {rec.mode}
                        </span>

                        {rec.note && (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-0.5">
                            {rec.note.includes('Quit') && <BookmarkCheck className="w-2.5 h-2.5 text-cyan-400" />}
                            {rec.note}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-emerald-400" />
                          {rec.lines} lines
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-purple-400" />
                          Lvl {rec.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3 text-cyan-400" />
                          {Math.floor(rec.durationSeconds / 60)}m {rec.durationSeconds % 60}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {rec.date}
                    </span>
                    {isGold && (
                      <span className="text-[10px] text-amber-400 font-bold font-mono flex items-center justify-end gap-1">
                        <Award className="w-3 h-3" /> BEST
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
