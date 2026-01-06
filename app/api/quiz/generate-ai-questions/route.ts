import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
  DEFAULT_NUM_QUESTIONS,
  ERROR_MESSAGES,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
} from "./consts";
import {
  createEmbedding,
  generateMixedQuestions,
  generateQuestionsWithRAG,
  getQuiz,
  getRelevantContext,
  saveGeneratedQuestions,
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
      questionCount = DEFAULT_NUM_QUESTIONS,
      questionType,
      questionMode, // For multiple_choice: text or audio (listening test)
      answerMode, // For essay: text or voice (speaking test)
      additionalInstructions = "",
      saveToDatabase = false, // Whether to save directly to DB or return for review
    } = body;

    // Validate inputs
    if (!quizId) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_QUIZ_ID },
        { status: 400 }
      );
    }

    if (!questionType) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_QUESTION_TYPE },
        { status: 400 }
      );
    }

    if (questionCount < MIN_QUESTIONS || questionCount > MAX_QUESTIONS) {
      return NextResponse.json(
        {
          error: `Question count must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}`,
        },
        { status: 400 }
      );
    }

    // Step 1: Get quiz details
    const quiz = await getQuiz(quizId as string, user.id);

    if (!quiz.source_document_path) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_SOURCE_DOCUMENT },
        { status: 400 }
      );
    }

    // Step 2: Create embedding from quiz context
    const queryText = `${quiz.name}. ${quiz.description || ""}. ${additionalInstructions}`;
    const queryEmbedding = await createEmbedding(queryText);

    // Step 3: Get relevant context using RAG (vector similarity search)
    const relevantChunks = await getRelevantContext(
      queryEmbedding,
      user.id,
      quiz.source_document_path
    );

    // Step 4: Generate questions using RAG
    let generatedQuestions;

    if (questionType === "mixed") {
      // Generate mixed questions (both MC and Essay)
      generatedQuestions = await generateMixedQuestions(
        quiz.name,
        relevantChunks,
        questionCount,
        additionalInstructions
      );
    } else {
      // Generate specific type
      generatedQuestions = await generateQuestionsWithRAG(
        quiz.name,
        relevantChunks,
        questionCount,
        questionType,
        additionalInstructions,
        questionMode, // Pass questionMode to control text/audio split
        answerMode // Pass answerMode to control text/voice split
      );
    }

    // Step 5: Save to database if requested
    if (saveToDatabase) {
      const savedQuestions = await saveGeneratedQuestions(
        quizId as string,
        generatedQuestions
      );

      return NextResponse.json({
        success: true,
        message: "Questions generated and saved successfully",
        data: {
          quizId: quiz.id,
          quizName: quiz.name,
          questions: savedQuestions,
          totalQuestions: savedQuestions.length,
          savedToDatabase: true,
        },
      });
    }

    // Step 6: Return for review
    return NextResponse.json({
      success: true,
      message: "Questions generated successfully",
      data: {
        quizId: quiz.id,
        quizName: quiz.name,
        questions: generatedQuestions,
        totalQuestions: generatedQuestions.length,
        savedToDatabase: false,
      },
    });
  } catch (error) {
    console.error("Error generating AI questions:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.GENERATION_FAILED,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
