import OpenAI from "openai";

import { createClient } from "@/lib/supabase/server";

import {
  ERROR_MESSAGES,
  SYSTEM_PROMPT_ESSAY,
  SYSTEM_PROMPT_METADATA,
  SYSTEM_PROMPT_MULTIPLE_CHOICE,
  USER_PROMPT_ESSAY,
  USER_PROMPT_MULTIPLE_CHOICE,
} from "./consts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QuizMetadata {
  title: string;
  description: string;
}

export interface MultipleChoiceQuestion {
  question_mode: "text" | "audio";
  question_text: string;
  audio_script?: string | null;
  options: string[];
  correct_answer: string;
  explanation: string;
  points: number;
}

export interface EssayQuestion {
  answer_mode: "text" | "voice";
  question_text: string;
  expected_word_count?: string;
  rubric: string;
  points: number;
}

/**
 * Generate quiz title and description from document content
 */
export async function generateQuizMetadata(
  fileName: string,
  context: string
): Promise<QuizMetadata> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_METADATA,
        },
        {
          role: "user",
          content: `Learning Material: ${fileName}\n\nContent:\n${context}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating quiz metadata:", error);
    throw new Error(ERROR_MESSAGES.OPENAI_GENERATION_FAILED);
  }
}

/**
 * Generate multiple choice questions from document content
 */
export async function generateMultipleChoiceQuestions(
  context: string,
  count: number = 10
): Promise<MultipleChoiceQuestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_MULTIPLE_CHOICE(count),
        },
        {
          role: "user",
          content: USER_PROMPT_MULTIPLE_CHOICE(count, context),
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsed = JSON.parse(content);
    const questions = parsed.questions || [];

    // Ensure all questions have points field
    const validatedQuestions = questions.map((q: MultipleChoiceQuestion) => ({
      ...q,
      points: q.points ?? 1, // Ensure points is always set
    }));

    return validatedQuestions;
  } catch (error) {
    console.error("Error generating multiple choice questions:", error);
    throw new Error(ERROR_MESSAGES.OPENAI_GENERATION_FAILED);
  }
}

/**
 * Generate essay questions from document content
 */
export async function generateEssayQuestions(
  context: string,
  count: number = 5
): Promise<EssayQuestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_ESSAY(count),
        },
        {
          role: "user",
          content: USER_PROMPT_ESSAY(count, context),
        },
      ],
      temperature: 0.5,
      top_p: 0.9,
      presence_penalty: 0.3,
      frequency_penalty: 0.2,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsed = JSON.parse(content);
    const questions = parsed.questions || [];

    // Ensure all questions have points field
    const validatedQuestions = questions.map((q: EssayQuestion) => ({
      ...q,
      points: q.points ?? 5, // Ensure points is always set
    }));

    return validatedQuestions;
  } catch (error) {
    console.error("Error generating essay questions:", error);
    throw new Error(ERROR_MESSAGES.OPENAI_GENERATION_FAILED);
  }
}

/**
 * Get document chunks for context
 * Gets ALL chunks from the document to provide complete context for AI generation
 */
export async function getDocumentContext(
  filePath: string,
  userId: string
): Promise<{ fileName: string; context: string }> {
  const supabase = await createClient();

  // Get ALL chunks from the document (no limit)
  const { data: chunks, error } = await supabase
    .from("document_learnings")
    .select("file_name, chunk_text")
    .eq("file_path", filePath)
    .eq("user_id", userId)
    .order("chunk_index", { ascending: true });

  if (error || !chunks || chunks.length === 0) {
    throw new Error(ERROR_MESSAGES.DOCUMENT_NOT_FOUND);
  }

  const context = chunks.map((c) => c.chunk_text).join("\n\n");
  const fileName = chunks[0].file_name;

  return { fileName, context };
}

/**
 * Create quiz in database
 */
export async function createQuiz(
  userId: string,
  title: string,
  description: string,
  sourceDocumentPath: string
) {
  const supabase = await createClient();

  const { data: quiz, error } = await supabase
    .from("quiz")
    .insert({
      name: title,
      description: description,
      source_document_path: sourceDocumentPath,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating quiz:", error);
    throw new Error(ERROR_MESSAGES.QUIZ_CREATION_FAILED);
  }

  return quiz;
}

/**
 * Save multiple choice questions to database
 */
export async function saveMultipleChoiceQuestions(
  quizId: string,
  questions: MultipleChoiceQuestion[]
) {
  const supabase = await createClient();

  const questionsToInsert = questions.map((q, index) => ({
    quiz_id: quizId,
    question_mode: q.question_mode || "text",
    question_text: q.question_text,
    audio_script: q.audio_script || null,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    points: q.points ?? 1,
    order_number: index + 1, // Add order number starting from 1
  }));

  const { error } = await supabase
    .from("quiz_question_multiple_choice")
    .insert(questionsToInsert);

  if (error) {
    console.error("Error saving multiple choice questions:", error);
    throw new Error("Failed to save multiple choice questions");
  }
}

/**
 * Save essay questions to database
 */
export async function saveEssayQuestions(
  quizId: string,
  questions: EssayQuestion[]
) {
  const supabase = await createClient();

  const questionsToInsert = questions.map((q, index) => ({
    quiz_id: quizId,
    answer_mode: q.answer_mode || "text",
    question_text: q.question_text,
    rubric: q.rubric,
    points: q.points ?? 5,
    order_number: index + 1, // Add order number starting from 1
  }));

  const { error } = await supabase
    .from("quiz_question_essay")
    .insert(questionsToInsert);

  if (error) {
    console.error("Error saving essay questions:", error);
    throw new Error("Failed to save essay questions");
  }
}
