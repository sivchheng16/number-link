import { Level, Point, Pair } from '../types';
import { COLORS } from '../constants';

/**
 * Simple seeded random number generator.
 */
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

/**
 * Generates a Flow Free level using the "Reverse Generation" method.
 * 1. Fills the grid with non-overlapping paths.
 * 2. Uses the endpoints of these paths as the start/end nodes.
 */
export function generateReverseLevel(id: number, size: number, category: string, seedValue?: number, targetPairs?: number): Level {
  const rng = new SeededRandom(seedValue ?? id);
  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(-1));
  const paths: Point[][] = [];
  let unassignedCount = size * size;

  const getNeighbors = (p: Point) => {
    const neighbors: Point[] = [];
    const dirs = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
    for (const d of dirs) {
      const nx = p.x + d.x;
      const ny = p.y + d.y;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        neighbors.push({ x: nx, y: ny });
      }
    }
    return neighbors;
  };

  const getUnassignedNeighbors = (p: Point) => {
    return getNeighbors(p).filter(n => grid[n.y][n.x] === -1);
  };

  // Main generation loop
  while (unassignedCount > 0) {
    // Collect all growable tips
    const tips: { pathIdx: number; isEnd: boolean; point: Point }[] = [];
    paths.forEach((path, idx) => {
      const start = path[0];
      const end = path[path.length - 1];
      
      const startNeighbors = getUnassignedNeighbors(start);
      if (startNeighbors.length > 0) {
        tips.push({ pathIdx: idx, isEnd: false, point: start });
      }
      
      // If length is 1, start and end are the same, don't add twice
      if (path.length > 1) {
        const endNeighbors = getUnassignedNeighbors(end);
        if (endNeighbors.length > 0) {
          tips.push({ pathIdx: idx, isEnd: true, point: end });
        }
      }
    });

    // Decide whether to grow or start new
    // If we have reached targetPairs, we MUST grow if possible.
    const canGrow = tips.length > 0;
    const reachedTarget = targetPairs !== undefined && paths.length >= targetPairs;
    
    // We favor growing existing paths (85% chance) to create longer, more interesting paths
    // If reachedTarget, we only grow.
    const shouldGrow = canGrow && (reachedTarget || rng.next() < 0.85 || unassignedCount < 2);

    if (shouldGrow) {
      const tip = tips[Math.floor(rng.next() * tips.length)];
      const neighbors = getUnassignedNeighbors(tip.point);
      const next = neighbors[Math.floor(rng.next() * neighbors.length)];
      
      if (tip.isEnd) {
        paths[tip.pathIdx].push(next);
      } else {
        paths[tip.pathIdx].unshift(next);
      }
      
      grid[next.y][next.x] = tip.pathIdx;
      unassignedCount--;
    } else {
      // Start a new path
      // Find all unassigned cells
      const unassignedCells: Point[] = [];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (grid[y][x] === -1) unassignedCells.push({ x, y });
        }
      }
      
      if (unassignedCells.length > 0) {
        const start = unassignedCells[Math.floor(rng.next() * unassignedCells.length)];
        const newPathIdx = paths.length;
        paths.push([start]);
        grid[start.y][start.x] = newPathIdx;
        unassignedCount--;
      }
    }
  }

  // Post-processing: Fix paths of length 1
  // These are isolated cells that couldn't grow. We merge them into a neighbor path.
  for (let i = 0; i < paths.length; i++) {
    if (paths[i].length === 1) {
      const p = paths[i][0];
      const neighbors = getNeighbors(p);
      // Find a neighbor that is a tip of another path
      let merged = false;
      for (const n of neighbors) {
        const neighborPathIdx = grid[n.y][n.x];
        if (neighborPathIdx !== -1 && neighborPathIdx !== i) {
          const neighborPath = paths[neighborPathIdx];
          if (neighborPath[0].x === n.x && neighborPath[0].y === n.y) {
            neighborPath.unshift(p);
            merged = true;
            break;
          } else if (neighborPath[neighborPath.length - 1].x === n.x && neighborPath[neighborPath.length - 1].y === n.y) {
            neighborPath.push(p);
            merged = true;
            break;
          }
        }
      }
      
      // If we couldn't merge into a tip, just merge into any neighbor by breaking the path
      // (This is a simplified fallback: we just attach it to the neighbor and let the neighbor path be non-linear for a moment, 
      // but actually we should just insert it. For Flow, paths must be linear. 
      // A better way is to find where the neighbor is in its path and insert it there.)
      if (!merged) {
        for (const n of neighbors) {
          const neighborPathIdx = grid[n.y][n.x];
          if (neighborPathIdx !== -1 && neighborPathIdx !== i) {
            const neighborPath = paths[neighborPathIdx];
            const idx = neighborPath.findIndex(pt => pt.x === n.x && pt.y === n.y);
            neighborPath.splice(idx + 1, 0, p);
            merged = true;
            break;
          }
        }
      }
      
      if (merged) {
        paths.splice(i, 1);
        i--; // Adjust index after splice
        // Update grid (optional, but good for consistency)
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            if (grid[y][x] > i) grid[y][x]--;
          }
        }
      }
    }
  }

  // Final check: Some paths might still be length 1 if they were completely surrounded by non-tips.
  // We'll just remove them from the final level pairs.
  const validPaths = paths.filter(p => p.length > 1);

  const pairs: Pair[] = validPaths.map((path, idx) => ({
    value: idx + 1,
    start: path[0],
    end: path[path.length - 1],
    color: COLORS[idx % COLORS.length]
  }));

  return {
    id,
    category,
    size,
    pairs
  };
}
