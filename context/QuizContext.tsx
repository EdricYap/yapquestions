import React, {
    createContext,
    ReactNode,
    useContext,
    useState,
} from "react";
import { questions as defaultQuestions } from "../questions";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuestionType = "multiple" | "truefalse" | "checkbox";

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  question: string;
  choices: Record<string, string>;
  answer: string | string[];
}

interface QuizContextValue {
  questions: QuizQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  timerSeconds: number;           // 0 = disabled
  setTimerSeconds: React.Dispatch<React.SetStateAction<number>>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    defaultQuestions as QuizQuestion[]
  );
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  return (
    <QuizContext.Provider
      value={{ questions, setQuestions, timerSeconds, setTimerSeconds }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used inside <QuizProvider>");
  return ctx;
}