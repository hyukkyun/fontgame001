export interface FontInfo {
  id: string;
  name: string;
  css: string;
  family: string;
}

export interface Quiz {
  id: string;
  word: string;
  answer: FontInfo;
  options: FontInfo[];
}

export interface GameState {
  currentQuizIndex: number;
  score: number;
  scoreList: boolean[];
  userAnswers: (FontInfo | null)[];
  quizzes: Quiz[];
  status: 'IDLE' | 'PLAYING' | 'RESULT' | 'ADMIN';
}
