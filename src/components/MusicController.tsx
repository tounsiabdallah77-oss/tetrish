import React, { useState, useEffect } from 'react';
import { soundManager } from '../audio/soundManager';
import { Music, Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';

export const MusicController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(soundManager.getIsMusicPlaying());
  const [enabled, setEnabled] = useState<boolean>(soundManager.getMusicEnabled());
  const [volume, setVolume] = useState<number>(soundManager.getMusicVolume());

  useEffect(() => {
    const unsub = soundManager.onMusicStateChange((playing) => {
      setIsPlaying(playing);
      setEnabled(soundManager.getMusicEnabled());
    });
    return unsub;
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundManager.pauseMusic();
      soundManager.setMusicEnabled(false);
      setEnabled(false);
    } else {
      soundManager.setMusicEnabled(true);
      soundManager.startMusic();
      setEnabled(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundManager.setMusicVolume(val);
    if (!enabled && val > 0) {
      soundManager.setMusicEnabled(true);
      setEnabled(true);
    }
  };

  const handleToggleMute = () => {
    if (volume > 0) {
      soundManager.setMusicVolume(0);
      setVolume(0);
    } else {
      soundManager.setMusicVolume(0.22);
      setVolume(0.22);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg backdrop-blur-md transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-gradient-to-tr from-pink-500 to-indigo-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Music className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold font-mono text-slate-200 tracking-tight truncate block">
                Lo-Fi Neon Horizon
              </span>
              {isPlaying && (
                <span className="flex items-center gap-0.5 px-1 py-0.2 text-[8px] font-mono text-pink-400 bg-pink-950/80 rounded border border-pink-800/80">
                  <Sparkles className="w-2 h-2" /> CHILL
                </span>
              )}
            </div>
            <span className="text-[9px] text-slate-400 font-mono block">
              Soothing Synthwave Chiptune
            </span>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className={`p-1.5 rounded-xl transition-all flex items-center justify-center ${
            isPlaying
              ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
          title={isPlaying ? 'Pause BGM' : 'Play Soothing Lo-Fi BGM'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
      </div>

      {/* Equalizer animation and Volume slider */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
        {/* Animated mini equalizer bars */}
        <div className="flex items-end gap-0.5 h-3.5 w-6 px-0.5 py-0.5">
          <span
            className={`w-1 bg-pink-400 rounded-sm transition-all duration-300 ${
              isPlaying ? 'h-3 animate-pulse' : 'h-1 opacity-40'
            }`}
          />
          <span
            className={`w-1 bg-cyan-400 rounded-sm transition-all duration-200 ${
              isPlaying ? 'h-2 animate-bounce' : 'h-1 opacity-40'
            }`}
          />
          <span
            className={`w-1 bg-purple-400 rounded-sm transition-all duration-500 ${
              isPlaying ? 'h-3.5 animate-pulse' : 'h-1 opacity-40'
            }`}
          />
          <span
            className={`w-1 bg-indigo-400 rounded-sm transition-all duration-300 ${
              isPlaying ? 'h-1.5 animate-bounce' : 'h-1 opacity-40'
            }`}
          />
        </div>

        {/* Volume Mute button */}
        <button
          onClick={handleToggleMute}
          className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
          title={volume === 0 ? 'Unmute' : 'Mute'}
        >
          {volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {/* Volume Slider */}
        <input
          type="range"
          min="0"
          max="0.6"
          step="0.02"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 accent-pink-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          title={`Volume: ${Math.round((volume / 0.6) * 100)}%`}
        />

        <span className="text-[9px] font-mono text-slate-400 w-7 text-right">
          {Math.round((volume / 0.6) * 100)}%
        </span>
      </div>
    </div>
  );
};
