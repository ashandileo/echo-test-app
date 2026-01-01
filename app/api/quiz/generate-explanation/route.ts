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

    console.log("context", context);

    return context;
  } catch (error) {
    console.error("Error getting relevant context:", error);
    return "";
  }
}

const SYSTEM_PROMPT = `You are an expert Indonesian SMA/SMK English teacher creating explanations for quiz questions.

TASK:
Generate a clear, structured explanation in Bahasa Indonesia for why a specific answer is correct and why other options are incorrect.

CONTEXT:
You will be provided with relevant excerpts from the learning material. Use this context to make your explanation more specific and aligned with what students have learned. Reference concepts from the material when relevant.

EXPLANATION FORMAT (MANDATORY - USE MARKDOWN):
Write explanation in Bahasa Indonesia using **Markdown formatting** for clarity:

**Konsep yang Diuji:**
[Brief description of the concept being tested - relate to the learning material when applicable]

**Kata Kunci/Indikator:**
- [Key words/indicators in the stem - e.g., time marker, intention, suggestion, request, sequence]

**Rumus/Pola:**
[Grammar pattern if applicable - wrap formulas in backticks for code formatting]

**Pembahasan:**
- **Jawaban Benar (Opsi [LETTER]):** [Why this option is correct, with reference to concepts from the material]
- **Pengecoh A/B/C/D:** [Why wrong - brief but clear explanation of why this option is incorrect]

**Jawaban: [LETTER]** (where LETTER = A/B/C/D)

STYLE:
- Professional but friendly (English Club vibe)
- Clear and concise
- Use proper Markdown formatting for readability
- Reference learning material concepts when relevant
- Target audience: SMA/SMK students (ages 15-18)

OUTPUT:
Return ONLY the explanation text in Markdown format, no JSON wrapper.`;

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
    const { question, options, correctAnswer, quizId } = body;

    // Validate input
    if (
      !question ||
      !options ||
      !Array.isArray(options) ||
      options.length !== 4
    ) {
      return NextResponse.json(
        { error: "Invalid input. Question and 4 options are required." },
        { status: 400 }
      );
    }

    if (correctAnswer === undefined || correctAnswer < 0 || correctAnswer > 3) {
      return NextResponse.json(
        { error: "Invalid correctAnswer. Must be 0-3." },
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

    // Format options for the prompt
    const optionsText = options
      .map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
      .join("\n");

    const correctLetter = String.fromCharCode(65 + correctAnswer);

    // Build user prompt with optional context
    let userPrompt = "";
    if (context) {
      userPrompt = `LEARNING MATERIAL CONTEXT (for reference):
${context}

---

Question: ${question}

Options:
${optionsText}

Correct Answer: ${correctLetter}

Generate a detailed explanation in Bahasa Indonesia following the Markdown format specified. Use the learning material context to make the explanation more specific and relevant to what students have studied.`;
    } else {
      userPrompt = `Question: ${question}

Options:
${optionsText}

Correct Answer: ${correctLetter}

Generate a detailed explanation in Bahasa Indonesia following the Markdown format specified.`;
    }

    // Generate explanation using OpenAI
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
      max_tokens: 500,
    });

    const explanation = response.choices[0].message.content;

    if (!explanation) {
      throw new Error("No explanation generated from OpenAI");
    }

    return NextResponse.json({
      success: true,
      explanation: explanation.trim(),
    });
  } catch (error) {
    console.error("Error generating explanation:", error);
    return NextResponse.json(
      {
        error: "Failed to generate explanation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
