import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "./consts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QuizMetadata {
  title: string;
  description: string;
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
          content: `You are a quiz title and description generator. Based on the document content, generate a catchy quiz title and engaging description.
Return JSON format:
{
  "title": "string (max 100 chars, engaging and descriptive)",
  "description": "string (max 300 chars, what students will learn from this quiz)"
}`,
        },
        {
          role: "user",
          content: `Document name: ${fileName}\n\nContent preview:\n${context}`,
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
 * Get document chunks for context
 */
export async function getDocumentContext(
  filePath: string,
  userId: string,
  limit: number = 3
): Promise<{ fileName: string; context: string }> {
  const supabase = await createClient();

  // Get first few chunks
  const { data: chunks, error } = await supabase
    .from("document_learnings")
    .select("file_name, chunk_text")
    .eq("file_path", filePath)
    .eq("user_id", userId)
    .order("chunk_index", { ascending: true })
    .limit(limit);

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
      questions: [], // Empty array initially
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating quiz:", error);
    throw new Error(ERROR_MESSAGES.QUIZ_CREATION_FAILED);
  }

  return quiz;
}
