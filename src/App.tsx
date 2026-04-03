import { useState, useEffect, useCallback, useRef, MouseEvent, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, ChevronLeft, ChevronRight, Play, Info, Sparkles, Wand2 } from 'lucide-react';
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
    // Pick a size based on current category or just random
    const sizes = [5, 6, 7, 7, 8];
    const categories = ['Starter Pack', 'The Grid Rises', 'Multi-Hue Master', 'Complex Conduits', 'The Flow Grandmaster'];
    const randomIdx = Math.floor(Math.random() * sizes.length);
    const size = sizes[randomIdx];
    const category = categories[randomIdx];
    
    // For random levels, we'll pick a reasonable number of pairs based on size
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
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rawX = ((clientX - rect.left) / rect.width) * currentLevel.size;
    const rawY = ((clientY - rect.top) / rect.height) * currentLevel.size;
    
    const x = Math.floor(rawX);
    const y = Math.floor(rawY);
    
    if (x >= 0 && x < currentLevel.size && y >= 0 && y < currentLevel.size) {
      return { cell: { x, y }, raw: { x: rawX, y: rawY } };
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
    // Note: We do NOT set activePath to null here.
    // This allows incomplete paths to remain visible until a new number is started.
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

  return (
    <div className={`min-h-screen ${theme.containerBg} text-slate-100 font-sans flex flex-col items-center p-4 md:p-8 transition-colors duration-1000`}>
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${theme.accentColor.replace('text-', 'bg-').replace('-400', '-600').replace('-500', '-600').replace('-300', '-500')} rounded-lg shadow-lg`}>
            <Play className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Logic Link</h1>
            <div className="flex items-center gap-1 opacity-60">
              <Sparkles className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-widest font-bold">{theme.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={generateRandomLevel}
            className={`p-2 hover:${theme.uiBg} rounded-full transition-colors ${customLevel ? theme.accentColor : 'opacity-60'}`}
            title="Generate Random Level"
          >
            <Wand2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowInstructions(true)}
            className={`p-2 hover:${theme.uiBg} rounded-full transition-colors opacity-60`}
            title="How to play"
          >
            <Info className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-2 ${theme.uiBg} px-4 py-2 rounded-full border ${theme.uiBorder}`}>
              <button 
                onClick={prevLevel} 
                disabled={!customLevel && currentLevelIndex === 0}
                className={`disabled:opacity-30 hover:${theme.accentColor} transition-colors`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                {customLevel ? "Random" : `Level ${currentLevel.id}`} / {LEVELS.length}
              </span>
              <button 
                onClick={nextLevel} 
                disabled={!customLevel && currentLevelIndex === LEVELS.length - 1}
                className={`disabled:opacity-30 hover:${theme.accentColor} transition-colors`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-1 mr-4">
              <span className={`text-[10px] uppercase tracking-widest font-bold ${theme.accentColor}`}>
                {currentLevel.category}
              </span>
              <span className="text-[8px] opacity-40 uppercase tracking-tighter font-bold flex items-center gap-0.5">
                • <Wand2 className="w-2 h-2" /> Verified Solvable
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Game Board Container */}
      <main className={`relative w-full max-w-md aspect-square ${theme.boardBg} rounded-2xl p-4 shadow-2xl border ${theme.uiBorder} transition-all duration-700`}>
        <div 
          ref={boardRef}
          className="relative w-full h-full grid gap-1 select-none touch-none"
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
            const x = i % currentLevel.size;
            const y = Math.floor(i / currentLevel.size);
            const pair = getPairAt({ x, y });
            const isError = errorPoint?.x === x && errorPoint?.y === y;
            const isConnected = pair && paths.some(p => p.value === pair.value && p.isComplete);
            
            return (
              <div 
                key={`${x}-${y}`}
                className={`relative ${theme.cellBg} rounded-md flex items-center justify-center overflow-hidden transition-colors duration-500`}
              >
                {pair && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: isConnected ? [1, 1.15, 1] : 1,
                      boxShadow: isConnected ? `0 0 20px ${pair.color}` : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      x: isError ? [0, -4, 4, -4, 4, 0] : 0
                    }}
                    transition={{
                      scale: isConnected ? { duration: 0.4, repeat: Infinity, repeatDelay: 3 } : { duration: 0.2 },
                      x: { duration: 0.3 }
                    }}
                    className={`w-4/5 h-4/5 ${theme.nodeShape} flex items-center justify-center text-white font-bold text-xl z-10 shadow-lg`}
                    style={{ backgroundColor: pair.color }}
                  >
                    <span className={theme.nodeShape.includes('rotate-45') ? '-rotate-45' : ''}>
                      {pair.value}
                    </span>
                  </motion.div>
                )}
                {isError && !pair && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 1] }}
                    className="absolute inset-0 bg-red-500/20 z-0"
                  />
                )}
              </div>
            );
          })}

          {/* SVG Overlay for Paths */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox={`0 0 ${currentLevel.size} ${currentLevel.size}`}
          >
            {[...paths, activePath].filter(Boolean).map((path, i) => {
              if (!path || path.points.length < 1) return null;
              
              const d = generateSmoothPath(path.points);

              return (
                <g key={i}>
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={path.color}
                    strokeWidth="0.55"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    className={theme.pathOpacity}
                  />
                  {/* Glowing effect for the line */}
                  <path
                    d={d}
                    fill="none"
                    stroke={path.color}
                    strokeWidth="0.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`opacity-20 ${theme.glowBlur}`}
                  />
                  {/* End point dot for active path */}
                  {path === activePath && path.points.length > 0 && (
                    <circle 
                      cx={path.points[path.points.length - 1].x + 0.5}
                      cy={path.points[path.points.length - 1].y + 0.5}
                      r="0.18"
                      fill={path.color}
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute inset-0 z-50 flex flex-col items-center justify-center ${theme.containerBg}/90 rounded-2xl backdrop-blur-sm p-8 text-center`}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Trophy className={`w-20 h-20 ${theme.accentColor.replace('text-', 'text-')} mb-4 mx-auto`} />
                <h2 className="text-3xl font-bold mb-2">
                  {currentLevelIndex === LEVELS.length - 1 ? "Master of Logic!" : "Level Complete!"}
                </h2>
                <p className="text-slate-400 mb-8">
                  {currentLevelIndex === LEVELS.length - 1 
                    ? "You've conquered all levels and mastered computational thinking." 
                    : "You've successfully linked all the numbers."}
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={resetLevel}
                    className={`flex items-center gap-2 px-6 py-3 ${theme.uiBg} hover:bg-slate-700 rounded-xl font-semibold transition-all border ${theme.uiBorder}`}
                  >
                    <RefreshCw className="w-5 h-5" />
                    Retry
                  </button>
                  {currentLevelIndex < LEVELS.length - 1 ? (
                    <button 
                      onClick={nextLevel}
                      className={`flex items-center gap-2 px-8 py-3 ${theme.accentColor.replace('text-', 'bg-').replace('-400', '-600').replace('-500', '-600').replace('-300', '-500')} hover:opacity-90 rounded-xl font-semibold shadow-lg transition-all`}
                    >
                      Next Level
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setCurrentLevelIndex(0)}
                      className={`flex items-center gap-2 px-8 py-3 ${theme.accentColor.replace('text-', 'bg-').replace('-400', '-600').replace('-500', '-600').replace('-300', '-500')} hover:opacity-90 rounded-xl font-semibold shadow-lg transition-all`}
                    >
                      Play Again
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Controls */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={resetLevel}
          className={`flex items-center gap-2 px-6 py-3 ${theme.uiBg} hover:bg-slate-700 rounded-xl font-semibold transition-all border ${theme.uiBorder}`}
        >
          <RefreshCw className="w-5 h-5" />
          Reset Board
        </button>
      </div>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`${theme.uiBg} border ${theme.uiBorder} p-8 rounded-3xl max-w-md w-full shadow-2xl`}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className={theme.accentColor} />
                How to Play
              </h2>
              <ul className="space-y-4 text-slate-300 mb-8">
                <li className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.accentColor.replace('text-', 'bg-').replace('-400', '-900/50').replace('-500', '-900/50').replace('-300', '-900/50')} ${theme.accentColor} flex items-center justify-center text-xs font-bold`}>1</span>
                  <p>Click and drag from a number to its matching pair.</p>
                </li>
                <li className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.accentColor.replace('text-', 'bg-').replace('-400', '-900/50').replace('-500', '-900/50').replace('-300', '-900/50')} ${theme.accentColor} flex items-center justify-center text-xs font-bold`}>2</span>
                  <p>Lines cannot cross or intersect with other lines.</p>
                </li>
                <li className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.accentColor.replace('text-', 'bg-').replace('-400', '-900/50').replace('-500', '-900/50').replace('-300', '-900/50')} ${theme.accentColor} flex items-center justify-center text-xs font-bold`}>3</span>
                  <p>Connect all pairs to complete the level.</p>
                </li>
                <li className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.accentColor.replace('text-', 'bg-').replace('-400', '-900/50').replace('-500', '-900/50').replace('-300', '-900/50')} ${theme.accentColor} flex items-center justify-center text-xs font-bold`}>4</span>
                  <p>You can continue drawing an incomplete path by clicking its tip.</p>
                </li>
              </ul>
              <button 
                onClick={() => {
                  setShowInstructions(false);
                  vibrate(10);
                }}
                className={`w-full py-4 ${theme.accentColor.replace('text-', 'bg-').replace('-400', '-600').replace('-500', '-600').replace('-300', '-500')} hover:opacity-90 rounded-2xl font-bold text-lg shadow-lg transition-all`}
              >
                Got it, Let's Play!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto pt-12 text-slate-500 text-sm">
        <p>© 2026 Logic Link • {theme.name} Theme</p>
      </footer>
    </div>
  );
}
