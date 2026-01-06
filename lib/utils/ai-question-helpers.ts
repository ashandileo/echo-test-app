/**
 * Helper functions untuk AI Question Generation dengan RAG
 */
import { GeneratedAIQuestion } from "@/lib/hooks/api/useGenerateAIQuestions";

/**
 * Format question type untuk display
 */
export function formatQuestionType(
  type: "multiple_choice" | "essay",
  questionMode?: "text" | "audio",
  answerMode?: "text" | "voice"
): string {
  if (type === "multiple_choice") {
    return questionMode === "audio"
      ? "Multiple Choice (Listening Test)"
      : "Multiple Choice";
  } else {
    return answerMode === "voice" ? "Essay (Speaking Test)" : "Essay";
  }
}

/**
 * Get badge color based on question type
 */
export function getQuestionTypeBadgeColor(
  type: "multiple_choice" | "essay"
): string {
  return type === "multiple_choice"
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
}

/**
 * Get mode badge color
 */
export function getModeBadgeColor(mode: "text" | "audio" | "voice"): string {
  switch (mode) {
    case "audio":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "voice":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

/**
 * Validate generated questions
 */
export function validateGeneratedQuestions(questions: GeneratedAIQuestion[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!questions || questions.length === 0) {
    errors.push("No questions generated");
    return { valid: false, errors };
  }

  questions.forEach((q, index) => {
    if (!q.question || q.question.trim() === "") {
      errors.push(`Question ${index + 1}: Missing question text`);
    }

    if (q.type === "multiple_choice") {
      if (!q.options || q.options.length < 2) {
        errors.push(`Question ${index + 1}: Must have at least 2 options`);
      }
      if (
        q.correct_answer === undefined ||
        q.correct_answer < 0 ||
        (q.options && q.correct_answer >= q.options.length)
      ) {
        errors.push(`Question ${index + 1}: Invalid correct answer index`);
      }
    }

    if (q.type === "essay") {
      if (!q.sample_answer && !q.rubric) {
        errors.push(`Question ${index + 1}: Missing sample answer or rubric`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Group questions by type
 */
export function groupQuestionsByType(questions: GeneratedAIQuestion[]): {
  multipleChoice: GeneratedAIQuestion[];
  essay: GeneratedAIQuestion[];
} {
  return {
    multipleChoice: questions.filter((q) => q.type === "multiple_choice"),
    essay: questions.filter((q) => q.type === "essay"),
  };
}

/**
 * Calculate statistics for generated questions
 */
export function calculateQuestionStats(questions: GeneratedAIQuestion[]): {
  total: number;
  multipleChoice: number;
  essay: number;
  listeningTests: number;
  speakingTests: number;
} {
  const grouped = groupQuestionsByType(questions);

  return {
    total: questions.length,
    multipleChoice: grouped.multipleChoice.length,
    essay: grouped.essay.length,
    listeningTests: grouped.multipleChoice.filter(
      (q) => q.question_mode === "audio"
    ).length,
    speakingTests: grouped.essay.filter((q) => q.answer_mode === "voice")
      .length,
  };
}
