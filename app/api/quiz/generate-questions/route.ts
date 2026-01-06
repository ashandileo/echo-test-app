import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
  DEFAULT_DIFFICULTY,
  DEFAULT_NUM_QUESTIONS,
  ERROR_MESSAGES,
} from "./consts";
import {
  generateQuestions,
  getDocumentChunks,
  getQuiz,
  prepareContext,
  updateQuizQuestions,
} from "./utils";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      quizId,
      numQuestions = DEFAULT_NUM_QUESTIONS,
      difficulty = DEFAULT_DIFFICULTY,
    } = body;

    if (!quizId) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_QUIZ_ID },
        { status: 400 }
      );
    }

    // Step 1: Get quiz
    const quiz = await getQuiz(quizId, user.id);

    if (!quiz.source_document_path) {
      return NextResponse.json(
        { error: "Quiz has no source document" },
        { status: 400 }
      );
    }

    // Step 2: Get document chunks
    const chunks = await getDocumentChunks(quiz.source_document_path, user.id);

    // Step 3: Prepare context
    const context = prepareContext(chunks);

    // Step 4: Generate questions using AI
    const questions = await generateQuestions(
      quiz.name,
      context,
      numQuestions,
      difficulty
    );

    // Step 5: Update quiz with questions
    const updatedQuiz = await updateQuizQuestions(quizId, questions);

    return NextResponse.json({
      success: true,
      message: "Questions generated successfully",
      data: {
        id: updatedQuiz.id,
        name: updatedQuiz.name,
        description: updatedQuiz.description,
        questions: updatedQuiz.questions,
        totalQuestions: questions.length,
      },
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
