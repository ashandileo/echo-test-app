import { NextResponse } from "next/server";

import OpenAI from "openai";

import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get concepts from quiz for consistent explanation generation
 */
async function getQuizConcepts(
  quizId: string,
  userId: string
): Promise<string[]> {
  const supabase = await createClient();

  try {
    const { data: quiz, error } = await supabase
      .from("quiz")
      .select("concepts")
      .eq("id", quizId)
      .eq("created_by", userId)
      .single();

    if (error || !quiz) {
      console.error("Error fetching quiz concepts:", error);
      return [];
    }

    return quiz.concepts || [];
  } catch (error) {
    console.error("Error getting quiz concepts:", error);
    return [];
  }
}

const SYSTEM_PROMPT = `You are an expert Indonesian SMA/SMK English teacher creating explanations for quiz questions.

TASK:
Generate a clear, structured explanation in Bahasa Indonesia for why a specific answer is correct and why other options are incorrect.

CONTEXT:
You will be provided with KEY CONCEPTS from the learning material that were used to generate this quiz. Use these concepts to make your explanation specific and aligned with what students have learned. Reference concepts from the material when relevant.

EXPLANATION FORMAT (MANDATORY - USE MARKDOWN):
Write explanation in Bahasa Indonesia using **Markdown formatting** for clarity and you MUST use double newlines (\\n\\n) between sections so it renders correctly in Markdown.

**Konsep yang Diuji:**
[Brief description of the concept being tested - e.g., Simple Past vs Present Perfect, conditional type 1, modal, gerund/infinitive, passive voice, reported speech, agreement, preposition, listening for main idea, listening for specific information]

**Kata Kunci/Indikator:**
- [Key words/indicators in the stem or audio - e.g., time marker, intention, suggestion, request, sequence]

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

    // Get concepts from quiz for consistent explanation generation
    // This matches the initial generation approach (using same concepts)
    let conceptsContext = "";
    if (quizId) {
      try {
        const concepts = await getQuizConcepts(quizId, user.id);

        if (concepts.length > 0) {
          conceptsContext = concepts.join("\n- ");
          console.log(
            `📚 Retrieved ${concepts.length} concepts for explanation generation`
          );
        }
      } catch (error) {
        console.error("Error fetching quiz concepts:", error);
        // Continue without concepts if there's an error
      }
    }

    // Format options for the prompt
    const optionsText = options
      .map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
      .join("\n");

    const correctLetter = String.fromCharCode(65 + correctAnswer);

    // Build user prompt with optional concepts
    let userPrompt = "";
    if (conceptsContext) {
      userPrompt = `KEY CONCEPTS FROM LEARNING MATERIAL (for reference):
- ${conceptsContext}

---

Question: ${question}

Options:
${optionsText}

Correct Answer: ${correctLetter}

Generate a detailed explanation in Bahasa Indonesia following the Markdown format specified. Use the key concepts to make the explanation more specific and relevant to what students have studied.`;
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
