import { NextResponse } from "next/server";

import OpenAI from "openai";

import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GradeEssayRequest {
  questionText: string;
  rubric: string | null;
  studentAnswer: string;
  maxPoints: number;
  studentName?: string;
}

interface GradeEssayResponse {
  suggestedScore: number;
  feedback: string;
}

function buildGradingPrompt(
  questionText: string,
  rubric: string | null,
  studentAnswer: string,
  maxPoints: number,
  studentName?: string
): string {
  const namePrefix = studentName || "Student";

  let prompt = `You are an experienced and supportive English teacher for high school students. Your task is to grade a student's essay answer with an educational and constructive score and feedback.

## Question:
${questionText}
`;

  if (rubric) {
    prompt += `
## Grading Rubric:
${rubric}
`;
  }

  prompt += `
## Student's Answer:
${studentAnswer}

## Maximum Points: ${maxPoints}

## Scoring Instructions:
- Give a WHOLE NUMBER (integer) score between 0 and ${maxPoints}, NO decimals allowed
- Score 0 = no answer or completely incorrect
- Maximum score = perfect answer according to rubric
- Middle scores = shows understanding but incomplete

## Feedback Instructions:
- START by PRAISING the positive aspects of the student's answer
- Address the student by name (${namePrefix}) at the beginning
- Use FRIENDLY, POLITE, and MOTIVATING language appropriate for high school students
- Provide EDUCATIONAL and CONSTRUCTIVE feedback
- First explain what the student did WELL
- Then provide SPECIFIC SUGGESTIONS for improvement that are easy to understand
- Avoid overly formal or stiff language
- Make the student feel MOTIVATED to learn and improve
- Keep feedback concise: 3-5 sentences
- Use simple, clear English suitable for high school level

## Response Format:
Respond with JSON containing:
{
  "score": <INTEGER between 0 and ${maxPoints}, MUST be whole number, NO decimals>,
  "feedback": "<feedback in English, friendly for high school students, start with praise and address ${namePrefix}>"
}

Example of good feedback:
"${namePrefix}, great job showing a good basic understanding! You clearly explained the main points and your ideas are easy to follow. To make it even better, try adding specific examples and explaining in more detail about... Keep up the good work!"`;

  return prompt;
}

function parseAIResponse(
  responseText: string,
  maxPoints: number
): GradeEssayResponse {
  try {
    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();

    // Remove ```json and ``` if present
    cleanedText = cleanedText.replace(/^```json?\s*/i, "");
    cleanedText = cleanedText.replace(/```\s*$/, "");
    cleanedText = cleanedText.trim();

    const parsed = JSON.parse(cleanedText);

    // Validate and sanitize score - MUST BE INTEGER
    let score = parseInt(parsed.score.toString());
    if (isNaN(score) || score < 0) {
      score = 0;
    }
    if (score > maxPoints) {
      score = maxPoints;
    }

    // Ensure it's an integer (no decimals)
    score = Math.round(score);

    // Get feedback
    const feedback = parsed.feedback || "No feedback available.";

    return {
      suggestedScore: score,
      feedback: feedback.trim(),
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    console.error("Raw response:", responseText);

    // Fallback: try to extract score and feedback manually
    const scoreMatch = responseText.match(/"score":\s*(\d+(?:\.\d+)?)/);
    const feedbackMatch = responseText.match(/"feedback":\s*"([^"]*)"/);

    // Round to integer
    const score = scoreMatch
      ? Math.min(Math.round(parseFloat(scoreMatch[1])), maxPoints)
      : Math.floor(maxPoints * 0.7); // Default to 70% if parsing fails

    const feedback =
      feedbackMatch?.[1] ||
      "Sorry, AI feedback could not be processed. Please review the answer manually.";

    return {
      suggestedScore: score,
      feedback,
    };
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    // Parse request body
    const body: GradeEssayRequest = await request.json();
    const { questionText, rubric, studentAnswer, maxPoints, studentName } =
      body;

    // Validate input
    if (!questionText || !studentAnswer || !maxPoints) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: questionText, studentAnswer, or maxPoints",
        },
        { status: 400 }
      );
    }

    if (maxPoints <= 0) {
      return NextResponse.json(
        { error: "maxPoints must be greater than 0" },
        { status: 400 }
      );
    }

    // Build prompt for AI grading
    const prompt = buildGradingPrompt(
      questionText,
      rubric,
      studentAnswer,
      maxPoints,
      studentName
    );

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent grading
      response_format: { type: "json_object" },
    });

    // Extract response
    const responseText = response.choices[0].message.content || "";

    // Parse AI response
    const result = parseAIResponse(responseText, maxPoints);

    return NextResponse.json<GradeEssayResponse>(result);
  } catch (error) {
    console.error("Error generating AI grading:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `AI API Error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate AI grading suggestions" },
      { status: 500 }
    );
  }
}
