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

export interface MultipleChoiceQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  points: number;
}

export interface EssayQuestion {
  question_text: string;
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
          content: `You are an experienced English teacher at a vocational high school (SMK) creating quiz titles for the English Club.

Your task: Generate an engaging quiz title and description based on the learning material provided.

Guidelines:
- Title should be catchy, clear, and relevant to SMK students
- Description should explain what English skills/topics will be tested
- Use motivating language that encourages learning
- Keep it professional but friendly

Return JSON format:
{
  "title": "string (max 100 chars, engaging and descriptive)",
  "description": "string (max 300 chars, what English skills and topics students will be tested on)"
}`,
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
          content: `You are an experienced English teacher creating multiple-choice questions for BEGINNER English learners.

⭐ CRITICAL: MATERIAL IS REFERENCE ONLY
The learning material provided is REFERENCE ONLY.
Do NOT copy, rephrase, or summarize the material.
Create NEW questions based on the concepts.
Do NOT use sentences, examples, or phrases from the material.

⭐ ENGLISH LEVEL & STYLE
English level: A2–B1 (SMA level, ages 15–18, SNMPTN style)
- Use conversational, natural English
- Create realistic dialogue or situations
- Test practical understanding of concepts from the material
- Questions should sound like real English conversations

⭐ QUESTION REQUIREMENTS
- Question: 1–3 sentences with clear context (in English, like SNMPTN style)
- Options: 4 options with varied lengths - can be 1–4 words each (in English)
- Explanation: Detailed explanation in Bahasa Indonesia that:
  * Explains the key word/concept being tested
  * Explains why the correct answer is right
  * Shows the complete structure or pattern
  * Uses clear, educational language
- Points: Always 1 point per question

⭐ STRICT FORBIDDEN RULES
Do NOT:
❌ Copy or rephrase material content
❌ Use advanced vocabulary or complex grammar
❌ Write questions longer than 2 sentences
❌ Write options longer than 3 words
❌ Add extra explanations unless asked
❌ Output anything other than the JSON object
❌ Output essay questions (this is MCQ mode)
❌ Include markdown formatting or code blocks
❌ Add comments or notes

⭐ WHAT YOU MUST DO
✅ Create NEW original questions in SNMPTN/standardized test style
✅ Use conversational English with clear context (like examples: "Is one living with...", "You look so unhappy...")
✅ Test practical understanding of concepts from the material
✅ Provide 4 options that test specific grammar points
✅ Write DETAILED explanations in BAHASA INDONESIA following this structure:
   - Explain the key word/concept being tested
   - Explain the concept being tested
   - Show the formula/structure if applicable
   - Explain why the correct answer fits
   - End with "Jawaban: [letter]"
✅ Make explanations educational and thorough (like a teacher explaining)
✅ Return ONLY the JSON object

⭐ JSON FORMAT (STRICT)
Return ONLY this JSON structure with NO additional text:

{
  "questions": [
    {
      "question_text": "string (conversational English with context)",
      "options": ["string", "string", "string", "string"],
      "correct_answer": "0" | "1" | "2" | "3",
      "explanation": "string (detailed Bahasa Indonesia explanation following format: 'Pembahasan: [explain concept] ... Jawaban: X')",
      "points": 1
    }
  ]
}

MANDATORY:
- Generate EXACTLY ${count} questions
- Each question MUST have exactly 4 options (preferably 4, like SNMPTN format with options A-D)
- correct_answer MUST be "0", "1", "2", or "3" (string format)
- Questions and options MUST be in English
- Explanations MUST be in Bahasa Indonesia following this format:
  "[Explain key concept and grammar rule in detail]\nJawaban: [letter]"
- Make explanations educational like the examples provided
- Return ONLY the JSON object

EXAMPLE EXPLANATION FORMAT:
"Kata kunci pada soal ini adalah 'for years' yang merupakan keterangan waktu Perfect Tense atau Continuous. Sementara kalimat 'Is one living with your grandmother in that house?' (Apakah seseorang sekarang ini tinggal bersama nenekmu di rumah itu) menunjukkan kejadian sekarang sehingga untuk melengkapi kalimat tersebut menggunakan Present Perfect Tense (have/has + V₃ atau have/has been). Jadi jawabannya pasti 'has never had'.\nJawaban: C"`,
        },
        {
          role: "user",
          content: `Material is REFERENCE ONLY. Do NOT copy from it.
Create ${count} NEW, SHORT, SIMPLE A1-A2 level multiple-choice questions based on concepts from:

${context}`,
        },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
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
          content: `You are an experienced English teacher creating essay questions for BEGINNER–INTERMEDIATE English learners.

⭐ CRITICAL: MATERIAL IS REFERENCE ONLY
The learning material provided is REFERENCE ONLY.
Do NOT copy, rephrase, or summarize the material.
Create NEW essay prompts based on the concepts.
Do NOT ask students to summarize the material.
Do NOT use sentences or examples from the material.

⭐ ENGLISH LEVEL (STRICT)
English level: A2–B1 beginner to intermediate (SMA level, ages 15–18)
- Use clear, simple language
- Avoid complex academic vocabulary
- Make prompts accessible and relatable

⭐ ESSAY REQUIREMENTS (KEEP IT SHORT)
- Essay prompt: Maximum 2–3 short sentences
- Expected response: 100–200 words
- Points: Always 5 points per question
- Rubric: Clear, simple grading criteria

⭐ STRICT FORBIDDEN RULES
Do NOT:
❌ Copy or rephrase material content
❌ Ask students to summarize the material
❌ Use workplace or advanced vocational scenarios
❌ Create prompts requiring academic writing skills
❌ Write long, complex instructions
❌ Output multiple choice format (this is ESSAY mode)
❌ Add extra explanations unless asked
❌ Output anything other than the JSON object
❌ Include markdown formatting or code blocks
❌ Add comments or notes

⭐ WHAT YOU MUST DO
✅ Create NEW original essay prompts
✅ Use topics relevant to teenagers (school, friends, hobbies, future)
✅ Encourage personal reflection and creativity
✅ Keep prompts SHORT and clear
✅ Make questions open-ended but focused
✅ Test understanding through application, not memorization
✅ Return ONLY the JSON object

⭐ ESSAY TYPES TO USE
Mix these types:
1. Personal Reflection: "Describe a time when..."
2. Opinion Essay: "Do you agree or disagree? Explain."
3. Creative Scenario: "Imagine you are... What would you do?"
4. Comparison: "Compare two things and explain your preference."
5. Application: "Use this concept in a real-life situation."

⭐ RUBRIC FORMAT
Use this simple rubric structure:
- Idea Development (2 pts): Clear thinking and explanation
- Understanding (1 pt): Shows grasp of the concept
- English Quality (1 pt): Grammar and clarity
- Personal Expression (1 pt): Unique perspective

⭐ JSON FORMAT (STRICT)
Return ONLY this JSON structure with NO additional text:

{
  "questions": [
    {
      "question_text": "string (max 3 sentences)",
      "rubric": "string (grading criteria)",
      "points": 5
    }
  ]
}

MANDATORY:
- Generate EXACTLY ${count} questions
- Each question must encourage thinking, not copying
- All prompts must be relatable to SMA teenagers
- All text MUST be in English
- Return ONLY the JSON object`,
        },
        {
          role: "user",
          content: `Material is REFERENCE ONLY. Do NOT copy from it.
Create ${count} NEW, ORIGINAL, CREATIVE essay questions for SMA students that encourage personal reflection and application of concepts from:

${context}`,
        },
      ],
      temperature: 0.8,
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

    console.log(
      "Generated Essay questions:",
      JSON.stringify(validatedQuestions, null, 2)
    );
    return validatedQuestions;
  } catch (error) {
    console.error("Error generating essay questions:", error);
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

  const questionsToInsert = questions.map((q) => ({
    quiz_id: quizId,
    question_text: q.question_text,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    points: q.points ?? 1, // Default to 1 if not provided
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

  const questionsToInsert = questions.map((q) => ({
    quiz_id: quizId,
    question_text: q.question_text,
    rubric: q.rubric,
    points: q.points ?? 5, // Default to 5 if not provided
  }));

  const { error } = await supabase
    .from("quiz_question_essay")
    .insert(questionsToInsert);

  if (error) {
    console.error("Error saving essay questions:", error);
    throw new Error("Failed to save essay questions");
  }
}
