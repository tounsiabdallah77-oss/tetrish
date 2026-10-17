/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useTetris } from './game/useTetris';
import { Board } from './components/Board';
import { PiecePreview } from './components/PiecePreview';
import { ScoreBoard } from './components/ScoreBoard';
import { LevelSelector } from './components/LevelSelector';
import { ControlsGuide } from './components/ControlsGuide';
import { VirtualControls } from './components/VirtualControls';
import { HighScoresModal } from './components/HighScoresModal';
import { SettingsModal } from './components/SettingsModal';
import { MusicController } from './components/MusicController';
import { GameMode, ThemeName } from './types/tetris';
import { getHighScore } from './utils/storage';
import { soundManager } from './audio/soundManager';
import { getDailyChallengeConfig } from './game/dailyChallenge';
import {
  Play,
  RotateCcw,
  Pause,
  Trophy,
  Sliders,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  Flame,
  BookmarkCheck,
  Calendar,
} from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<GameMode>('endless');
  const [startingLevel, setStartingLevel] = useState<number>(1);
  const [theme, setTheme] = useState<ThemeName>('cyberpunk');
  const [showGhost, setShowGhost] = useState<boolean>(true);
  const [isHighScoresOpen, setIsHighScoresOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [sfxMuted, setSfxMuted] = useState<boolean>(!soundManager.getSfxEnabled());

  // Fixed Daily Challenge configuration for today
  const dailyConfig = useMemo(() => getDailyChallengeConfig(), []);

  const {
    board,
    activePiece,
    ghostY,
    holdPiece,
    canHold,
    nextQueue,
    stats,
    isPlaying,
    isPaused,
    isGameOver,
    isLevelWon,
    clearingRows,
    floatingTexts,
    screenShake,
    activeKeysDisplay,
    actions,
  } = useTetris({
    mode,
    startingLevel,
    dailyConfig,
    onLevelComplete: (clearedLevel) => {
      if (clearedLevel < 10) {
        setStartingLevel(clearedLevel + 1);
      }
    },
  });

  // Sync background music with game lifecycle
  useEffect(() => {
    if (isPlaying && !isPaused && !isGameOver && !isLevelWon) {
      if (soundManager.getMusicEnabled()) {
        soundManager.resumeMusic();
      }
    } else {
      soundManager.pauseMusic();
    }
  }, [isPlaying, isPaused, isGameOver, isLevelWon]);

  const toggleSound = () => {
    const next = !sfxMuted;
    setSfxMuted(next);
    soundManager.setSfxEnabled(!next);
  };

  const handleStartGame = () => {
    soundManager.initCtx();
    actions.startGame();
    if (soundManager.getMusicEnabled()) {
      soundManager.startMusic();
    }
  };

  const handleNextLevel = () => {
    if (startingLevel < 10) {
      setStartingLevel(startingLevel + 1);
    }
    setTimeout(() => {
      actions.startGame();
      if (soundManager.getMusicEnabled()) {
        soundManager.startMusic();
      }
    }, 100);
  };

  // Compute header mode badge string
  const getHeaderBadge = () => {
    if (mode === 'daily') {
      return `Daily Challenge • ${dailyConfig.dateStr}`;
    }
    if (mode === 'levels') {
      return `Stage Mission ${startingLevel}`;
    }
    return 'Endless High Score';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* HEADER BAR */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Mode tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center font-black text-black shadow-lg shadow-cyan-500/20 font-mono text-lg">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black font-mono tracking-tight text-white">
                  TETRIS <span className="text-cyan-400">ARCADE</span>
                </h1>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full font-mono hidden sm:inline-block border ${
                    mode === 'daily'
                      ? 'bg-amber-950/90 text-amber-300 border-amber-700/80'
                      : 'bg-cyan-950/90 text-cyan-400 border-cyan-800/80'
                  }`}
                >
                  {getHeaderBadge()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                WASD • ZQSD • Arrow Controls • Super Rotation System
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Top Bar High Score Highlight */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono text-xs shadow-inner">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] uppercase font-bold text-amber-400 hidden sm:inline">
                {mode === 'daily' ? 'Daily Best:' : 'High Score:'}
              </span>
              <span className="font-extrabold text-amber-200">
                {stats.highScore.toLocaleString()}
              </span>
            </div>

            {/* Leaderboard Button */}
            <button
              onClick={() => setIsHighScoresOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm flex items-center gap-1.5 text-xs font-mono font-bold"
              title="Hall of Fame & High Scores"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Scores</span>
            </button>

            {/* Mute SFX Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-colors shadow-sm ${
                sfxMuted
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={sfxMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            >
              {sfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Settings & Themes */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Settings & Themes"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GAME CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: HOLD PIECE, SCOREBOARD & MUSIC (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
            <PiecePreview
              type={holdPiece}
              label="HOLD (C / Shift)"
              theme={theme}
              disabled={!canHold}
            />

            <ScoreBoard
              stats={stats}
              mode={mode}
              startingLevel={startingLevel}
            />

            <MusicController />
          </div>

          {/* CENTER COLUMN: THE TETRIS MATRIX & IN-BOARD OVERLAYS (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2">
            <div className="relative">
              {/* THE 10x20 BOARD */}
              <Board
                board={board}
                activePiece={activePiece}
                ghostY={ghostY}
                clearingRows={clearingRows}
                floatingTexts={floatingTexts}
                screenShake={screenShake}
                theme={theme}
                showGhost={showGhost}
              />

              {/* OVERLAY: NOT PLAYING / START SCREEN */}
              {!isPlaying && !isGameOver && !isLevelWon && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-30">
                  <div
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-3 shadow-lg ${
                      mode === 'daily'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-amber-500/20'
                        : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-cyan-500/30'
                    }`}
                  >
                    {mode === 'daily' ? (
                      <Calendar className="w-7 h-7" />
                    ) : (
                      <Sparkles className="w-7 h-7" />
                    )}
                  </div>

                  <h2 className="text-xl font-black font-mono text-white tracking-wide mb-1">
                    {mode === 'daily'
                      ? `DAILY: ${dailyConfig.modifierName}`
                      : mode === 'endless'
                      ? 'ENDLESS RUN'
                      : `STAGE MISSION ${startingLevel}`}
                  </h2>

                  <p className="text-xs text-slate-400 font-mono max-w-xs mb-5">
                    {mode === 'daily'
                      ? `${dailyConfig.modifierDesc} Fixed random seed for all players today!`
                      : mode === 'endless'
                      ? 'Ramp up falling speed continuously over time. Hunt for your all-time highest score!'
                      : `Clear lines and targets at Level ${startingLevel} speed.`}
                  </p>

                  <button
                    onClick={handleStartGame}
                    className={`w-full max-w-xs py-3.5 px-6 rounded-xl text-white font-mono font-black text-sm tracking-wider shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all ${
                      mode === 'daily'
                        ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 shadow-amber-500/30'
                        : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/30'
                    }`}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>START {mode === 'daily' ? 'DAILY CHALLENGE' : 'GAME'}</span>
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono mt-3">
                    Tip: Controls work with Arrow keys, WASD, and ZQSD!
                  </span>
                </div>
              )}

              {/* OVERLAY: PAUSED WITH SAVE & QUIT */}
              {isPlaying && isPaused && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 mb-3">
                    <Pause className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black font-mono text-white tracking-widest mb-1">
                    PAUSED
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mb-3">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">P</kbd> or{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">ESC</kbd> to resume
                  </p>

                  <div className="w-full max-w-xs bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 mb-4 font-mono text-xs text-slate-300">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Current Score:</span>
                      <strong className="text-cyan-400">{stats.score.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Lines Cleared:</span>
                      <strong className="text-emerald-400">{stats.lines}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <button
                      onClick={actions.togglePause}
                      className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs tracking-wider shadow-md"
                    >
                      RESUME GAME
                    </button>

                    <button
                      onClick={actions.quitGame}
                      className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-amber-950/70 hover:border-amber-700 text-slate-200 hover:text-amber-200 border border-slate-700 font-mono font-bold text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <BookmarkCheck className="w-4 h-4 text-amber-400" />
                      <span>SAVE & QUIT RUN</span>
                    </button>
                  </div>
                </div>
              )}

              {/* OVERLAY: GAME OVER */}
              {isGameOver && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                    <Flame className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-black font-mono text-rose-400 tracking-wider mb-1">
                    GAME OVER
                  </h2>

                  {stats.score >= stats.highScore && stats.score > 0 ? (
                    <div className="my-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 font-mono text-xs font-black animate-pulse flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5" />
                      NEW ALL-TIME HIGH SCORE!
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono mb-2">Matrix topped out</span>
                  )}

                  <div className="w-full max-w-xs bg-slate-900/90 border border-slate-800 rounded-xl p-3 my-3 font-mono">
                    <div className="flex justify-between text-xs py-1 text-slate-400">
                      <span>Final Score:</span>
                      <strong className="text-cyan-400 text-sm">{stats.score.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-xs py-1 text-slate-400 border-t border-slate-800/60">
                      <span>Lines Cleared:</span>
                      <strong className="text-emerald-400">{stats.lines}</strong>
                    </div>
                    <div className="flex justify-between text-xs py-1 text-slate-400 border-t border-slate-800/60">
                      <span>Max Combo:</span>
                      <strong className="text-amber-400">x{stats.maxCombo}</strong>
                    </div>
                    <div className="flex justify-between text-xs py-1 text-slate-400 border-t border-slate-800/60">
                      <span>Tetrises (4-line):</span>
                      <strong className="text-purple-400">{stats.tetrisCount}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full max-w-xs">
                    <button
                      onClick={handleStartGame}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>TRY AGAIN</span>
                    </button>
                    <button
                      onClick={() => setIsHighScoresOpen(true)}
                      className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-mono text-xs"
                      title="View Scores"
                    >
                      <Trophy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* OVERLAY: LEVEL CLEARED / WON */}
              {isLevelWon && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-black font-mono text-emerald-400 tracking-wider mb-1">
                    STAGE CLEARED!
                  </h2>
                  <p className="text-xs text-slate-300 font-mono mb-3">
                    Mission {startingLevel} Complete!
                  </p>

                  <div className="w-full max-w-xs bg-slate-900/90 border border-slate-800 rounded-xl p-3 my-3 font-mono text-left">
                    <div className="flex justify-between text-xs py-1 text-slate-400">
                      <span>Score:</span>
                      <strong className="text-cyan-400">{stats.score.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-xs py-1 text-slate-400 border-t border-slate-800/60">
                      <span>Lines Cleared:</span>
                      <strong className="text-emerald-400">{stats.lines}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full max-w-xs">
                    {startingLevel < 10 && (
                      <button
                        onClick={handleNextLevel}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <span>NEXT STAGE</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={handleStartGame}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold"
                    >
                      REPLAY
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick in-game action buttons below board */}
            <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
              {isPlaying ? (
                <>
                  <button
                    onClick={actions.togglePause}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>{isPaused ? 'RESUME (P)' : 'PAUSE (P)'}</span>
                  </button>
                  <button
                    onClick={handleStartGame}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESTART</span>
                  </button>
                  <button
                    onClick={actions.quitGame}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-950/60 hover:border-amber-700 text-slate-200 hover:text-amber-200 border border-slate-700 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    title="Quit mid-game and save score if it is your best"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>SAVE & QUIT</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartGame}
                  className={`px-6 py-2 rounded-xl text-white font-mono text-xs font-extrabold flex items-center gap-1.5 shadow-lg ${
                    mode === 'daily'
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                      : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>PLAY NOW</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: NEXT QUEUE & LEVEL SELECTION (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 order-3">
            {/* NEXT QUEUE */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg backdrop-blur-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono block">
                NEXT PIECES
              </span>
              <div className="flex sm:grid sm:grid-cols-3 gap-2 overflow-x-auto sm:overflow-visible">
                {nextQueue.slice(0, 3).map((pieceType, index) => (
                  <div key={index} className="flex-1 min-w-[75px]">
                    <PiecePreview
                      type={pieceType}
                      label={`#${index + 1}`}
                      theme={theme}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* LEVEL & MODE SELECTOR (ENDLESS | DAILY CHALLENGE | STAGES) */}
            <LevelSelector
              currentLevel={startingLevel}
              onSelectLevel={(lvl) => {
                setStartingLevel(lvl);
                if (!isPlaying) {
                  soundManager.playMove();
                }
              }}
              mode={mode}
              onSelectMode={(newMode) => {
                setMode(newMode);
                if (!isPlaying) {
                  soundManager.playRotate();
                }
              }}
              dailyConfig={dailyConfig}
              disabled={isPlaying && !isPaused}
            />
          </div>
        </div>

        {/* CONTROLS GUIDE (ARROWS, WASD, ZQSD LIVE VISUALIZER) */}
        <div className="w-full">
          <ControlsGuide activeKeys={activeKeysDisplay} />
        </div>

        {/* ON-SCREEN VIRTUAL CONTROLS FOR MOBILE / TOUCH */}
        <div className="block lg:hidden w-full max-w-md mx-auto">
          <VirtualControls
            onLeft={actions.moveLeft}
            onRight={actions.moveRight}
            onDown={actions.moveDown}
            onRotateCW={actions.rotateCW}
            onHardDrop={actions.hardDrop}
            onHold={actions.hold}
            disabled={!isPlaying || isPaused || isGameOver || isLevelWon}
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Tetris Arcade • Supports <strong className="text-slate-300">WASD</strong>,{' '}
            <strong className="text-slate-300">ZQSD</strong> &{' '}
            <strong className="text-slate-300">Arrows</strong>
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHighScoresOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              High Scores
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Themes & Audio
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <HighScoresModal
        isOpen={isHighScoresOpen}
        onClose={() => setIsHighScoresOpen(false)}
        currentEndlessHigh={getHighScore('endless')}
        currentLevelHigh={getHighScore('levels')}
        currentDailyHigh={getHighScore('daily')}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onSelectTheme={setTheme}
        showGhost={showGhost}
        onToggleGhost={setShowGhost}
      />
    </div>
  );
}
