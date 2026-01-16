import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { ERROR_MESSAGES } from "./consts";
import {
  createQuiz,
  extractConceptsFromDocument,
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

    // Get ALL document context for comprehensive question generation
    const { fileName, context, totalChunks } = await getDocumentContext(
      filePath,
      user.id
    );

    console.log(
      `Processing document: ${fileName} (${totalChunks} total chunks, ${context.length} characters)`
    );

    // STEP 1: Extract concepts first (MAP PHASE) - more efficient for AI
    // This reduces token usage and improves question quality
    // The extracted concepts will be used for BOTH metadata and questions
    const concepts = await extractConceptsFromDocument(context);

    console.log(
      `Extracted ${concepts.length} concepts for metadata & question generation`
    );

    console.log("concepts", concepts);

    // STEP 2: Generate quiz title and description from concepts
    const metadata = await generateQuizMetadata(fileName, concepts);

    // STEP 3: Create quiz in database WITH CONCEPTS for consistency
    const quiz = await createQuiz(
      user.id,
      metadata.title,
      metadata.description,
      filePath,
      concepts // Store concepts for future explanation/rubric generation
    );

    // STEP 4: Generate questions in parallel using concepts (REDUCE PHASE)
    const [mcQuestions, essayQuestions] = await Promise.all([
      generateMultipleChoiceQuestions(concepts, 4),
      generateEssayQuestions(concepts, 4),
    ]);

    // STEP 5: Save questions to database
    console.log(
      `Saving ${mcQuestions.length} multiple-choice and ${essayQuestions.length} essay questions...`
    );

    await Promise.all([
      saveMultipleChoiceQuestions(quiz.id, mcQuestions),
      saveEssayQuestions(quiz.id, essayQuestions),
    ]);

    console.log(`Quiz generation completed successfully!`);

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
        totalChunksProcessed: totalChunks,
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
