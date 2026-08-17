export type GameState = 
  | 'LOBBY' 
  | 'QUESTION_INTRO' 
  | 'QUESTION_ACTIVE' 
  | 'REVEAL' 
  | 'LEADERBOARD' 
  | 'PODIUM';

export interface Player {
  id: string;
  nickname: string;
  score: number;
  streak: number;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
}

export interface AnswerInfo {
  answerIndex: number;
  isCorrect: boolean;
  points: number;
}

export interface Room {
  hostId: string;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  state: GameState;
  answers: Record<string, AnswerInfo>;
  questionStartTime?: number;
  questionTimeout?: ReturnType<typeof setTimeout> | null;
}

// Client-to-Server Events
export interface ClientToServerEvents {
  'host:create-room': (data: { quizId: number }) => void;
  'host:start-game': (data: { pin: string }) => void;
  'host:next': (data: { pin: string }) => void;
  'player:join': (data: { pin: string; nickname: string }) => void;
  'player:submit-answer': (data: { pin: string; answerIndex: number }) => void;
  'player:reconnect': (data: { pin: string; nickname: string }) => void;
  'host:reconnect': (data: { pin: string }) => void;
  'host:end-game': (data: { pin: string }) => void;
}

// Server-to-Client Events
export interface ServerToClientEvents {
  'room-created': (data: { pin: string }) => void;
  'player-joined': (players: Player[]) => void;
  'join-success': (data: { pin: string; nickname: string }) => void;
  'error': (message: string) => void;
  'reconnect-error': (message: string) => void;
  'game:state-update': (data: GameStateUpdatePayload) => void;
  'player:answer-result': (data: { isCorrect: boolean; pointsGained: number; totalScore: number; streak: number }) => void;
  'game:ended': () => void;
}

export type GameStateUpdatePayload = 
  | { state: 'LOBBY' } // Typically not sent, handled implicitly before start
  | { state: 'QUESTION_INTRO'; title: string; questionNumber: number; totalQuestions: number }
  | { state: 'QUESTION_ACTIVE'; question: { text: string; options: string[]; timeLimit: number } }
  | { state: 'REVEAL'; correctIndex: number; distribution: number[]; leaderboard: Player[] }
  | { state: 'LEADERBOARD'; leaderboard: Player[] }
  | { state: 'PODIUM'; podium: Player[] };
