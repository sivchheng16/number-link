export interface Point {
  x: number;
  y: number;
}

export interface Pair {
  value: number;
  start: Point;
  end: Point;
  color: string;
}

export interface Level {
  id: number;
  category: string;
  size: number;
  pairs: Pair[];
}

export interface Path {
  value: number;
  points: Point[];
  color: string;
  isComplete: boolean;
}
