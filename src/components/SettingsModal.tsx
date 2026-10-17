import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Palette, Eye, X, Sliders } from 'lucide-react';
import { ThemeName } from '../types/tetris';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeName;
  onSelectTheme: (t: ThemeName) => void;
  showGhost: boolean;
  onToggleGhost: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSelectTheme,
  showGhost,
  onToggleGhost,
}) => {
  const [sfx, setSfx] = useState<boolean>(soundManager.getSfxEnabled());
  const [music, setMusic] = useState<boolean>(soundManager.getMusicEnabled());
  const [sfxVol, setSfxVol] = useState<number>(soundManager.getSfxVolume());

  if (!isOpen) return null;

  const handleToggleSfx = () => {
    const next = !sfx;
    setSfx(next);
    soundManager.setSfxEnabled(next);
    if (next) soundManager.playRotate();
  };

  const handleToggleMusic = () => {
    const next = !music;
    setMusic(next);
    soundManager.setMusicEnabled(next);
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundManager.setSfxVolume(val);
  };

  const themes: { id: ThemeName; label: string; desc: string; colors: string[] }[] = [
    {
      id: 'cyberpunk',
      label: 'Cyberpunk Neon',
      desc: 'Glowing cyan, electric blue, violet & neon yellow',
      colors: ['#06b6d4', '#a855f7', '#f97316', '#eab308'],
    },
    {
      id: 'synthwave',
      label: '80s Synthwave',
      desc: 'Hot pink, laser cyan, sunset orange & vivid purple',
      colors: ['#00f0ff', '#ff00d4', '#ff8800', '#ffee00'],
    },
    {
      id: 'classic',
      label: 'Arcade Classic',
      desc: 'Traditional arcade bright primary block palette',
      colors: ['#00d2d3', '#2e86de', '#ff9f43', '#10ac84'],
    },
    {
      id: 'gameboy',
      label: 'Retro GameBoy 1989',
      desc: 'Nostalgic 4-shade greenish LCD phosphor look',
      colors: ['#8bac0f', '#306230', '#0f380f', '#9bbc0f'],
    },
    {
      id: 'monochrome',
      label: 'Steel Monochrome',
      desc: 'Minimalist metallic platinum and slate blocks',
      colors: ['#e2e8f0', '#94a3b8', '#64748b', '#334155'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-mono text-white tracking-wide">
                SETTINGS & THEMES
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Customize audio, visuals, and visuals
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

        <div className="space-y-4 my-4">
          {/* AUDIO CONTROLS */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
            <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider block">
              Audio (Web Audio Synthesizer)
            </span>

            {/* SFX Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                {sfx ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Sound FX (Movement, Clears, Fanfares)</span>
              </div>
              <button
                onClick={handleToggleSfx}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  sfx ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    sfx ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Volume slider */}
            {sfx && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] font-mono text-slate-400 w-16">Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVol}
                  onChange={handleSfxVolumeChange}
                  className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                  {Math.round(sfxVol * 100)}%
                </span>
              </div>
            )}

            {/* Lo-Fi Synthwave BGM Toggle & Volume */}
            <div className="pt-1 border-t border-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Music className={`w-4 h-4 ${music ? 'text-pink-400' : 'text-slate-500'}`} />
                  <div>
                    <span>Lo-Fi Synthwave Soundtrack</span>
                    <span className="text-[10px] text-slate-500 block">
                      Relaxing & soothing chill chiptune loop
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleToggleMusic}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    music ? 'bg-pink-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      music ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {music && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] font-mono text-slate-400 w-16">Music Vol:</span>
                  <input
                    type="range"
                    min="0"
                    max="0.6"
                    step="0.02"
                    value={soundManager.getMusicVolume()}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      soundManager.setMusicVolume(val);
                    }}
                    className="flex-1 accent-pink-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                    {Math.round((soundManager.getMusicVolume() / 0.6) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* GAMEPLAY HELPERS: GHOST PIECE */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Eye className="w-4 h-4 text-cyan-400" />
              <div>
                <span>Ghost Drop Projection</span>
                <span className="text-[10px] text-slate-500 block">Displays where the piece will land</span>
              </div>
            </div>
            <button
              onClick={() => onToggleGhost(!showGhost)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                showGhost ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  showGhost ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* VISUAL THEMES */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Color Themes</span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTheme(t.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-400 ring-1 ring-cyan-400 shadow-md'
                        : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold font-mono text-white block">
                        {t.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {t.desc}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {t.colors.map((c, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-sm shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors shadow-lg shadow-cyan-600/30"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
