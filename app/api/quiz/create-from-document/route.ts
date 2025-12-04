import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "./consts";
import { generateQuizMetadata, getDocumentContext, createQuiz } from "./utils";

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

    console.log(`Creating quiz from document: ${filePath}`);

    // Get document context (first 3 chunks)
    const { fileName, context } = await getDocumentContext(
      filePath,
      user.id,
      3
    );

    // Generate quiz title and description using AI
    const metadata = await generateQuizMetadata(
      fileName,
      context.slice(0, 2000) // Limit to ~500 tokens
    );

    console.log(`Generated quiz metadata:`, metadata);

    // Create quiz in database
    const quiz = await createQuiz(
      user.id,
      metadata.title,
      metadata.description,
      filePath
    );

    console.log(`Quiz created successfully: ${quiz.id}`);

    return NextResponse.json({
      success: true,
      message: "Quiz created successfully",
      data: {
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        sourceDocumentPath: filePath,
      },
    });
  } catch (error) {
    console.error("Error creating quiz from document:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create quiz",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
