import React from 'react';
import { Keyboard, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, CornerDownLeft, RotateCw, Hand } from 'lucide-react';

interface ControlsGuideProps {
  activeKeys: {
    left: boolean;
    right: boolean;
    down: boolean;
    rotate: boolean;
    drop: boolean;
    hold: boolean;
  };
}

export const ControlsGuide: React.FC<ControlsGuideProps> = ({ activeKeys }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-slate-300">
        <Keyboard className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-bold font-mono tracking-wider uppercase">
          Supported Controls (Arrows • WASD • ZQSD)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
        {/* MOVE LEFT */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
            activeKeys.left
              ? 'bg-cyan-950/80 border-cyan-500 shadow-md shadow-cyan-500/20 text-cyan-300 scale-[1.02]'
              : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Move Left</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-white">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-cyan-400">
              A
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-emerald-400" title="AZERTY">
              Q
            </kbd>
          </div>
        </div>

        {/* MOVE RIGHT */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
            activeKeys.right
              ? 'bg-cyan-950/80 border-cyan-500 shadow-md shadow-cyan-500/20 text-cyan-300 scale-[1.02]'
              : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Move Right</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-white">
              →
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-cyan-400">
              D
            </kbd>
          </div>
        </div>

        {/* ROTATE CLOCKWISE */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
            activeKeys.rotate
              ? 'bg-purple-950/80 border-purple-500 shadow-md shadow-purple-500/20 text-purple-300 scale-[1.02]'
              : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold">Rotate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-white">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-purple-400">
              W
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-pink-400" title="AZERTY">
              Z
            </kbd>
          </div>
        </div>

        {/* SOFT DROP */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
            activeKeys.down
              ? 'bg-emerald-950/80 border-emerald-500 shadow-md shadow-emerald-500/20 text-emerald-300 scale-[1.02]'
              : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Soft Drop</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-white">
              ↓
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-emerald-400">
              S
            </kbd>
          </div>
        </div>

        {/* HARD DROP */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
            activeKeys.drop
              ? 'bg-yellow-950/80 border-yellow-500 shadow-md shadow-yellow-500/20 text-yellow-300 scale-[1.02]'
              : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <CornerDownLeft className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-semibold">Hard Drop</span>
          </div>
          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-yellow-300">
            SPACE
          </kbd>
        </div>

        {/* HOLD PIECE */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
            activeKeys.hold
              ? 'bg-blue-950/80 border-blue-500 shadow-md shadow-blue-500/20 text-blue-300 scale-[1.02]'
              : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold">Hold Swap</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-white">
              C
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-blue-400">
              SHIFT
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
