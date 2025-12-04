import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES, MAX_CONTEXT_LENGTH } from "./consts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GenerateQuestionsResponse {
  questions: QuizQuestion[];
}

/**
 * Get quiz by ID
 */
export async function getQuiz(quizId: string, userId: string) {
  const supabase = await createClient();

  const { data: quiz, error } = await supabase
    .from("quiz")
    .select("*")
    .eq("id", quizId)
    .eq("created_by", userId)
    .single();

  if (error || !quiz) {
    throw new Error(ERROR_MESSAGES.QUIZ_NOT_FOUND);
  }

  return quiz;
}

/**
 * Get document chunks for quiz
 */
export async function getDocumentChunks(
  sourceDocumentPath: string,
  userId: string
) {
  const supabase = await createClient();

  const { data: chunks, error } = await supabase
    .from("document_learnings")
    .select("chunk_text")
    .eq("file_path", sourceDocumentPath)
    .eq("user_id", userId)
    .order("chunk_index", { ascending: true });

  if (error || !chunks || chunks.length === 0) {
    throw new Error(ERROR_MESSAGES.DOCUMENT_NOT_FOUND);
  }

  return chunks;
}

/**
 * Generate questions using OpenAI
 */
export async function generateQuestions(
  quizTitle: string,
  context: string,
  numQuestions: number,
  difficulty: string
): Promise<QuizQuestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a quiz question generator. Generate ${numQuestions} multiple choice questions at ${difficulty} difficulty level.

Each question should have:
- A clear, specific question
- 4 answer options (A, B, C, D)
- One correct answer (index 0-3)
- A brief explanation of why the answer is correct

Return JSON format:
{
  "questions": [{
    "question": "string",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": 0,
    "explanation": "string"
  }]
}`,
        },
        {
          role: "user",
          content: `Quiz Title: ${quizTitle}\n\nDocument Content:\n${context}\n\nGenerate ${numQuestions} ${difficulty} difficulty questions based on this content.`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const data = JSON.parse(content) as GenerateQuestionsResponse;
    return data.questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error(ERROR_MESSAGES.OPENAI_GENERATION_FAILED);
  }
}

/**
 * Update quiz with generated questions
 */
export async function updateQuizQuestions(
  quizId: string,
  questions: QuizQuestion[]
) {
  const supabase = await createClient();

  const { data: updatedQuiz, error } = await supabase
    .from("quiz")
    .update({
      questions: questions,
    })
    .eq("id", quizId)
    .select()
    .single();

  if (error) {
    console.error("Error updating quiz:", error);
    throw new Error(ERROR_MESSAGES.QUIZ_UPDATE_FAILED);
  }

  return updatedQuiz;
}

/**
 * Prepare context from chunks (limit size)
 */
export function prepareContext(chunks: { chunk_text: string }[]): string {
  const fullContext = chunks.map((c) => c.chunk_text).join("\n\n");
  return fullContext.slice(0, MAX_CONTEXT_LENGTH);
}
