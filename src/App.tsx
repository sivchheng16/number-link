import { useState, useEffect, useCallback, useRef, MouseEvent, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, ChevronLeft, ChevronRight, Play, Info, Sparkles, Wand2, Settings2 } from 'lucide-react';
import { LEVELS } from './levels';
import { Point, Path, Level, Pair } from './types';
import { THEMES } from './themes';
import { generateReverseLevel } from './lib/generator';

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [customLevel, setCustomLevel] = useState<Level | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [activePath, setActivePath] = useState<Path | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [errorPoint, setErrorPoint] = useState<Point | null>(null);

  const currentLevel = customLevel || LEVELS[currentLevelIndex];
  const theme = THEMES[currentLevel.category] || THEMES['Starter Pack'];
  const boardRef = useRef<HTMLDivElement>(null);



  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore vibration errors
      }
    }
  };

  // Initialize paths for the current level
  useEffect(() => {
    setPaths([]);
    setActivePath(null);
    setIsDragging(false);
    setIsLevelComplete(false);
  }, [currentLevelIndex, customLevel]);

  const generateRandomLevel = () => {
    const sizes = [5, 6, 7, 7, 8];
    const categories = ['Starter Pack', 'The Grid Rises', 'Multi-Hue Master', 'Complex Conduits', 'The Flow Grandmaster'];
    const randomIdx = Math.floor(Math.random() * sizes.length);
    const size = sizes[randomIdx];
    const category = categories[randomIdx];

    const targetPairs = size + Math.floor(Math.random() * 2);

    const newLevel = generateReverseLevel(999, size, category, Math.floor(Math.random() * 1000000), targetPairs);
    setCustomLevel(newLevel);
    vibrate(40);
  };

  const clearCustomLevel = () => {
    setCustomLevel(null);
  };

  const generateSmoothPath = (points: Point[]) => {
    if (points.length < 2) return "";

    const radius = 0.35; // Rounding radius in grid units
    let d = `M ${points[0].x + 0.5} ${points[0].y + 0.5}`;

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      const cx = curr.x + 0.5;
      const cy = curr.y + 0.5;

      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;

      // Check if direction changes (turn)
      if (dx1 !== dx2 || dy1 !== dy2) {
        const x1 = cx - dx1 * radius;
        const y1 = cy - dy1 * radius;
        const x2 = cx + dx2 * radius;
        const y2 = cy + dy2 * radius;

        d += ` L ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
      } else {
        d += ` L ${cx} ${cy}`;
      }
    }

    const last = points[points.length - 1];
    d += ` L ${last.x + 0.5} ${last.y + 0.5}`;

    return d;
  };

  const getCellFromEvent = (e: MouseEvent | TouchEvent) => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as any).clientX;
    const clientY = 'touches' in e ? (e as any).touches[0].clientY : (e as any).clientY;

    const rawX = ((clientX - rect.left) / rect.width) * currentLevel.size;
    const rawY = ((clientY - rect.top) / rect.height) * currentLevel.size;

    const xCell = Math.floor(rawX);
    const yCell = Math.floor(rawY);

    if (xCell >= 0 && xCell < currentLevel.size && yCell >= 0 && yCell < currentLevel.size) {
      return { cell: { x: xCell, y: yCell }, raw: { x: rawX, y: rawY } };
    }
    return null;
  };

  const isPointInPath = (p: Point, path: Path) => {
    return path.points.some(pt => pt.x === p.x && pt.y === p.y);
  };

  const isPointOccupied = (p: Point, excludeValue?: number) => {
    // Check completed paths
    if (paths.some(path => path.value !== excludeValue && isPointInPath(p, path))) return true;
    // Check active path if it's not the one we're drawing
    if (activePath && activePath.value !== excludeValue && isPointInPath(p, activePath)) return true;
    return false;
  };

  const getPairAt = (p: Point): Pair | undefined => {
    return currentLevel.pairs.find(pair =>
      (pair.start.x === p.x && pair.start.y === p.y) ||
      (pair.end.x === p.x && pair.end.y === p.y)
    );
  };

  const handleStart = (p: Point) => {
    if (isLevelComplete) return;

    const pair = getPairAt(p);

    // 1. Check if we clicked a number endpoint
    if (pair) {
      // If the path for this number is already complete and "locked", do nothing
      if (paths.some(path => path.value === pair.value)) return;

      // If we click the start of the CURRENT active path, we reset it and start over
      if (activePath && activePath.value === pair.value) {
        const newPath: Path = {
          value: pair.value,
          points: [p],
          color: pair.color,
          isComplete: false
        };
        setActivePath(newPath);
        setIsDragging(true);
        vibrate(10);
        return;
      }

      // If we click a NEW number, we reset the previous incomplete path and start this one
      const newPath: Path = {
        value: pair.value,
        points: [p],
        color: pair.color,
        isComplete: false
      };
      setActivePath(newPath);
      setIsDragging(true);
      vibrate(10);
      return;
    }

    // 2. Check if we clicked the "tip" of the current incomplete active path to continue drawing
    if (activePath && !activePath.isComplete) {
      const lastPoint = activePath.points[activePath.points.length - 1];
      if (lastPoint.x === p.x && lastPoint.y === p.y) {
        setIsDragging(true);
        vibrate(10);
      }
    }
  };

  const handleMove = (p: Point, raw: { x: number, y: number }) => {


    if (!activePath || !isDragging || isLevelComplete) return;

    let lastPoint = activePath.points[activePath.points.length - 1];

    // Check if it's the same point
    if (lastPoint.x === p.x && lastPoint.y === p.y) return;

    // INTERPOLATION: If the mouse moved more than one cell, try to fill the gap orthogonally
    const pointsToAdd: Point[] = [];
    let currentX = lastPoint.x;
    let currentY = lastPoint.y;

    // Orthogonal step-by-step movement towards the target point
    while (currentX !== p.x || currentY !== p.y) {
      let stepX = 0;
      let stepY = 0;

      const dx = p.x - currentX;
      const dy = p.y - currentY;

      // If we have a diagonal movement, decide which way to go based on raw mouse position
      if (dx !== 0 && dy !== 0) {
        // Compare distance from raw mouse to the two possible intermediate cells
        const distToXStep = Math.pow(raw.x - (currentX + Math.sign(dx) + 0.5), 2) + Math.pow(raw.y - (currentY + 0.5), 2);
        const distToYStep = Math.pow(raw.x - (currentX + 0.5), 2) + Math.pow(raw.y - (currentY + Math.sign(dy) + 0.5), 2);

        if (distToXStep < distToYStep) {
          stepX = Math.sign(dx);
        } else {
          stepY = Math.sign(dy);
        }
      } else if (dx !== 0) {
        stepX = Math.sign(dx);
      } else {
        stepY = Math.sign(dy);
      }

      currentX += stepX;
      currentY += stepY;

      const nextPoint = { x: currentX, y: currentY };

      // Check if we move back to the previous point in the path (undoing)
      const currentPoints = [...activePath.points, ...pointsToAdd];
      if (currentPoints.length > 1) {
        const secondLast = currentPoints[currentPoints.length - 2];
        if (secondLast.x === nextPoint.x && secondLast.y === nextPoint.y) {
          break;
        }
      }

      // Check if point is occupied by another path
      if (isPointOccupied(nextPoint, activePath.value)) {
        setErrorPoint(nextPoint);
        setTimeout(() => setErrorPoint(null), 300);
        vibrate([20, 10]);
        break;
      }

      // Check if point is already in active path (looping)
      if (activePath.points.some(pt => pt.x === nextPoint.x && pt.y === nextPoint.y)) {
        break;
      }

      // Check if we hit another pair endpoint
      const otherPair = getPairAt(nextPoint);
      if (otherPair && otherPair.value !== activePath.value) {
        setErrorPoint(nextPoint);
        setTimeout(() => setErrorPoint(null), 300);
        vibrate([20, 10]);
        break;
      }

      pointsToAdd.push(nextPoint);
      vibrate(5);

      // If we reached a goal, stop
      const pair = currentLevel.pairs.find(pr => pr.value === activePath.value)!;
      if ((nextPoint.x === pair.start.x && nextPoint.y === pair.start.y) ||
        (nextPoint.x === pair.end.x && nextPoint.y === pair.end.y)) {
        break;
      }
    }

    if (pointsToAdd.length === 0) {
      // Check if it's an undo move (moving back one step)
      if (activePath.points.length > 1) {
        const secondLast = activePath.points[activePath.points.length - 2];
        if (secondLast.x === p.x && secondLast.y === p.y) {
          setActivePath({
            ...activePath,
            points: activePath.points.slice(0, -1)
          });
          vibrate(5);
        }
      }
      return;
    }

    // Add points to path
    const newPoints = [...activePath.points, ...pointsToAdd];
    const finalPoint = newPoints[newPoints.length - 1];
    const pair = currentLevel.pairs.find(pr => pr.value === activePath.value)!;
    const isComplete = (finalPoint.x === pair.start.x && finalPoint.y === pair.start.y) ||
      (finalPoint.x === pair.end.x && finalPoint.y === pair.end.y);

    const updatedPath = {
      ...activePath,
      points: newPoints,
      isComplete
    };

    setActivePath(updatedPath);

    if (isComplete) {
      setPaths(prev => [...prev.filter(path => path.value !== updatedPath.value), updatedPath]);
      setActivePath(null);
      setIsDragging(false);
      vibrate(30);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (paths.length === currentLevel.pairs.length && paths.every(p => p.isComplete)) {
      if (!isLevelComplete) {
        setIsLevelComplete(true);
        vibrate([100, 50, 100]);
      }
    }
  }, [paths, currentLevel, isLevelComplete]);

  const resetLevel = () => {
    setPaths([]);
    setActivePath(null);
    setIsDragging(false);
    setIsLevelComplete(false);
    vibrate(20);
  };

  const nextLevel = () => {
    if (customLevel) {
      clearCustomLevel();
      return;
    }
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      vibrate(10);
    }
  };

  const prevLevel = () => {
    if (customLevel) {
      clearCustomLevel();
      vibrate(10);
      return;
    }
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(prev => prev - 1);
      vibrate(10);
    }
  };

  const isLight = theme.containerBg.includes('stone-50') || theme.containerBg.includes('emerald-50') || theme.containerBg.includes('slate-50');

  return (
    <div className={`min-h-screen ${theme.containerBg} ${isLight ? 'text-stone-900' : 'text-slate-100'} font-sans flex flex-col items-center p-4 md:p-12 transition-colors duration-1000 overflow-x-hidden relative`}>

      {/* Background Ambient Blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] ${isLight ? 'bg-amber-200/40' : 'bg-amber-900/20'}`} />
        <div className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[120px] ${isLight ? 'bg-sky-200/40' : 'bg-sky-900/20'}`} />
      </div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        {/* Header Section */}
        <header className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-1"
            >
              <div className={`p-2.5 ${isLight ? 'bg-stone-900 text-white' : 'bg-white text-stone-950'} rounded-xl shadow-xl shadow-stone-500/10`}>
                <Settings2 className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black tracking-tight uppercase italic underline decoration-amber-500 decoration-4 underline-offset-4">Logic Link</h1>
            </motion.div>
            <div className="flex items-center gap-2 px-3 py-1 bg-stone-500/5 rounded-full border border-stone-500/10">
              <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold opacity-80">{theme.name} EXPERIENCE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-3 ${isLight ? 'glass-card-light' : 'glass-card'} px-5 py-3 rounded-2xl`}>
              <button
                onClick={prevLevel}
                disabled={!customLevel && currentLevelIndex === 0}
                className={`p-1 disabled:opacity-20 hover:scale-110 transition-transform ${theme.accentColor}`}
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <div className="flex flex-col items-center min-w-[100px]">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 leading-none mb-1">Mission</span>
                <span className="text-lg font-black tabular-nums tracking-tighter">
                  {customLevel ? "INFINITE" : `${String(currentLevel.id).padStart(3, '0')}`}
                </span>
              </div>
              <button
                onClick={nextLevel}
                disabled={!customLevel && currentLevelIndex === LEVELS.length - 1}
                className={`p-1 disabled:opacity-20 hover:scale-110 transition-transform ${theme.accentColor}`}
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={generateRandomLevel}
                className={`p-3 ${isLight ? 'bg-stone-900 text-white' : 'bg-white text-stone-950'} rounded-xl shadow-lg hover:rotate-90 transition-all duration-500`}
                title="Warp to Random Level"
              >
                <Wand2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowInstructions(true)}
                className={`p-3 ${isLight ? 'glass-card-light' : 'glass-card'} rounded-xl hover:scale-105 transition-all`}
                title="Interface Manual"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Global Game Area */}
        <div className="w-full flex justify-center">
          <motion.main
            className={`relative w-full max-w-md aspect-square ${isLight ? 'glass-card-light' : 'glass-card'} rounded-[2.5rem] p-6 shadow-2xl transition-all duration-700`}
          >
            {/* Internal glow for board */}
            <div className="absolute inset-4 rounded-[1.5rem] border border-white/5 pointer-events-none" />

            <div
              ref={boardRef}
              className="relative w-full h-full grid gap-2 select-none touch-none"
              style={{
                gridTemplateColumns: `repeat(${currentLevel.size}, 1fr)`,
                gridTemplateRows: `repeat(${currentLevel.size}, 1fr)`
              }}
              onMouseDown={(e) => {
                const p = getCellFromEvent(e);
                if (p) handleStart(p.cell);
              }}
              onMouseMove={(e) => {
                const p = getCellFromEvent(e);
                if (p) handleMove(p.cell, p.raw);
              }}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={(e) => {
                const p = getCellFromEvent(e);
                if (p) handleStart(p.cell);
              }}
              onTouchMove={(e) => {
                const p = getCellFromEvent(e);
                if (p) handleMove(p.cell, p.raw);
              }}
              onTouchEnd={handleEnd}
            >
              {/* Grid Cells */}
              {Array.from({ length: currentLevel.size * currentLevel.size }).map((_, i) => {
                const xPos = i % currentLevel.size;
                const yPos = Math.floor(i / currentLevel.size);
                const pair = getPairAt({ x: xPos, y: yPos });
                const isError = errorPoint?.x === xPos && errorPoint?.y === yPos;
                const isConnected = pair && paths.some(p => p.value === pair.value && p.isComplete);

                return (
                  <div
                    key={`${xPos}-${yPos}`}
                    className={`relative ${isLight ? 'bg-stone-500/5' : 'bg-white/5'} rounded-xl flex items-center justify-center overflow-hidden transition-colors duration-500`}
                  >
                    {pair && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: isConnected ? [1, 1.08, 1] : 1,
                          opacity: 1,
                          boxShadow: isConnected ? `0 0 25px ${pair.color}66` : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          x: isError ? [0, -4, 4, -4, 4, 0] : 0
                        }}
                        transition={{
                          scale: isConnected ? { duration: 0.6, ease: "easeOut" } : { duration: 0.4 },
                          x: { duration: 0.3 }
                        }}
                        className={`w-[85%] h-[85%] ${theme.nodeShape} flex items-center justify-center text-white font-black text-2xl z-10 shadow-lg`}
                        style={{ backgroundColor: pair.color }}
                      >
                        <span className={`${theme.nodeShape.includes('rotate-45') ? '-rotate-45' : ''} drop-shadow-md`}>
                          {pair.value}
                        </span>
                      </motion.div>
                    )}
                    {isError && !pair && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0] }}
                        className="absolute inset-0 bg-red-500 z-0"
                      />
                    )}
                  </div>
                );
              })}

              {/* Path Overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
                viewBox={`0 0 ${currentLevel.size} ${currentLevel.size}`}
              >
                {[...paths, activePath].filter(Boolean).map((path, idx) => {
                  if (!path || path.points.length < 1) return null;
                  const d = generateSmoothPath(path.points);
                  return (
                    <g key={idx}>
                      <motion.path
                        d={d}
                        fill="none"
                        stroke={path.color}
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        className="opacity-90"
                      />
                      {/* Secondary Glow Path */}
                      <path
                        d={d}
                        fill="none"
                        stroke={path.color}
                        strokeWidth="0.65"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-20 blur-[3px]"
                      />
                      {path === activePath && path.points.length > 0 && (
                        <motion.circle
                          animate={{ r: [0.12, 0.16, 0.12] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          cx={path.points[path.points.length - 1].x + 0.5}
                          cy={path.points[path.points.length - 1].y + 0.5}
                          r="0.12"
                          fill={path.color}
                          className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Level Complete Overlay */}
            <AnimatePresence>
              {isLevelComplete && (
                <motion.div
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  className={`absolute inset-0 z-50 flex flex-col items-center justify-center ${isLight ? 'bg-stone-50/80' : 'bg-stone-950/80'} rounded-[2.5rem] p-8 text-center`}
                >
                  <motion.div
                    initial={{ y: 40, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <div className={`w-28 h-28 mx-auto mb-8 relative`}>
                      <div className={`absolute inset-0 ${isLight ? 'bg-amber-500/20' : 'bg-amber-500/10'} rounded-full blur-2xl animate-pulse`} />
                      <Trophy className={`w-28 h-28 ${isLight ? 'text-amber-600' : 'text-amber-400'} relative z-10 drop-shadow-2xl`} />
                    </div>
                    <h2 className="text-4xl font-black mb-3 tracking-tighter uppercase italic">
                      {currentLevelIndex === LEVELS.length - 1 ? "Omega Conquered" : "Signal Synchronized"}
                    </h2>
                    <p className="text-stone-500 font-medium mb-10 max-w-[240px] mx-auto text-sm leading-relaxed">
                      {currentLevelIndex === LEVELS.length - 1
                        ? "You have achieved total logical synchronization across all dimensions."
                        : "Current link nodes established. Ready for next sequence."}
                    </p>

                    <div className="flex flex-col gap-4 items-stretch">
                      {currentLevelIndex < LEVELS.length - 1 ? (
                        <button
                          onClick={nextLevel}
                          className={`flex items-center justify-center gap-3 px-10 py-5 ${isLight ? 'bg-stone-900 text-white' : 'bg-white text-stone-900'} hover:scale-105 active:scale-95 rounded-2xl font-black text-lg shadow-2xl transition-all uppercase tracking-widest`}
                        >
                          Next Sequence
                          <ChevronRight className="w-6 h-6 stroke-[3]" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentLevelIndex(0)}
                          className={`flex items-center justify-center gap-3 px-10 py-5 ${isLight ? 'bg-amber-600 text-white' : 'bg-amber-500 text-stone-900'} hover:opacity-90 rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 transition-all uppercase tracking-widest`}
                        >
                          Reboot Drive
                          <RefreshCw className="w-5 h-5 stroke-[3]" />
                        </button>
                      )}
                      <button
                        onClick={resetLevel}
                        className={`flex items-center justify-center gap-2 px-6 py-4 ${isLight ? 'bg-stone-200 text-stone-700' : 'bg-stone-800 text-stone-300'} hover:bg-opacity-80 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest`}
                      >
                        Recalibrate
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        </div>

        {/* Global Controls */}
        <footer className="mt-16 flex flex-col items-center gap-10 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetLevel}
            className={`flex items-center gap-3 px-8 py-4 ${isLight ? 'glass-card-light' : 'glass-card'} rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all border ${theme.uiBorder} shadow-lg`}
          >
            <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            Purge Signal Paths
          </motion.button>

          <div className="flex flex-col items-center opacity-30 gap-1 mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">{theme.name} ENVIRONMENT v2.0</p>
            <div className="w-24 h-px bg-current opacity-20" />
          </div>
        </footer>
      </div>

      {/* Instructions Overlay */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-6 ${isLight ? 'bg-stone-100/90' : 'bg-stone-950/90'} backdrop-blur-xl`}
          >
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className={`${isLight ? 'bg-white' : 'bg-stone-900'} border ${isLight ? 'border-stone-200' : 'border-stone-800'} p-10 rounded-[3rem] max-w-md w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -mr-16 -mt-16" />

              <h2 className="text-3xl font-black mb-8 flex items-center gap-3 uppercase italic tracking-tighter">
                <div className={`p-2 ${isLight ? 'bg-amber-600' : 'bg-amber-500'} rounded-lg`}>
                  <Info className="text-white w-5 h-5" />
                </div>
                Manual Overlay
              </h2>

              <div className="space-y-6 text-stone-500 font-medium text-sm mb-12">
                {[
                  "Initiate connection by dragging from any numeric node.",
                  "Signal paths cannot cross or inhabit the same spatial grid.",
                  "Establish full node synchronization to complete priority mission.",
                  "Incomplete paths can be re-engaged by clicking their terminal point."
                ].map((text, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg ${isLight ? 'bg-stone-100 text-stone-900' : 'bg-stone-800 text-stone-100'} flex items-center justify-center text-[10px] font-black group-hover:bg-amber-500 group-hover:text-white transition-colors`}>{i + 1}</span>
                    <p className="leading-relaxed mt-1">{text}</p>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowInstructions(false);
                  vibrate(10);
                }}
                className={`w-full py-5 ${isLight ? 'bg-stone-900 text-white' : 'bg-white text-stone-950'} rounded-2xl font-black text-lg shadow-2xl transition-all uppercase tracking-widest`}
              >
                Access Interface
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
