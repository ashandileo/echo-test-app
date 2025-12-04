export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized. Please login.",
  MISSING_QUIZ_ID: "Quiz ID is required",
  QUIZ_NOT_FOUND: "Quiz not found",
  DOCUMENT_NOT_FOUND: "Document chunks not found",
  OPENAI_GENERATION_FAILED: "Failed to generate questions from OpenAI",
  QUIZ_UPDATE_FAILED: "Failed to update quiz with questions",
} as const;

export const DEFAULT_NUM_QUESTIONS = 10;
export const DEFAULT_DIFFICULTY = "medium";
export const MAX_CONTEXT_LENGTH = 15000; // ~4000 tokens
