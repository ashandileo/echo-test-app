import crypto from "crypto";
import OpenAI from "openai";

import { createClient } from "@/lib/supabase/server";

import {
  ERROR_MESSAGES,
  MAX_CONTEXT_LENGTH,
  RAG_MATCH_COUNT,
  SIMILARITY_THRESHOLD,
  SYSTEM_PROMPT_ESSAY,
  SYSTEM_PROMPT_MULTIPLE_CHOICE,
} from "./consts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types - Match create-from-document format
export interface GeneratedMultipleChoiceQuestion {
  id: string;
  type: "multiple_choice";
  question_mode: "text" | "audio";
  question_text: string;
  audio_script?: string | null;
  options: string[];
  correct_answer: string; // "0", "1", "2", "3"
  explanation: string;
  points: number;
}

export interface GeneratedEssayQuestion {
  id: string;
  type: "essay";
  answer_mode: "text" | "voice";
  question_text: string;
  expected_word_count?: string;
  rubric: string;
  points: number;
}

export type GeneratedQuestion =
  | GeneratedMultipleChoiceQuestion
  | GeneratedEssayQuestion;

export interface RelevantChunk {
  chunk_text: string;
  file_name: string;
  similarity: number;
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
 * Create embedding using OpenAI
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 1536,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw new Error(ERROR_MESSAGES.EMBEDDING_FAILED);
  }
}

/**
 * Get relevant context using RAG (vector similarity search)
 */
export async function getRelevantContext(
  queryEmbedding: number[],
  userId: string,
  sourceDocumentPath: string
): Promise<RelevantChunk[]> {
  const supabase = await createClient();

  try {
    // Use the vector search function
    const { data, error } = await supabase.rpc("search_document_chunks", {
      query_embedding: queryEmbedding,
      match_user_id: userId,
      match_count: RAG_MATCH_COUNT,
    });

    if (error) {
      console.error("Error searching similar chunks:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }

    if (!data || data.length === 0) {
      throw new Error(ERROR_MESSAGES.DOCUMENT_NOT_FOUND);
    }

    // Filter by document path and similarity threshold
    const relevantChunks = data
      .filter(
        (chunk: {
          file_path: string;
          similarity: number;
          chunk_text: string;
          file_name: string;
        }) =>
          chunk.file_path === sourceDocumentPath &&
          chunk.similarity >= SIMILARITY_THRESHOLD
      )
      .map(
        (chunk: {
          chunk_text: string;
          file_name: string;
          similarity: number;
        }) => ({
          chunk_text: chunk.chunk_text,
          file_name: chunk.file_name,
          similarity: chunk.similarity,
        })
      );

    if (relevantChunks.length === 0) {
      // If no chunks meet threshold, fall back to all chunks from the document
      const { data: allChunks, error: chunksError } = await supabase
        .from("document_learnings")
        .select("chunk_text, file_name")
        .eq("file_path", sourceDocumentPath)
        .eq("user_id", userId)
        .order("chunk_index", { ascending: true })
        .limit(RAG_MATCH_COUNT);

      if (chunksError || !allChunks || allChunks.length === 0) {
        throw new Error(ERROR_MESSAGES.DOCUMENT_NOT_FOUND);
      }

      return allChunks.map((chunk) => ({
        chunk_text: chunk.chunk_text,
        file_name: chunk.file_name,
        similarity: 0,
      }));
    }

    return relevantChunks;
  } catch (error) {
    console.error("Error getting relevant context:", error);
    throw error;
  }
}

/**
 * Prepare context from relevant chunks
 */
export function prepareContext(chunks: RelevantChunk[]): string {
  const contextParts = chunks.map(
    (chunk, idx) =>
      `[Relevant Section ${idx + 1} - Similarity: ${(chunk.similarity * 100).toFixed(1)}%]\n${chunk.chunk_text}`
  );

  const fullContext = contextParts.join("\n\n---\n\n");

  // Truncate if too long
  return fullContext.slice(0, MAX_CONTEXT_LENGTH);
}

/**
 * Generate questions using RAG
 */
export async function generateQuestionsWithRAG(
  quizTitle: string,
  relevantChunks: RelevantChunk[],
  questionCount: number,
  questionType: "multiple_choice" | "essay",
  additionalInstructions: string,
  questionMode?: "text" | "audio", // For multiple_choice: force all text or all audio
  answerMode?: "text" | "voice" // For essay: force all text or all voice
): Promise<GeneratedQuestion[]> {
  try {
    const context = prepareContext(relevantChunks);

    // Use the same prompts as create-from-document
    const systemPrompt =
      questionType === "multiple_choice"
        ? SYSTEM_PROMPT_MULTIPLE_CHOICE(questionCount)
        : SYSTEM_PROMPT_ESSAY(questionCount);

    // Build user prompt with context and additional instructions
    let userPrompt = `Use the learning material ONLY to infer topics/skills. Do NOT copy any text from it.

Quiz Title: ${quizTitle}

${additionalInstructions ? `Additional Instructions: ${additionalInstructions}\n\n` : ""}

MATERIAL (REFERENCE ONLY):
${context}

Create exactly ${questionCount} original ${questionType === "multiple_choice" ? "multiple-choice" : "essay"} questions for SMA/SMK English (A2–B1).`;

    if (questionType === "multiple_choice") {
      // Handle questionMode parameter
      if (questionMode === "audio") {
        userPrompt += `
- ALL questions must be LISTENING questions (question_mode="audio" with audio_script)
- Questions, options, and audio scripts in English
- Explanations in Bahasa Indonesia`;
      } else if (questionMode === "text") {
        userPrompt += `
- ALL questions must be TEXT questions (question_mode="text" with audio_script=null)
- Questions and options in English
- Explanations in Bahasa Indonesia`;
      } else {
        // Default: mixed mode (50-50)
        userPrompt += `
- Mix of TEXT questions FIRST, then LISTENING questions (with audio_script)
- Questions, options, and audio scripts in English
- Explanations in Bahasa Indonesia`;
      }
    } else {
      // Handle answerMode parameter
      if (answerMode === "voice") {
        userPrompt += `
- ALL questions must be SPEAKING questions (answer_mode="voice" with time-based word count)
- Prompts in English
- Rubric/pembahasan in Bahasa Indonesia with English sample answer`;
      } else if (answerMode === "text") {
        userPrompt += `
- ALL questions must be TEXT questions (answer_mode="text" with written word count)
- Prompts in English
- Rubric/pembahasan in Bahasa Indonesia with English sample answer`;
      } else {
        // Default: mixed mode (50-50)
        userPrompt += `
- Mix of TEXT questions FIRST (written essays), then SPEAKING questions (voice recordings)
- Prompts in English
- Rubric/pembahasan in Bahasa Indonesia with English sample answer`;
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: questionType === "multiple_choice" ? 0.3 : 0.5,
      response_format: { type: "json_object" as const },
      max_tokens: 4096,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error(ERROR_MESSAGES.INVALID_QUESTION_DATA);
    }

    const data = JSON.parse(content);

    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error(ERROR_MESSAGES.INVALID_QUESTION_DATA);
    }

    // Transform to our format with IDs
    const questions: GeneratedQuestion[] = data.questions.map(
      (
        q:
          | {
              question_mode: "text" | "audio";
              question_text: string;
              audio_script?: string | null;
              options: string[];
              correct_answer: string;
              explanation: string;
              points: number;
            }
          | {
              answer_mode: "text" | "voice";
              question_text: string;
              expected_word_count?: string;
              rubric: string;
              points: number;
            }
      ): GeneratedQuestion => {
        const id = crypto.randomUUID();

        if (questionType === "multiple_choice") {
          const mcQ = q as {
            question_mode: "text" | "audio";
            question_text: string;
            audio_script?: string | null;
            options: string[];
            correct_answer: string;
            explanation: string;
            points: number;
          };

          return {
            id,
            type: "multiple_choice",
            question_mode: mcQ.question_mode,
            question_text: mcQ.question_text,
            audio_script: mcQ.audio_script || null,
            options: mcQ.options,
            correct_answer: mcQ.correct_answer,
            explanation: mcQ.explanation,
            points: mcQ.points ?? 1,
          } as GeneratedMultipleChoiceQuestion;
        } else {
          const essayQ = q as {
            answer_mode: "text" | "voice";
            question_text: string;
            expected_word_count?: string;
            rubric: string;
            points: number;
          };

          return {
            id,
            type: "essay",
            answer_mode: essayQ.answer_mode,
            question_text: essayQ.question_text,
            expected_word_count: essayQ.expected_word_count,
            rubric: essayQ.rubric,
            points: essayQ.points ?? 5,
          } as GeneratedEssayQuestion;
        }
      }
    );

    return questions;
  } catch (error) {
    console.error("Error generating questions with RAG:", error);
    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }
}

/**
 * Generate mixed questions (both MC and Essay)
 */
export async function generateMixedQuestions(
  quizTitle: string,
  relevantChunks: RelevantChunk[],
  totalQuestionCount: number,
  additionalInstructions: string
): Promise<GeneratedQuestion[]> {
  // Split roughly 60% MC, 40% Essay
  const mcCount = Math.ceil(totalQuestionCount * 0.6);
  const essayCount = totalQuestionCount - mcCount;

  const [mcQuestions, essayQuestions] = await Promise.all([
    generateQuestionsWithRAG(
      quizTitle,
      relevantChunks,
      mcCount,
      "multiple_choice",
      additionalInstructions
    ),
    generateQuestionsWithRAG(
      quizTitle,
      relevantChunks,
      essayCount,
      "essay",
      additionalInstructions
    ),
  ]);

  // Interleave questions for variety
  const mixed: GeneratedQuestion[] = [];
  const maxLength = Math.max(mcQuestions.length, essayQuestions.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < mcQuestions.length) mixed.push(mcQuestions[i]);
    if (i < essayQuestions.length) mixed.push(essayQuestions[i]);
  }

  return mixed;
}

/**
 * Save generated questions to database
 */
export async function saveGeneratedQuestions(
  quizId: string,
  questions: GeneratedQuestion[]
) {
  const supabase = await createClient();

  // Separate questions by type
  const mcQuestions = questions.filter((q) => q.type === "multiple_choice");
  const essayQuestions = questions.filter((q) => q.type === "essay");

  // Get max order_number to determine starting point for new questions
  // Using MAX instead of COUNT to handle cases where questions were deleted
  const { data: mcMaxData } = await supabase
    .from("quiz_question_multiple_choice")
    .select("order_number")
    .eq("quiz_id", quizId)
    .order("order_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: essayMaxData } = await supabase
    .from("quiz_question_essay")
    .select("order_number")
    .eq("quiz_id", quizId)
    .order("order_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastMcOrderNumber = mcMaxData?.order_number || 0;
  const lastEssayOrderNumber = essayMaxData?.order_number || 0;

  const savedQuestions: Array<Record<string, unknown>> = [];

  // Batch insert multiple choice questions
  if (mcQuestions.length > 0) {
    const { data, error } = await supabase
      .from("quiz_question_multiple_choice")
      .insert(
        mcQuestions.map((q, index) => ({
          quiz_id: quizId,
          question_text: q.question_text,
          question_mode: q.question_mode,
          audio_script: q.audio_script || null,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          points: q.points,
          order_number: lastMcOrderNumber + index + 1, // Continue from last order_number
        }))
      )
      .select();

    if (error) {
      console.error("Error saving MC questions:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }

    if (data) savedQuestions.push(...data);
  }

  // Batch insert essay questions
  if (essayQuestions.length > 0) {
    const { data, error } = await supabase
      .from("quiz_question_essay")
      .insert(
        essayQuestions.map((q, index) => ({
          quiz_id: quizId,
          question_text: q.question_text,
          answer_mode: q.answer_mode,
          rubric: q.rubric,
          points: q.points,
          order_number: lastEssayOrderNumber + index + 1, // Continue from last order_number
        }))
      )
      .select();

    if (error) {
      console.error("Error saving essay questions:", error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }

    if (data) savedQuestions.push(...data);
  }

  return savedQuestions;
}
