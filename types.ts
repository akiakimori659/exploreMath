export interface CurriculumNode {
  id: string;
  title: string;
  children?: CurriculumNode[];
}

export interface LessonState {
  bookId?: string; // ID of the book being studied
  unitId?: string; // ID of the unit being studied
  topic: string;
  category: string;
  content: string;
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean; // Track if the current lesson has been claimed for LP
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  topic: string;
  category: string;
  timestamp: number;
}

export type DrillType = 'add' | 'sub' | 'mul' | 'div' | 'exp' | 'root';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DrillQuestion {
  id: number;
  question: string;
  answer: number;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface DrillSettings {
  types: DrillType[];
  count: 10 | 25 | 50;
  difficulty: Difficulty;
}

export interface Unit {
  id: string;
  title: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  units: Unit[];
}