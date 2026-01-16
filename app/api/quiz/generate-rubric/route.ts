import { NextResponse } from "next/server";

import OpenAI from "openai";

import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get concepts from quiz for consistent rubric generation
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

const SYSTEM_PROMPT = `You are an expert Indonesian SMA/SMK English teacher creating rubrics for essay questions.

TASK:
Generate a comprehensive rubric/answer key in Bahasa Indonesia for an essay question.

CONTEXT:
You will be provided with KEY CONCEPTS from the learning material that were used to generate this quiz. Use these concepts to make your rubric specific and aligned with what students have learned. Tailor the expected content and sample answer to reflect the material studied.

RUBRIC FORMAT (MANDATORY - USE MARKDOWN):
Write rubric in Bahasa Indonesia using **Markdown formatting** for clarity and you MUST use double newlines (\\n\\n) between sections so it renders correctly in Markdown.

**Konsep yang Diuji:**
[Brief explanation of the concept/skill being tested - relate to the learning material when applicable]

**Target Struktur/Kata Kunci:**
- [Grammar pattern / functional phrases expected - reference the material]
- [Wrap patterns in backticks for code formatting, e.g., \`Subject + will + verb\`]

**Outline Jawaban Ideal:**
1. [Point 1 - what should be included, aligned with material]
2. [Point 2]
3. [Point 3]
4. [Point 4 - if needed]
5. [Point 5 - if needed]

**Contoh Jawaban (ENGLISH):**
[For TEXT mode: 100-160 words written sample answer]
[For VOICE mode: transcript of what student might say, 80-120 words]

**Skema Penilaian (5 poin):**

For TEXT mode:
- **Isi & relevansi** (2 poin) - Content addresses the prompt completely
- **Ketepatan konsep/struktur** (1 poin) - Correct use of target grammar/structure
- **Tata bahasa & kejelasan** (1 poin) - Grammar accuracy and clarity
- **Kosakata & koherensi** (1 poin) - Vocabulary range and coherence

For VOICE mode:
- **Isi & relevansi** (2 poin) - Content addresses the prompt completely
- **Pronunciation & fluency** (1 poin) - Clear pronunciation and natural flow
- **Tata bahasa & struktur** (1 poin) - Grammar accuracy
- **Kosakata & koherensi** (1 poin) - Vocabulary range and coherent ideas

**Catatan:**
- Contoh jawaban WAJIB original dan tidak boleh mengambil kalimat dari material
- Level: A2–B1 (SMA/SMK Indonesia)
- Expected word count: 100-180 words (TEXT) or 60-120 seconds (VOICE)

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

    // Get concepts from quiz for consistent rubric generation
    // This matches the initial generation approach (using same concepts)
    let conceptsContext = "";
    if (quizId) {
      try {
        const concepts = await getQuizConcepts(quizId, user.id);

        if (concepts.length > 0) {
          conceptsContext = concepts.join("\n- ");
          console.log(
            `📚 Retrieved ${concepts.length} concepts for rubric generation`
          );
        }
      } catch (error) {
        console.error("Error fetching quiz concepts:", error);
        // Continue without concepts if there's an error
      }
    }

    // Build user prompt with optional concepts
    let userPrompt = "";
    if (conceptsContext) {
      userPrompt = `KEY CONCEPTS FROM LEARNING MATERIAL (for reference):
- ${conceptsContext}

---

Essay Question/Prompt: ${question}

Generate a comprehensive rubric and sample answer in Bahasa Indonesia following the Markdown format specified. Use the key concepts to make the rubric and sample answer more specific and relevant to what students have studied.`;
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
