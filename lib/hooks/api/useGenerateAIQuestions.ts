import { useMutation } from "@tanstack/react-query";

export interface GenerateAIQuestionsParams {
  quizId: string;
  questionCount: number;
  questionType: "multiple_choice" | "essay" | "mixed";
  questionMode?: "text" | "audio";
  answerMode?: "text" | "voice";
  additionalInstructions?: string;
  saveToDatabase?: boolean;
}

export interface GeneratedAIQuestion {
  id: string;
  type: "multiple_choice" | "essay";
  question: string;
  question_mode?: "text" | "audio";
  answer_mode?: "text" | "voice";
  options?: string[];
  correct_answer?: number;
  explanation?: string;
  sample_answer?: string;
  rubric?: string;
}

export interface GenerateAIQuestionsResponse {
  success: boolean;
  message: string;
  data: {
    quizId: string;
    quizName: string;
    questions: GeneratedAIQuestion[];
    totalQuestions: number;
    savedToDatabase: boolean;
  };
}

/**
 * Hook untuk generate questions menggunakan AI dengan RAG
 */
export function useGenerateAIQuestions() {
  return useMutation<
    GenerateAIQuestionsResponse,
    Error,
    GenerateAIQuestionsParams
  >({
    mutationFn: async (params) => {
      const response = await fetch("/api/quiz/generate-ai-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate questions");
      }

      return response.json();
    },
  });
}
