import { NextResponse } from "next/server";

import OpenAI from "openai";

import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get relevant document chunks using semantic search
 */
async function getRelevantContext(
  question: string,
  userId: string,
  sourceDocumentPath: string | null,
  limit: number = 5
): Promise<string> {
  if (!sourceDocumentPath) {
    return "";
  }

  const supabase = await createClient();

  try {
    // Generate embedding for the question
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search for relevant chunks using vector similarity
    const { data: chunks, error } = await supabase.rpc(
      "search_document_chunks",
      {
        query_embedding: queryEmbedding,
        match_user_id: userId,
        match_count: limit,
      }
    );

    if (error) {
      console.error("Error searching document chunks:", error);
      return "";
    }

    if (!chunks || chunks.length === 0) {
      return "";
    }

    // Filter chunks to only those from the source document
    const relevantChunks = chunks.filter(
      (chunk: { file_path: string }) => chunk.file_path === sourceDocumentPath
    );

    if (relevantChunks.length === 0) {
      return "";
    }

    // Combine relevant chunks into context
    const context = relevantChunks
      .map((chunk: { chunk_text: string }) => chunk.chunk_text)
      .join("\n\n");

    return context;
  } catch (error) {
    console.error("Error getting relevant context:", error);
    return "";
  }
}

const SYSTEM_PROMPT = `You are an expert Indonesian SMA/SMK English teacher creating rubrics for essay questions.

TASK:
Generate a comprehensive rubric/answer key in Bahasa Indonesia for an essay question.

CONTEXT:
You will be provided with relevant excerpts from the learning material. Use this context to make your rubric more specific and aligned with what students have learned. Tailor the expected content and sample answer to reflect the material studied.

RUBRIC FORMAT (MANDATORY - USE MARKDOWN):
Write rubric in Bahasa Indonesia using **Markdown formatting** for clarity:

**Konsep yang Diuji:**
[Brief explanation of the concept/skill being tested - relate to the learning material when applicable]

**Target Struktur/Kata Kunci:**
- [Grammar pattern / functional phrases expected - reference the material]
- [Wrap patterns in backticks for code formatting, e.g., Subject + will + verb]

**Outline Jawaban Ideal:**
1. [Point 1 - what should be included, aligned with material]
2. [Point 2]
3. [Point 3]
4. [Point 4 - if needed]
5. [Point 5 - if needed]

**Contoh Jawaban (ENGLISH):**
[100-160 words original sample answer that fits the prompt at A2-B1 level, incorporating concepts from the learning material]

**Skema Penilaian (5 poin):**
- **Isi & relevansi** (2 poin) - Content addresses the prompt completely
- **Ketepatan konsep/struktur** (1 poin) - Correct use of target grammar/structure
- **Tata bahasa & kejelasan** (1 poin) - Grammar accuracy and clarity
- **Kosakata & koherensi** (1 poin) - Vocabulary range and coherence

**Catatan:**
- Level: A2–B1 (SMA/SMK Indonesia)
- Expected word count: 100-180 words

STYLE:
- Professional but friendly (English Club vibe)
- Clear and actionable
- Use proper Markdown formatting for readability
- Reference learning material concepts when relevant
- Target audience: SMA/SMK students (ages 15-18)

OUTPUT:
Return ONLY the rubric text in Markdown format, no JSON wrapper.`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { question, quizId } = body;

    // Validate input
    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Invalid input. Question is required." },
        { status: 400 }
      );
    }

    // Get relevant context from learning document if quizId is provided
    let context = "";
    if (quizId) {
      try {
        // Fetch quiz to get source_document_path
        const { data: quiz, error: quizError } = await supabase
          .from("quiz")
          .select("source_document_path")
          .eq("id", quizId)
          .single();

        if (!quizError && quiz?.source_document_path) {
          // Get relevant chunks using semantic search
          context = await getRelevantContext(
            question,
            user.id,
            quiz.source_document_path,
            5 // Get top 5 relevant chunks
          );
        }
      } catch (error) {
        console.error("Error fetching quiz context:", error);
        // Continue without context if there's an error
      }
    }

    // Build user prompt with optional context
    let userPrompt = "";
    if (context) {
      userPrompt = `LEARNING MATERIAL CONTEXT (for reference):
${context}

---

Essay Question/Prompt: ${question}

Generate a comprehensive rubric and sample answer in Bahasa Indonesia following the Markdown format specified. Use the learning material context to make the rubric and sample answer more specific and relevant to what students have studied.`;
    } else {
      userPrompt = `Essay Question/Prompt: ${question}

Generate a comprehensive rubric and sample answer in Bahasa Indonesia following the Markdown format specified.`;
    }

    // Generate rubric using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const rubric = response.choices[0].message.content;

    if (!rubric) {
      throw new Error("No rubric generated from OpenAI");
    }

    return NextResponse.json({
      success: true,
      rubric: rubric.trim(),
    });
  } catch (error) {
    console.error("Error generating rubric:", error);
    return NextResponse.json(
      {
        error: "Failed to generate rubric",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
