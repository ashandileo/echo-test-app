import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { generateAndUploadTTS } from "../../publish/tts-utils";

/**
 * Generate audio preview from audio script and upload to R2 storage
 * This is used in the review modal to generate audio before saving questions
 * The audio URL will be saved along with the question when user clicks save
 */
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
    const { audioScript, questionId, quizId } = body;

    if (!audioScript || typeof audioScript !== "string") {
      return NextResponse.json(
        { error: "Audio script is required" },
        { status: 400 }
      );
    }

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    console.log(
      "Generating and uploading audio preview for question:",
      questionId
    );

    // Generate TTS and upload to R2 storage
    const audioUrl = await generateAndUploadTTS(
      audioScript,
      questionId, // Use the temporary question ID
      quizId,
      user.id
    );

    return NextResponse.json({
      success: true,
      audioUrl,
      message: "Audio generated and uploaded successfully",
    });
  } catch (error) {
    console.error("Error generating audio preview:", error);
    return NextResponse.json(
      {
        error: "Failed to generate audio preview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
