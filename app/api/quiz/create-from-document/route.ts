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

    // Generate quiz title and description using AI
    const metadata = await generateQuizMetadata(
      fileName,
      context.slice(0, 2000) // Use first ~500 tokens for metadata generation
    );

    // Create quiz in database
    const quiz = await createQuiz(
      user.id,
      metadata.title,
      metadata.description,
      filePath
    );

    console.log(`Quiz created with ID: ${quiz.id}`);

    // Extract concepts once (MAP PHASE) - will be shared by both question generators
    const concepts = await extractConceptsFromDocument(context);

    // Generate questions using extracted concepts or direct context
    // If concepts is null (small doc), pass context directly
    // If concepts exists (large doc), pass concepts array
    const inputForGeneration = concepts || context;

    console.log({
      concepts,
      context,
    });

    console.log(
      `📊 Generation mode: ${concepts ? `Map-Reduce (${concepts.length} concepts)` : "Direct (small document)"}`
    );

    // Generate questions in parallel - REDUCE PHASE (or direct for small docs)
    const [mcQuestions, essayQuestions] = await Promise.all([
      generateMultipleChoiceQuestions(inputForGeneration, 8),
      generateEssayQuestions(inputForGeneration, 4),
    ]);

    // Save questions to database
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
