export const QUIZZES = ["quizzes"];
export const QUIZ_DETAILS = (quizId: string) => ["quiz", quizId];
export const QUIZ_DOCUMENT_LEARNING = (
  quizId: string,
  documentPath: string
) => ["quiz", quizId, "learning-document", documentPath];
export const QUIZ_QUESTION_COUNT = (quizId: string) => [
  "quiz",
  quizId,
  "question-count",
];
export const QUIZ_QUESTION_MULTIPLE_CHOICE = (quizId: string) => [
  "quiz",
  quizId,
  "questions-multiple-choice",
];
export const QUIZ_QUESTION_ESSAY = (quizId: string) => [
  "quiz",
  quizId,
  "questions-essay",
];

export const QUIZ_SUBMISSION_MULTIPLE_CHOICE = (
  quizId: string,
  userId: string
) => ["quiz", quizId, "submissions-multiple-choice", userId];

export const QUIZ_SUBMISSION_ESSAY = (quizId: string, userId: string) => [
  "quiz",
  quizId,
  "submissions-essay",
  userId,
];

export const QUIZ_SUBMISSION_STATUS = (userId: string, quizId: string) => [
  "quiz-submission-status",
  userId,
  quizId,
];
