import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  CornerDownLeft,
  Hand,
} from 'lucide-react';

interface VirtualControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onDown: () => void;
  onRotateCW: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  disabled?: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onLeft,
  onRight,
  onDown,
  onRotateCW,
  onHardDrop,
  onHold,
  disabled = false,
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-md select-none touch-none">
      {/* D-Pad Left / Down / Right */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onLeft}
          disabled={disabled}
          className="w-13 h-13 active:scale-90 flex items-center justify-center rounded-xl bg-slate-800 active:bg-cyan-600 text-slate-100 border border-slate-700 shadow-md font-bold transition-transform"
          aria-label="Move Left (A / Q / Left)"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onClick={onDown}
          disabled={disabled}
          className="w-13 h-13 active:scale-90 flex items-center justify-center rounded-xl bg-slate-800 active:bg-emerald-600 text-slate-100 border border-slate-700 shadow-md font-bold transition-transform"
          aria-label="Soft Drop (S / Down)"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        <button
          onClick={onRight}
          disabled={disabled}
          className="w-13 h-13 active:scale-90 flex items-center justify-center rounded-xl bg-slate-800 active:bg-cyan-600 text-slate-100 border border-slate-700 shadow-md font-bold transition-transform"
          aria-label="Move Right (D / Right)"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons: Hold, Rotate, Hard Drop */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onHold}
          disabled={disabled}
          className="w-12 h-12 active:scale-90 flex flex-col items-center justify-center rounded-xl bg-blue-900/60 active:bg-blue-600 text-blue-200 border border-blue-700/60 shadow-md transition-transform"
          aria-label="Hold Piece (C / Shift)"
        >
          <Hand className="w-4 h-4" />
          <span className="text-[9px] font-mono font-bold mt-0.5">HOLD</span>
        </button>

        <button
          onClick={onRotateCW}
          disabled={disabled}
          className="w-13 h-13 active:scale-90 flex items-center justify-center rounded-xl bg-purple-900/70 active:bg-purple-600 text-purple-100 border border-purple-700/70 shadow-md font-bold transition-transform"
          aria-label="Rotate (W / Z / Up)"
        >
          <RotateCw className="w-6 h-6" />
        </button>

        <button
          onClick={onHardDrop}
          disabled={disabled}
          className="w-13 h-13 active:scale-90 flex flex-col items-center justify-center rounded-xl bg-yellow-900/60 active:bg-yellow-500 text-yellow-200 active:text-black border border-yellow-700/60 shadow-md transition-transform"
          aria-label="Hard Drop (Space)"
        >
          <CornerDownLeft className="w-5 h-5" />
          <span className="text-[8px] font-mono font-bold">DROP</span>
        </button>
      </div>
    </div>
  );
};
