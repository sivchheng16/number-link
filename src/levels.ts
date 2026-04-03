import { Level } from './types';
import { generateReverseLevel } from './lib/generator';

// Generate 100 levels (20 per category)
const generateAllLevels = (): Level[] => {
  const levels: Level[] = [];
  const categories = [
    { name: 'Starter Pack', size: 5, minPairs: 3, maxPairs: 4 },
    { name: 'The Grid Rises', size: 6, minPairs: 4, maxPairs: 5 },
    { name: 'Multi-Hue Master', size: 7, minPairs: 5, maxPairs: 6 },
    { name: 'Complex Conduits', size: 7, minPairs: 6, maxPairs: 7 },
    { name: 'The Flow Grandmaster', size: 8, minPairs: 7, maxPairs: 9 },
  ];

  let id = 1;
  categories.forEach(cat => {
    for (let i = 0; i < 20; i++) {
      // Use a consistent seed based on ID to ensure levels are the same on every load
      const targetPairs = Math.floor(id % (cat.maxPairs - cat.minPairs + 1)) + cat.minPairs;
      levels.push(generateReverseLevel(id, cat.size, cat.name, id * 12345, targetPairs));
      id++;
    }
  });

  return levels;
};

export const LEVELS: Level[] = generateAllLevels();
