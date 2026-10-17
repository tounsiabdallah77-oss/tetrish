import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivePiece,
  BoardMatrix,
  CellValue,
  DailyChallengeInfo,
  GameMode,
  GameStats,
  Position,
  RotationState,
  TetrominoType,
} from '../types/tetris';
import {
  createSevenBag,
  getSpawnPosition,
  TETROMINO_ROTATIONS,
  WALL_KICK_DATA,
} from './tetrominoes';
import { calculateEndlessSpeed, LEVEL_MISSIONS, BASE_LEVEL_SPEEDS } from './levelData';
import {
  getHighScore,
  saveHighScore,
  addLeaderboardRecord,
  markLevelCompleted,
} from '../utils/storage';
import { soundManager } from '../audio/soundManager';
import { createMulberry32, createSeededSevenBag } from './dailyChallenge';
import confetti from 'canvas-confetti';

const BOARD_ROWS = 20;
const BOARD_COLS = 10;
const LOCK_DELAY_MS = 500;
const MAX_LOCK_RESETS = 15;
const MAX_LOCK_TIME_TOTAL_MS = 2500; // Anti-stall cheese hard lock timer

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  isCombo?: boolean;
  comboCount?: number;
}

export interface UseTetrisOptions {
  mode: GameMode;
  startingLevel: number; // 1 to 10
  dailyConfig?: DailyChallengeInfo;
  onLevelComplete?: (level: number) => void;
}

export function useTetris({
  mode,
  startingLevel,
  dailyConfig,
  onLevelComplete,
}: UseTetrisOptions) {
  // Board state
  const [board, setBoard] = useState<BoardMatrix>(() => createEmptyBoard());
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [ghostY, setGhostY] = useState<number>(0);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);

  // Game control states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLevelWon, setIsLevelWon] = useState<boolean>(false);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<GameStats>(() => ({
    score: 0,
    highScore: getHighScore(mode, dailyConfig?.dateStr),
    lines: 0,
    level: startingLevel,
    combo: 0,
    maxCombo: 0,
    backToBack: false,
    tetrisCount: 0,
    singleCount: 0,
    doubleCount: 0,
    tripleCount: 0,
    piecesDropped: 0,
    timeElapsed: 0,
  }));

  // Internal refs
  const bagRef = useRef<TetrominoType[]>([]);
  const rngRef = useRef<(() => number) | null>(null);
  const boardRef = useRef<BoardMatrix>(board);
  boardRef.current = board;
  const activePieceRef = useRef<ActivePiece | null>(activePiece);
  activePieceRef.current = activePiece;
  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;
  const isPausedRef = useRef<boolean>(isPaused);
  isPausedRef.current = isPaused;
  const isGameOverRef = useRef<boolean>(isGameOver);
  isGameOverRef.current = isGameOver;
  const clearingRowsRef = useRef<number[]>(clearingRows);
  clearingRowsRef.current = clearingRows;

  // Anti-stall cheese lock timing refs
  const lockTimeoutRef = useRef<number | null>(null);
  const lockResetsRef = useRef<number>(0);
  const firstGroundTouchTimeRef = useRef<number | null>(null);

  const lastFallTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Key tracking for WASD / ZQSD / Arrows
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const [activeKeysDisplay, setActiveKeysDisplay] = useState<{
    left: boolean;
    right: boolean;
    down: boolean;
    rotate: boolean;
    drop: boolean;
    hold: boolean;
  }>({
    left: false,
    right: false,
    down: false,
    rotate: false,
    drop: false,
    hold: false,
  });

  // DAS & ARR state
  const dasTimeoutRef = useRef<number | null>(null);
  const arrIntervalRef = useRef<number | null>(null);

  // Helper: create empty board
  function createEmptyBoard(garbageRows: number = 0): BoardMatrix {
    const matrix: BoardMatrix = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => null)
    );

    if (garbageRows > 0) {
      for (let r = BOARD_ROWS - garbageRows; r < BOARD_ROWS; r++) {
        const emptyCol = Math.floor(Math.random() * BOARD_COLS);
        for (let c = 0; c < BOARD_COLS; c++) {
          if (c !== emptyCol) {
            matrix[r][c] = 'G';
          }
        }
      }
    }
    return matrix;
  }

  // Refill bag (seeded if daily challenge, standard 7-bag otherwise)
  const pullNextPiece = useCallback((): TetrominoType => {
    if (bagRef.current.length < 7) {
      if (mode === 'daily' && rngRef.current) {
        bagRef.current = [...bagRef.current, ...createSeededSevenBag(rngRef.current)];
      } else {
        bagRef.current = [...bagRef.current, ...createSevenBag()];
      }
    }
    const next = bagRef.current.shift()!;
    setNextQueue([...bagRef.current.slice(0, 4)]);
    return next;
  }, [mode]);

  // Collision detection
  const checkCollision = useCallback(
    (shape: number[][], x: number, y: number, currentBoard: BoardMatrix = boardRef.current): boolean => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const newX = x + c;
            const newY = y + r;

            // Outside boundaries
            if (newX < 0 || newX >= BOARD_COLS || newY >= BOARD_ROWS) {
              return true;
            }
            // Occupied cell on board (if y >= 0)
            if (newY >= 0 && currentBoard[newY][newX] !== null) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  // Calculate Ghost piece position
  const calculateGhostY = useCallback(
    (piece: ActivePiece | null, currentBoard: BoardMatrix): number => {
      if (!piece) return 0;
      let curY = piece.y;
      while (!checkCollision(piece.shape, piece.x, curY + 1, currentBoard)) {
        curY++;
      }
      return Math.max(0, curY);
    },
    [checkCollision]
  );

  // Add floating banner
  const addFloatingText = useCallback(
    (
      text: string,
      color: string = '#22d3ee',
      options?: { x?: number; y?: number; isCombo?: boolean; comboCount?: number; duration?: number }
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newText: FloatingText = {
        id,
        text,
        color,
        x: options?.x ?? (50 + (Math.random() * 12 - 6)),
        y: options?.y ?? (45 + (Math.random() * 6 - 3)),
        isCombo: options?.isCombo,
        comboCount: options?.comboCount,
      };
      setFloatingTexts((prev) => [...prev, newText]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
      }, options?.duration ?? 1350);
    },
    []
  );

  // Trigger brief screen shake
  const triggerShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 200);
  }, []);

  // Spawn new active piece
  const spawnPiece = useCallback(
    (type?: TetrominoType) => {
      const pieceType = type || pullNextPiece();
      const spawnPos = getSpawnPosition(pieceType);
      const shape = TETROMINO_ROTATIONS[pieceType][0];

      // Check immediate top-out game over
      if (checkCollision(shape, spawnPos.x, spawnPos.y, boardRef.current)) {
        handleGameOver();
        return;
      }

      const newPiece: ActivePiece = {
        type: pieceType,
        shape,
        rotation: 0,
        x: spawnPos.x,
        y: spawnPos.y,
      };

      setActivePiece(newPiece);
      setCanHold(true);
      lockResetsRef.current = 0;
      firstGroundTouchTimeRef.current = null;

      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
        lockTimeoutRef.current = null;
      }

      const ghost = calculateGhostY(newPiece, boardRef.current);
      setGhostY(ghost);
    },
    [pullNextPiece, checkCollision, calculateGhostY]
  );

  // Game Over handler
  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(true);
    soundManager.playGameOver();

    // Check high score
    const currentScore = statsRef.current.score;
    const isNewHigh = saveHighScore(currentScore, mode, dailyConfig?.dateStr);
    if (isNewHigh) {
      setStats((prev) => ({ ...prev, highScore: currentScore }));
      addFloatingText('NEW HIGH SCORE!', '#facc15');
    }

    // Add to leaderboard
    addLeaderboardRecord({
      score: currentScore,
      lines: statsRef.current.lines,
      level: statsRef.current.level,
      mode,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      durationSeconds: statsRef.current.timeElapsed,
      note: 'Topped Out',
    });
  }, [mode, dailyConfig, addFloatingText]);

  // Lock the active piece to matrix and clear lines
  const lockPiece = useCallback(() => {
    const piece = activePieceRef.current;
    if (!piece) return;

    soundManager.playLock();
    const newBoard = boardRef.current.map((row) => [...row]);

    // Stamp piece onto board
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const boardY = piece.y + r;
          const boardX = piece.x + c;
          if (boardY >= 0 && boardY < BOARD_ROWS && boardX >= 0 && boardX < BOARD_COLS) {
            newBoard[boardY][boardX] = piece.type;
          }
        }
      }
    }

    // Check full rows
    const fullRows: number[] = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (newBoard[r].every((cell) => cell !== null)) {
        fullRows.push(r);
      }
    }

    setActivePiece(null);
    firstGroundTouchTimeRef.current = null;
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }

    if (fullRows.length > 0) {
      // Line clear animation
      setClearingRows(fullRows);
      soundManager.playLineClear(fullRows.length);

      // Scoring calculation
      const linesCleared = fullRows.length;
      const currentLevel = statsRef.current.level;
      const isB2B = statsRef.current.backToBack && linesCleared === 4;
      let lineBaseScore = 0;

      if (linesCleared === 1) {
        lineBaseScore = 100 * currentLevel;
        addFloatingText('SINGLE +100', '#67e8f9', { y: 52 });
      } else if (linesCleared === 2) {
        lineBaseScore = 300 * currentLevel;
        addFloatingText('DOUBLE +300', '#38bdf8', { y: 52 });
      } else if (linesCleared === 3) {
        lineBaseScore = 500 * currentLevel;
        addFloatingText('TRIPLE +500', '#818cf8', { y: 52 });
      } else if (linesCleared === 4) {
        triggerShake();
        if (isB2B) {
          lineBaseScore = 1200 * currentLevel;
          addFloatingText('BACK-TO-BACK TETRIS! +1,200', '#ec4899', { y: 52 });
        } else {
          lineBaseScore = 800 * currentLevel;
          addFloatingText('TETRIS! +800', '#a855f7', { y: 52 });
        }
      }

      // Combo handling: consecutive line clears
      const nextCombo = statsRef.current.combo + 1;
      const comboBonus = nextCombo > 1 ? 50 * nextCombo * currentLevel : 0;
      if (nextCombo > 1) {
        soundManager.playCombo(nextCombo);

        let comboColor = '#facc15';
        let comboText = `COMBO x${nextCombo}!`;

        if (nextCombo === 3) {
          comboColor = '#fb923c';
          comboText = `COMBO x3!`;
        } else if (nextCombo === 4) {
          comboColor = '#f43f5e';
          comboText = `COMBO x4!`;
        } else if (nextCombo >= 5) {
          comboColor = '#ec4899';
          comboText = `MEGA COMBO x${nextCombo}!`;
        }

        addFloatingText(comboText, comboColor, {
          y: 34,
          x: 50,
          isCombo: true,
          comboCount: nextCombo,
          duration: 1400,
        });
      }

      // Apply daily challenge score multiplier if active
      const scoreMultiplier = mode === 'daily' && dailyConfig ? dailyConfig.scoreMultiplier : 1;
      const totalEarned = Math.round((lineBaseScore + comboBonus) * scoreMultiplier);

      const newScore = statsRef.current.score + totalEarned;
      const newLines = statsRef.current.lines + linesCleared;

      // Update High Score live
      const currentHigh = Math.max(statsRef.current.highScore, newScore);
      if (newScore > statsRef.current.highScore) {
        saveHighScore(newScore, mode, dailyConfig?.dateStr);
      }

      // Check level mission objectives if in levels mode
      if (mode === 'levels') {
        const mission = LEVEL_MISSIONS.find((m) => m.levelNumber === startingLevel);
        if (mission) {
          const reachedLines = newLines >= mission.targetLines;
          const reachedScore = !mission.targetScore || newScore >= mission.targetScore;

          if (reachedLines && reachedScore) {
            setIsLevelWon(true);
            setIsPlaying(false);
            soundManager.playWin();
            markLevelCompleted(startingLevel);
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });
            if (onLevelComplete) {
              onLevelComplete(startingLevel);
            }
          }
        }
      }

      setTimeout(() => {
        // Remove cleared rows and shift down
        const remainingBoard = newBoard.filter((_, idx) => !fullRows.includes(idx));
        const emptyRowsToAdd: BoardMatrix = Array.from(
          { length: fullRows.length },
          () => Array.from({ length: BOARD_COLS }, () => null)
        );
        const finalBoard = [...emptyRowsToAdd, ...remainingBoard];
        setBoard(finalBoard);
        boardRef.current = finalBoard;
        setClearingRows([]);

        // Update stats
        setStats((prev) => ({
          ...prev,
          score: newScore,
          highScore: currentHigh,
          lines: newLines,
          combo: nextCombo,
          maxCombo: Math.max(prev.maxCombo, nextCombo),
          backToBack: linesCleared === 4,
          tetrisCount: prev.tetrisCount + (linesCleared === 4 ? 1 : 0),
          singleCount: prev.singleCount + (linesCleared === 1 ? 1 : 0),
          doubleCount: prev.doubleCount + (linesCleared === 2 ? 1 : 0),
          tripleCount: prev.tripleCount + (linesCleared === 3 ? 1 : 0),
          piecesDropped: prev.piecesDropped + 1,
        }));

        spawnPiece();
      }, 180);
    } else {
      // No lines cleared, reset combo
      setBoard(newBoard);
      boardRef.current = newBoard;

      setStats((prev) => ({
        ...prev,
        combo: 0,
        piecesDropped: prev.piecesDropped + 1,
      }));

      spawnPiece();
    }
  }, [
    mode,
    startingLevel,
    dailyConfig,
    addFloatingText,
    triggerShake,
    onLevelComplete,
    spawnPiece,
  ]);

  // Soft Drop / Move Down
  const moveDown = useCallback((): boolean => {
    const piece = activePieceRef.current;
    if (!piece || isGameOverRef.current || isPausedRef.current || clearingRowsRef.current.length > 0)
      return false;

    if (!checkCollision(piece.shape, piece.x, piece.y + 1, boardRef.current)) {
      const updatedPiece = { ...piece, y: piece.y + 1 };
      setActivePiece(updatedPiece);
      activePieceRef.current = updatedPiece;
      // In free fall, reset ground contact timer
      firstGroundTouchTimeRef.current = null;
      // Soft drop 1 point
      setStats((prev) => ({ ...prev, score: prev.score + 1 }));
      return true;
    } else {
      // Landed on floor or block
      if (firstGroundTouchTimeRef.current === null) {
        firstGroundTouchTimeRef.current = Date.now();
      }
      if (!lockTimeoutRef.current) {
        lockTimeoutRef.current = window.setTimeout(() => {
          lockPiece();
        }, LOCK_DELAY_MS);
      }
      return false;
    }
  }, [checkCollision, lockPiece]);

  // Hard Drop
  const hardDrop = useCallback(() => {
    const piece = activePieceRef.current;
    if (!piece || isGameOverRef.current || isPausedRef.current || clearingRowsRef.current.length > 0)
      return;

    soundManager.playHardDrop();
    let dropDistance = 0;
    while (!checkCollision(piece.shape, piece.x, piece.y + dropDistance + 1, boardRef.current)) {
      dropDistance++;
    }

    if (dropDistance > 0) {
      setStats((prev) => ({
        ...prev,
        score: prev.score + dropDistance * 2,
      }));
    }

    const landedPiece: ActivePiece = {
      ...piece,
      y: piece.y + dropDistance,
    };
    activePieceRef.current = landedPiece;
    setActivePiece(landedPiece);

    triggerShake();
    lockPiece();
  }, [checkCollision, lockPiece, triggerShake]);

  // Move Horizontal with anti-stall cheese protection
  const moveHorizontal = useCallback(
    (dir: -1 | 1): boolean => {
      const piece = activePieceRef.current;
      if (!piece || isGameOverRef.current || isPausedRef.current || clearingRowsRef.current.length > 0)
        return false;

      if (!checkCollision(piece.shape, piece.x + dir, piece.y, boardRef.current)) {
        soundManager.playMove();
        const updatedPiece = { ...piece, x: piece.x + dir };
        setActivePiece(updatedPiece);
        activePieceRef.current = updatedPiece;

        // Check if sliding on floor
        if (checkCollision(piece.shape, piece.x + dir, piece.y + 1, boardRef.current)) {
          if (firstGroundTouchTimeRef.current === null) {
            firstGroundTouchTimeRef.current = Date.now();
          }
          const timeOnGround = Date.now() - firstGroundTouchTimeRef.current;

          // Anti-cheese: only reset lock delay if under max resets and under max 2.5s floor time
          if (lockResetsRef.current < MAX_LOCK_RESETS && timeOnGround < MAX_LOCK_TIME_TOTAL_MS) {
            lockResetsRef.current++;
            if (lockTimeoutRef.current) {
              clearTimeout(lockTimeoutRef.current);
              lockTimeoutRef.current = window.setTimeout(() => {
                lockPiece();
              }, LOCK_DELAY_MS);
            }
          }
        } else {
          // Moved off ledge into space
          firstGroundTouchTimeRef.current = null;
        }

        const ghost = calculateGhostY(updatedPiece, boardRef.current);
        setGhostY(ghost);
        return true;
      }
      return false;
    },
    [checkCollision, calculateGhostY, lockPiece]
  );

  // Rotate with SRS Wall Kicks & anti-stall cheese protection
  const rotatePiece = useCallback(
    (direction: 1 | -1 = 1) => {
      const piece = activePieceRef.current;
      if (!piece || isGameOverRef.current || isPausedRef.current || clearingRowsRef.current.length > 0)
        return;

      const newRotation = (((piece.rotation + direction) % 4) + 4) % 4 as RotationState;
      const targetShape = TETROMINO_ROTATIONS[piece.type][newRotation];

      const kickPrefix = piece.type === 'I' ? 'I_' : '';
      const kickKey = `${kickPrefix}${piece.rotation}->${newRotation}`;
      const kickOffsets = WALL_KICK_DATA[kickKey] || [[0, 0]];

      for (const [dx, dy] of kickOffsets) {
        const testX = piece.x + dx;
        const testY = piece.y + dy;

        if (!checkCollision(targetShape, testX, testY, boardRef.current)) {
          soundManager.playRotate();
          const rotated: ActivePiece = {
            ...piece,
            shape: targetShape,
            rotation: newRotation,
            x: testX,
            y: testY,
          };
          setActivePiece(rotated);
          activePieceRef.current = rotated;

          // Check floor contact and apply anti-cheese limits
          if (checkCollision(targetShape, testX, testY + 1, boardRef.current)) {
            if (firstGroundTouchTimeRef.current === null) {
              firstGroundTouchTimeRef.current = Date.now();
            }
            const timeOnGround = Date.now() - firstGroundTouchTimeRef.current;

            if (lockResetsRef.current < MAX_LOCK_RESETS && timeOnGround < MAX_LOCK_TIME_TOTAL_MS) {
              lockResetsRef.current++;
              if (lockTimeoutRef.current) {
                clearTimeout(lockTimeoutRef.current);
                lockTimeoutRef.current = window.setTimeout(() => {
                  lockPiece();
                }, LOCK_DELAY_MS);
              }
            }
          } else {
            firstGroundTouchTimeRef.current = null;
          }

          const ghost = calculateGhostY(rotated, boardRef.current);
          setGhostY(ghost);
          return;
        }
      }
    },
    [checkCollision, calculateGhostY, lockPiece]
  );

  // Hold Piece
  const hold = useCallback(() => {
    const piece = activePieceRef.current;
    if (
      !piece ||
      !canHold ||
      isGameOverRef.current ||
      isPausedRef.current ||
      clearingRowsRef.current.length > 0
    )
      return;

    soundManager.playHold();
    setCanHold(false);

    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }
    firstGroundTouchTimeRef.current = null;

    const currentType = piece.type;
    if (holdPiece === null) {
      setHoldPiece(currentType);
      spawnPiece();
    } else {
      const nextType = holdPiece;
      setHoldPiece(currentType);
      spawnPiece(nextType);
    }
  }, [canHold, holdPiece, spawnPiece]);

  // Restart / Start Game
  const startGame = useCallback(() => {
    let garbageRows = 0;
    let actualStartLevel = startingLevel;

    if (mode === 'daily' && dailyConfig) {
      actualStartLevel = dailyConfig.startLevel;
      garbageRows = dailyConfig.initialGarbageRows;
      rngRef.current = createMulberry32(dailyConfig.seed);
      bagRef.current = [
        ...createSeededSevenBag(rngRef.current),
        ...createSeededSevenBag(rngRef.current),
      ];
    } else if (mode === 'levels') {
      const mission = LEVEL_MISSIONS.find((m) => m.levelNumber === startingLevel);
      if (mission?.initialGarbageRows) {
        garbageRows = mission.initialGarbageRows;
      }
      bagRef.current = [...createSevenBag(), ...createSevenBag()];
    } else {
      bagRef.current = [...createSevenBag(), ...createSevenBag()];
    }

    const newBoard = createEmptyBoard(garbageRows);
    setBoard(newBoard);
    boardRef.current = newBoard;

    setNextQueue([...bagRef.current.slice(0, 4)]);
    setHoldPiece(null);
    setCanHold(true);
    setIsGameOver(false);
    setIsLevelWon(false);
    setIsPaused(false);
    setIsPlaying(true);
    setClearingRows([]);
    setFloatingTexts([]);
    firstGroundTouchTimeRef.current = null;

    setStats({
      score: 0,
      highScore: getHighScore(mode, dailyConfig?.dateStr),
      lines: 0,
      level: actualStartLevel,
      combo: 0,
      maxCombo: 0,
      backToBack: false,
      tetrisCount: 0,
      singleCount: 0,
      doubleCount: 0,
      tripleCount: 0,
      piecesDropped: 0,
      timeElapsed: 0,
    });

    spawnPiece();
  }, [mode, startingLevel, dailyConfig, spawnPiece]);

  // QUIT MID-GAME & SAVE SCORE
  const quitGame = useCallback(() => {
    if (!isPlayingRef.current) return;

    const currentScore = statsRef.current.score;
    const currentLines = statsRef.current.lines;
    const currentLevel = statsRef.current.level;
    const timeSec = statsRef.current.timeElapsed;

    setIsPlaying(false);
    setIsPaused(false);
    soundManager.pauseMusic();

    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }

    if (currentScore > 0) {
      const isNewHigh = saveHighScore(currentScore, mode, dailyConfig?.dateStr);
      if (isNewHigh) {
        setStats((prev) => ({ ...prev, highScore: currentScore }));
        addFloatingText('SAVED NEW HIGH SCORE!', '#facc15', { y: 40, duration: 2500 });
      } else {
        addFloatingText(
          `SCORE SAVED: ${currentScore.toLocaleString()} PTS`,
          '#38bdf8',
          { y: 40, duration: 2000 }
        );
      }

      addLeaderboardRecord({
        score: currentScore,
        lines: currentLines,
        level: currentLevel,
        mode,
        date: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        durationSeconds: timeSec,
        note: 'Quit (Saved)',
      });
    }
  }, [mode, dailyConfig, addFloatingText]);

  const togglePause = useCallback(() => {
    if (!isPlaying || isGameOver || isLevelWon) return;
    setIsPaused((prev) => !prev);
  }, [isPlaying, isGameOver, isLevelWon]);

  // Main Game Animation Loop (falling blocks)
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver || isLevelWon) return;

    let isCancelled = false;

    const gameLoop = (timestamp: number) => {
      if (isCancelled) return;

      if (!lastFallTimeRef.current) {
        lastFallTimeRef.current = timestamp;
      }

      let intervalMs = 600;
      if (mode === 'endless' || mode === 'daily') {
        const startLvl = mode === 'daily' && dailyConfig ? dailyConfig.startLevel : startingLevel;
        intervalMs = calculateEndlessSpeed(
          startLvl,
          statsRef.current.lines,
          statsRef.current.timeElapsed
        );
      } else {
        intervalMs = BASE_LEVEL_SPEEDS[Math.min(startingLevel, 10)] || 500;
      }

      if (timestamp - lastFallTimeRef.current >= intervalMs) {
        lastFallTimeRef.current = timestamp;
        moveDown();
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isPlaying,
    isPaused,
    isGameOver,
    isLevelWon,
    mode,
    startingLevel,
    dailyConfig,
    moveDown,
  ]);

  // Timer loop
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver || isLevelWon) return;

    timerIntervalRef.current = window.setInterval(() => {
      setStats((prev) => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPlaying, isPaused, isGameOver, isLevelWon]);

  // Multi-key handler: WASD, ZQSD, and ARROWS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const code = e.code;
      const key = e.key.toLowerCase();

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        e.preventDefault();
      }

      const isRepeat = e.repeat;

      // Pause toggle
      if (key === 'p' || key === 'escape') {
        togglePause();
        return;
      }

      if (
        !isPlayingRef.current ||
        isPausedRef.current ||
        isGameOverRef.current ||
        clearingRowsRef.current.length > 0
      ) {
        return;
      }

      // 1. LEFT: ArrowLeft, 'a' (WASD), 'q' (ZQSD)
      const isLeft = code === 'ArrowLeft' || key === 'a' || key === 'q';
      // 2. RIGHT: ArrowRight, 'd' (WASD / ZQSD)
      const isRight = code === 'ArrowRight' || key === 'd';
      // 3. DOWN (Soft Drop): ArrowDown, 's' (WASD / ZQSD)
      const isDown = code === 'ArrowDown' || key === 's';
      // 4. ROTATE CW: ArrowUp, 'w' (WASD), 'z' (ZQSD)
      const isRotateCW = code === 'ArrowUp' || key === 'w' || key === 'z';
      // 5. HARD DROP: Space
      const isHardDrop = code === 'Space';
      // 6. HOLD: 'c', Shift, 'h'
      const isHold = key === 'c' || key === 'h' || code === 'ShiftLeft' || code === 'ShiftRight';
      // 7. ROTATE CCW: 'x'
      const isRotateCCW = key === 'x';

      setActiveKeysDisplay((prev) => ({
        ...prev,
        left: isLeft || prev.left,
        right: isRight || prev.right,
        down: isDown || prev.down,
        rotate: isRotateCW || isRotateCCW || prev.rotate,
        drop: isHardDrop || prev.drop,
        hold: isHold || prev.hold,
      }));

      if (isLeft && !pressedKeysRef.current.has('left')) {
        pressedKeysRef.current.add('left');
        moveHorizontal(-1);

        if (dasTimeoutRef.current) clearTimeout(dasTimeoutRef.current);
        if (arrIntervalRef.current) clearInterval(arrIntervalRef.current);

        dasTimeoutRef.current = window.setTimeout(() => {
          arrIntervalRef.current = window.setInterval(() => {
            if (pressedKeysRef.current.has('left')) {
              moveHorizontal(-1);
            }
          }, 45);
        }, 150);
      }

      if (isRight && !pressedKeysRef.current.has('right')) {
        pressedKeysRef.current.add('right');
        moveHorizontal(1);

        if (dasTimeoutRef.current) clearTimeout(dasTimeoutRef.current);
        if (arrIntervalRef.current) clearInterval(arrIntervalRef.current);

        dasTimeoutRef.current = window.setTimeout(() => {
          arrIntervalRef.current = window.setInterval(() => {
            if (pressedKeysRef.current.has('right')) {
              moveHorizontal(1);
            }
          }, 45);
        }, 150);
      }

      if (isDown) {
        moveDown();
      }

      if (isRotateCW && !isRepeat) {
        rotatePiece(1);
      }

      if (isRotateCCW && !isRepeat) {
        rotatePiece(-1);
      }

      if (isHardDrop && !isRepeat) {
        hardDrop();
      }

      if (isHold && !isRepeat) {
        hold();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      const isLeft = code === 'ArrowLeft' || key === 'a' || key === 'q';
      const isRight = code === 'ArrowRight' || key === 'd';
      const isDown = code === 'ArrowDown' || key === 's';
      const isRotate = code === 'ArrowUp' || key === 'w' || key === 'z' || key === 'x';
      const isHardDrop = code === 'Space';
      const isHold = key === 'c' || key === 'h' || code === 'ShiftLeft' || code === 'ShiftRight';

      if (isLeft) {
        pressedKeysRef.current.delete('left');
        if (!pressedKeysRef.current.has('right')) {
          if (dasTimeoutRef.current) clearTimeout(dasTimeoutRef.current);
          if (arrIntervalRef.current) clearInterval(arrIntervalRef.current);
        }
      }

      if (isRight) {
        pressedKeysRef.current.delete('right');
        if (!pressedKeysRef.current.has('left')) {
          if (dasTimeoutRef.current) clearTimeout(dasTimeoutRef.current);
          if (arrIntervalRef.current) clearInterval(arrIntervalRef.current);
        }
      }

      setActiveKeysDisplay({
        left: isLeft ? false : pressedKeysRef.current.has('left'),
        right: isRight ? false : pressedKeysRef.current.has('right'),
        down: false,
        rotate: false,
        drop: false,
        hold: false,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (dasTimeoutRef.current) clearTimeout(dasTimeoutRef.current);
      if (arrIntervalRef.current) clearInterval(arrIntervalRef.current);
    };
  }, [
    moveHorizontal,
    moveDown,
    rotatePiece,
    hardDrop,
    hold,
    togglePause,
  ]);

  return {
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
    actions: {
      startGame,
      quitGame,
      togglePause,
      moveLeft: () => moveHorizontal(-1),
      moveRight: () => moveHorizontal(1),
      moveDown,
      rotateCW: () => rotatePiece(1),
      rotateCCW: () => rotatePiece(-1),
      hardDrop,
      hold,
    },
  };
}
