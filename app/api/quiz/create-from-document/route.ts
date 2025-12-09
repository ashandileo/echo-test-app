import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { ERROR_MESSAGES } from "./consts";
import {
  createQuiz,
  generateEssayQuestions,
  generateMultipleChoiceQuestions,
  generateQuizMetadata,
  getDocumentContext,
  saveEssayQuestions,
  saveMultipleChoiceQuestions,
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
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_FILE_PATH },
        { status: 400 }
      );
    }

    // Get document context (use more chunks for better question generation)
    const { fileName, context } = await getDocumentContext(
      filePath,
      user.id,
      5
    );

    // Generate quiz title and description using AI
    const metadata = await generateQuizMetadata(
      fileName,
      context.slice(0, 2000) // Limit to ~500 tokens
    );

    // Create quiz in database
    const quiz = await createQuiz(
      user.id,
      metadata.title,
      metadata.description,
      filePath
    );

    // Generate questions in parallel
    const [mcQuestions, essayQuestions] = await Promise.all([
      generateMultipleChoiceQuestions(context, 5),
      generateEssayQuestions(context, 3),
    ]);

    // Save questions to database
    await Promise.all([
      saveMultipleChoiceQuestions(quiz.id, mcQuestions),
      saveEssayQuestions(quiz.id, essayQuestions),
    ]);

    return NextResponse.json({
      success: true,
      message: "Quiz created successfully with questions",
      data: {
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        sourceDocumentPath: filePath,
        multipleChoiceCount: mcQuestions.length,
        essayCount: essayQuestions.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create quiz",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
