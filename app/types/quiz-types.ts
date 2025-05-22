
export type QuestionType = "single" | "multiple" | "text" | "match";


export type ServerQuestionType = "SINGLE" | "MULTIPLE" | "MATCH" | "TEXT";

export interface MatchPair {
  left: string;
  right: string;
}


export interface ServerQuestion {
  id: number;
  question: string;
  type: ServerQuestionType; 
  options?: { text: string; isCorrect: boolean }[];
  matchPairs?: MatchPair[];
  textAnswer?: { answer: string };
}


export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options: { text: string }[];
  correctAnswerIndex?: number | number[];
  matchPairs?: MatchPair[];
  textAnswer?: { answer: string };
}

export type Answer =
  | { type: "single"; questionId: string; selectedIndex: number | null }
  | { type: "multiple"; questionId: string; selectedIndexes: number[] }
  | { type: "text"; questionId: string; text: string }
  | {
      type: "match";
      questionId: string;
      pairs: { left: string; right: string }[];
    };

export type AnswerAction =
  | { type: "setAnswer"; questionId: string; answer: Answer }
  | { type: "reset" };
