/**
 * Web Audio API Sound and Lo-Fi Synthwave Chiptune Engine
 * Generates arcade SFX and a soothing, relaxing lo-fi synth-wave soundtrack
 * with zero external file dependencies.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true; // Enabled by default for ambient chill vibe
  private sfxVolume: number = 0.35;
  private musicVolume: number = 0.22;
  private isMusicPlaying: boolean = false;

  // Lo-Fi Synthwave Music Scheduler State
  private schedulerTimerId: number | null = null;
  private currentStep: number = 0;
  private nextNoteTime: number = 0;
  private tempo: number = 76; // Relaxing, soothing 76 BPM
  private secondsPerStep: number = 60 / 76 / 4; // 16th note steps

  // Master Lo-Fi Audio Nodes
  private musicMasterGain: GainNode | null = null;
  private lofiFilter: BiquadFilterNode | null = null;
  private tapeLfo: OscillatorNode | null = null;

  // Listeners for UI updates
  private musicStateListeners: Array<(isPlaying: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const savedSfx = localStorage.getItem('tetris_sfx_enabled');
      const savedMusic = localStorage.getItem('tetris_music_enabled');
      const savedSfxVol = localStorage.getItem('tetris_sfx_volume');
      const savedMusicVol = localStorage.getItem('tetris_music_volume');

      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
      if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';
      if (savedSfxVol !== null) this.sfxVolume = parseFloat(savedSfxVol);
      if (savedMusicVol !== null) this.musicVolume = parseFloat(savedMusicVol);
    }
  }

  public initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public onMusicStateChange(cb: (isPlaying: boolean) => void) {
    this.musicStateListeners.push(cb);
    return () => {
      this.musicStateListeners = this.musicStateListeners.filter((l) => l !== cb);
    };
  }

  private notifyMusicState(state: boolean) {
    this.isMusicPlaying = state;
    this.musicStateListeners.forEach((l) => l(state));
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    localStorage.setItem('tetris_sfx_enabled', String(enabled));
  }

  public getSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    localStorage.setItem('tetris_music_enabled', String(enabled));
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  public getMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('tetris_sfx_volume', String(this.sfxVolume));
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('tetris_music_volume', String(this.musicVolume));
    if (this.musicMasterGain && this.ctx) {
      this.musicMasterGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  // --- RETRO SFX METHODS ---

  public playMove() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(this.sfxVolume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio error suppressed
    }
  }

  public playRotate() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(this.sfxVolume * 0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Audio error suppressed
    }
  }

  public playHold() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(this.sfxVolume * 0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio error suppressed
    }
  }

  public playHardDrop() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(this.sfxVolume * 0.38, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio error suppressed
    }
  }

  public playLock() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(this.sfxVolume * 0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio error suppressed
    }
  }

  public playLineClear(lines: number) {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      if (lines === 4) {
        // Glorious arpeggiated Tetris fanfare
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);

          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
          gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.35, ctx.currentTime + i * 0.07 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.07);
          osc.stop(ctx.currentTime + i * 0.07 + 0.25);
        });
      } else {
        const freqs =
          lines === 1 ? [440, 554] : lines === 2 ? [440, 554, 659] : [440, 554, 659, 880];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);

          gain.gain.setValueAtTime(this.sfxVolume * 0.25, ctx.currentTime + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.05);
          osc.stop(ctx.currentTime + i * 0.05 + 0.15);
        });
      }
    } catch {
      // Audio error suppressed
    }
  }

  public playCombo(comboCount: number) {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const baseFreq = 420 + Math.min(comboCount * 65, 680);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(this.sfxVolume * 0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio error suppressed
    }
  }

  public playGameOver() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch {
      // Audio error suppressed
    }
  }

  public playWin() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const fanfare = [
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.12 },
        { f: 783.99, d: 0.12 },
        { f: 1046.5, d: 0.3 },
      ];
      let t = ctx.currentTime;
      fanfare.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(this.sfxVolume * 0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + n.d);
        t += n.d;
      });
    } catch {
      // Audio error suppressed
    }
  }

  // =========================================================================
  // --- SOOTHING LO-FI SYNTH-WAVE CHIPTUNE SOUNDTRACK GENERATOR ---
  // =========================================================================
  // Key: D Dorian / F Major (Warm, nostalgic, dreamy neo-soul / synthwave progression)
  // Chords: Dm9 -> G13 -> Cmaj9 -> Am9 (or Fmaj7 -> Em7 -> Dm7 -> Am7)
  // Mellow, rounded tones, low-pass filtered around 850Hz to ensure zero ear fatigue.

  // 64-step chord progression (4 bars of 16 steps each)
  private chordPadProgression = [
    // Bar 1: Dm9 [D3, F3, A3, C4, E4]
    { chord: [146.83, 174.61, 220.0, 261.63, 329.63], bass: 73.42 },
    // Bar 2: G13 / G7sus [G2, F3, B3, E4]
    { chord: [98.0, 174.61, 246.94, 329.63], bass: 98.0 },
    // Bar 3: Cmaj9 [C3, E3, G3, B3, D4]
    { chord: [130.81, 164.81, 196.0, 246.94, 293.66], bass: 65.41 },
    // Bar 4: Am9 [A2, C3, E3, G3, B3]
    { chord: [110.0, 130.81, 164.81, 196.0, 246.94], bass: 55.0 },
  ];

  // Relaxing soothing lead melody notes (pentatonic, warm frequencies)
  private melodyPattern: Array<number | null> = [
    // Bar 1 (16 steps)
    329.63, null, 261.63, null, 293.66, null, 220.0, null, 261.63, null, null, 329.63, null, 392.0, null, null,
    // Bar 2
    329.63, null, null, 293.66, null, 261.63, null, null, 246.94, null, 293.66, null, 329.63, null, null, null,
    // Bar 3
    392.0, null, 329.63, null, 293.66, null, 261.63, null, 293.66, null, null, 329.63, 261.63, null, null, null,
    // Bar 4
    220.0, null, 261.63, null, 220.0, null, 196.0, null, 220.0, null, null, null, null, null, null, null,
  ];

  private setupMusicNodes(ctx: AudioContext) {
    if (!this.musicMasterGain) {
      this.musicMasterGain = ctx.createGain();
      this.musicMasterGain.gain.setValueAtTime(this.musicVolume, ctx.currentTime);

      // Low-pass filter for the authentic warm, soothing lo-fi cassette tape vibe
      this.lofiFilter = ctx.createBiquadFilter();
      this.lofiFilter.type = 'lowpass';
      this.lofiFilter.frequency.setValueAtTime(850, ctx.currentTime);
      this.lofiFilter.Q.setValueAtTime(1.1, ctx.currentTime);

      // Subtle slow tape pitch/filter modulation (0.12 Hz LFO) for soothing analog warmth
      try {
        this.tapeLfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        this.tapeLfo.type = 'sine';
        this.tapeLfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        lfoGain.gain.setValueAtTime(45, ctx.currentTime); // gentle filter sweep
        this.tapeLfo.connect(lfoGain);
        lfoGain.connect(this.lofiFilter.frequency);
        this.tapeLfo.start();
      } catch {
        // LFO setup suppressed
      }

      this.lofiFilter.connect(this.musicMasterGain);
      this.musicMasterGain.connect(ctx.destination);
    }
  }

  public startMusic() {
    if (!this.musicEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    if (this.isMusicPlaying) return;

    this.setupMusicNodes(ctx);
    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.05;

    // Smooth fade in
    if (this.musicMasterGain) {
      this.musicMasterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.musicMasterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.musicMasterGain.gain.linearRampToValueAtTime(this.musicVolume, ctx.currentTime + 0.8);
    }

    this.notifyMusicState(true);
    this.schedulerLoop();
  }

  public stopMusic(fadeOutDuration = 0.5) {
    if (!this.isMusicPlaying) return;

    if (this.schedulerTimerId !== null) {
      window.clearTimeout(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }

    if (this.musicMasterGain && this.ctx) {
      try {
        const curTime = this.ctx.currentTime;
        this.musicMasterGain.gain.cancelScheduledValues(curTime);
        this.musicMasterGain.gain.setValueAtTime(this.musicMasterGain.gain.value, curTime);
        this.musicMasterGain.gain.linearRampToValueAtTime(0.001, curTime + fadeOutDuration);
      } catch {
        // Gain ramp error suppressed
      }
    }

    this.notifyMusicState(false);
  }

  public pauseMusic() {
    this.stopMusic(0.3);
  }

  public resumeMusic() {
    if (this.musicEnabled && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  private schedulerLoop = () => {
    if (!this.isMusicPlaying || !this.musicEnabled) return;
    const ctx = this.ctx;
    if (!ctx) return;

    // Schedule 150ms ahead
    while (this.nextNoteTime < ctx.currentTime + 0.15) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.nextNoteTime += this.secondsPerStep;
      this.currentStep = (this.currentStep + 1) % 64; // 64 steps total loop
    }

    this.schedulerTimerId = window.setTimeout(this.schedulerLoop, 40);
  };

  private scheduleStep(step: number, time: number) {
    const ctx = this.ctx;
    if (!ctx || !this.lofiFilter) return;

    const barIndex = Math.floor(step / 16);
    const stepInBar = step % 16;
    const currentChordObj = this.chordPadProgression[barIndex];

    // 1. CHORD PAD: Trigger sustained lush ambient chords at the start of each bar (or bar midpoint)
    if (stepInBar === 0) {
      const chordNotes = currentChordObj.chord;
      const padDuration = this.secondsPerStep * 15.5;

      chordNotes.forEach((freq, idx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          // Soft sine wave for smooth, warm pad tone
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);

          // Detune slightly for lush shimmer
          const detuneCents = (idx % 2 === 0 ? 1 : -1) * 3;
          osc.detune.setValueAtTime(detuneCents, time);

          // Gentle 100ms attack, long soothing sustain, soft release
          gain.gain.setValueAtTime(0.0001, time);
          gain.gain.linearRampToValueAtTime(0.038 / chordNotes.length, time + 0.12);
          gain.gain.setValueAtTime(0.035 / chordNotes.length, time + padDuration - 0.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + padDuration);

          osc.connect(gain);
          gain.connect(this.lofiFilter!);
          osc.start(time);
          osc.stop(time + padDuration);
        } catch {
          // Pad error suppressed
        }
      });
    }

    // 2. WARM SUB BASS: Deep mellow bass line
    if (stepInBar === 0 || stepInBar === 8 || stepInBar === 12) {
      try {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle'; // Warm, round bass tone
        bassOsc.frequency.setValueAtTime(currentChordObj.bass, time);

        const bassDuration = this.secondsPerStep * (stepInBar === 12 ? 3.5 : 7.5);

        bassGain.gain.setValueAtTime(0.0001, time);
        bassGain.gain.linearRampToValueAtTime(0.07, time + 0.04);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, time + bassDuration);

        bassOsc.connect(bassGain);
        bassGain.connect(this.lofiFilter);
        bassOsc.start(time);
        bassOsc.stop(time + bassDuration);
      } catch {
        // Bass error suppressed
      }
    }

    // 3. SOOTHING CHIPTUNE MELODY: Soft, mellow chime notes
    const melodyNote = this.melodyPattern[step];
    if (melodyNote !== null) {
      try {
        const melOsc = ctx.createOscillator();
        const melGain = ctx.createGain();
        // Triangle wave gives a soft chiptune bell/kalimba timbre that is easy on the ears
        melOsc.type = 'triangle';
        melOsc.frequency.setValueAtTime(melodyNote, time);

        const noteDuration = this.secondsPerStep * 2.8;

        melGain.gain.setValueAtTime(0.0001, time);
        melGain.gain.linearRampToValueAtTime(0.045, time + 0.02);
        melGain.gain.exponentialRampToValueAtTime(0.0001, time + noteDuration);

        melOsc.connect(melGain);
        melGain.connect(this.lofiFilter);
        melOsc.start(time);
        melOsc.stop(time + noteDuration);
      } catch {
        // Melody error suppressed
      }
    }

    // 4. GENTLE CHILL DRUM / PULSE: Soft muted brush / lo-fi kick pulse on beats
    if (stepInBar % 4 === 0) {
      try {
        // Soft sine kick
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(75, time);
        kickOsc.frequency.exponentialRampToValueAtTime(35, time + 0.08);

        kickGain.gain.setValueAtTime(0.035, time);
        kickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

        kickOsc.connect(kickGain);
        kickGain.connect(this.lofiFilter);
        kickOsc.start(time);
        kickOsc.stop(time + 0.08);
      } catch {
        // Kick error suppressed
      }
    }
  }
}

export const soundManager = new SoundManager();
