import OpenAI from "openai";

import { createClient } from "@/lib/supabase/server";

import {
  ERROR_MESSAGES,
  SYSTEM_PROMPT_ESSAY,
  SYSTEM_PROMPT_METADATA,
  SYSTEM_PROMPT_MULTIPLE_CHOICE,
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
 * Generate quiz title and description from extracted concepts
 * Uses the same concepts that will be used for question generation
 */
export async function generateQuizMetadata(
  fileName: string,
  concepts: string[]
): Promise<QuizMetadata> {
  try {
    console.log(
      `📝 Generating quiz metadata from ${concepts.length} concepts...`
    );

    const conceptsSummary = concepts.join("\n- ");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_METADATA,
        },
        {
          role: "user",
          content: `Learning Material: ${fileName}\n\nKey Concepts:\n- ${conceptsSummary}\n\nGenerate a catchy title and informative description for this quiz.`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const metadata = JSON.parse(content);
    console.log(`✅ Metadata generated: "${metadata.title}"`);

    return metadata;
  } catch (error) {
    console.error("Error generating quiz metadata:", error);
    throw new Error(ERROR_MESSAGES.OPENAI_GENERATION_FAILED);
  }
}

/**
 * Split text into chunks of approximately equal size
 */
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (
      currentChunk.length + paragraph.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Extract key concepts from a batch of chunks (MAP phase)
 */
async function extractConceptsFromBatch(
  chunks: string[],
  batchNumber: number
): Promise<string[]> {
  const combinedText = chunks.join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert at analyzing English learning materials for SMA/SMK students.
Extract 5-8 KEY CONCEPTS from the provided text that are suitable for quiz questions.

Focus on:
- Grammar patterns (tenses, modals, passive voice, etc.)
- Text types and their purposes (procedure, narrative, exposition, etc.)
- Language functions (expressing opinions, making suggestions, etc.)
- Vocabulary in context
- Reading comprehension points
- Listening scenarios (dialogues, announcements, conversations)

Return ONLY a JSON array of concept strings:
{"concepts": ["concept 1", "concept 2", ...]}`,
      },
      {
        role: "user",
        content: `Extract key concepts from this learning material (Batch ${batchNumber}):\n\n${combinedText}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
    max_tokens: 1000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    return [];
  }

  const parsed = JSON.parse(content);
  return parsed.concepts || [];
}

/**
 * Extract all concepts from document context (MAP phase)
 * This is called ONCE and the result is shared between MC and Essay generation
 * ALWAYS extracts concepts for efficient AI processing
 */
export async function extractConceptsFromDocument(
  context: string
): Promise<string[]> {
  // MAP PHASE: Extract concepts from batches
  const chunks = splitIntoChunks(context, 2000); // ~500 tokens per chunk
  const BATCH_SIZE = 5;
  const allConcepts: string[] = [];

  console.log(
    `🔍 MAP PHASE: Processing ${chunks.length} chunks in batches of ${BATCH_SIZE}...`
  );

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    console.log(`  📦 Batch ${batchNumber}: Extracting concepts...`);
    const concepts = await extractConceptsFromBatch(batch, batchNumber);
    allConcepts.push(...concepts);
  }

  console.log(
    `✅ MAP PHASE Complete: Extracted ${allConcepts.length} total concepts`
  );

  return allConcepts;
}

/**
 * Generate multiple choice questions from extracted concepts
 * ALWAYS uses concept-based generation (REDUCE phase)
 */
export async function generateMultipleChoiceQuestions(
  concepts: string[],
  count: number = 10
): Promise<MultipleChoiceQuestion[]> {
  try {
    console.log(
      `🎯 REDUCE PHASE: Generating ${count} MC questions from ${concepts.length} concepts...`
    );
    const conceptsSummary = concepts.join("\n- ");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_MULTIPLE_CHOICE(count),
        },
        {
          role: "user",
          content: `Based on these key concepts from the learning material, create ${count} original multiple-choice questions:\n\n- ${conceptsSummary}\n\nRemember: DO NOT copy from any source material. Create completely original questions that test these concepts.`,
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

    console.log("MC Content", content);

    const parsed = JSON.parse(content);
    const questions = parsed.questions || [];

    // Ensure all questions have points field
    const validatedQuestions = questions.map((q: MultipleChoiceQuestion) => ({
      ...q,
      points: q.points ?? 1,
    }));

    console.log(`✅ Generated ${validatedQuestions.length} MC questions`);
    return validatedQuestions;
  } catch (error) {
    console.error("Error generating multiple choice questions:", error);
    throw new Error(ERROR_MESSAGES.OPENAI_GENERATION_FAILED);
  }
}

/**
 * Generate essay questions from extracted concepts
 * ALWAYS uses concept-based generation (REDUCE phase)
 */
export async function generateEssayQuestions(
  concepts: string[],
  count: number = 5
): Promise<EssayQuestion[]> {
  try {
    console.log(
      `🎯 REDUCE PHASE: Generating ${count} Essay questions from ${concepts.length} concepts...`
    );
    const conceptsSummary = concepts.join("\n- ");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_ESSAY(count),
        },
        {
          role: "user",
          content: `Based on these key concepts from the learning material, create ${count} original essay questions:\n\n- ${conceptsSummary}\n\nRemember: DO NOT copy from any source material. Create completely original questions that test these concepts.`,
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
      points: q.points ?? 5,
    }));

    console.log(`✅ Generated ${validatedQuestions.length} Essay questions`);
    return validatedQuestions;
  } catch (error) {
    console.error("Error generating essay questions:", error);
    throw new Error(ERROR_MESSAGES.OPENAI_GENERATION_FAILED);
  }
}

/**
 * Get document chunks for context
 * Gets ALL chunks from the document ordered by chunk_index
 * For large documents, this will be processed in batches during question generation
 */
export async function getDocumentContext(
  filePath: string,
  userId: string
): Promise<{ fileName: string; context: string; totalChunks: number }> {
  const supabase = await createClient();

  // Get ALL chunks from the document (no limit) ordered by chunk_index
  const { data: chunks, error } = await supabase
    .from("document_learnings")
    .select("file_name, chunk_text, chunk_index, total_chunks")
    .eq("file_path", filePath)
    .eq("user_id", userId)
    .order("chunk_index", { ascending: true });

  if (error || !chunks || chunks.length === 0) {
    throw new Error(ERROR_MESSAGES.DOCUMENT_NOT_FOUND);
  }

  const context = chunks.map((c) => c.chunk_text).join("\n\n");
  const fileName = chunks[0].file_name;
  const totalChunks = chunks[0].total_chunks;

  console.log(`Retrieved ${chunks.length} chunks from document: ${fileName}`);

  return { fileName, context, totalChunks };
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
