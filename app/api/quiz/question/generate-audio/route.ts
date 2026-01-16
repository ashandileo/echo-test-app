import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { generateAndUploadTTS } from "../../publish/tts-utils";

export async function POST(request: Request) {
  try {
    const { questionId } = await request.json();

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    // Get the question
    const { data: question, error: questionError } = await supabase
      .from("quiz_question_multiple_choice")
      .select("id, quiz_id, audio_script, question_mode")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        {
          error: "Question not found",
          details: questionError?.message || "No question found with this ID",
        },
        { status: 404 }
      );
    }

    // Get quiz to verify ownership
    const { data: quiz, error: quizError } = await supabase
      .from("quiz")
      .select("created_by")
      .eq("id", question.quiz_id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Verify ownership
    if (quiz.created_by !== user.id) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to generate audio for this question",
        },
        { status: 403 }
      );
    }

    // Verify it's a listening test
    if (question.question_mode !== "audio") {
      return NextResponse.json(
        { error: "This question is not a listening test" },
        { status: 400 }
      );
    }

    // Verify audio_script exists
    if (!question.audio_script || question.audio_script.trim() === "") {
      return NextResponse.json(
        { error: "No audio script found for this question" },
        { status: 400 }
      );
    }

    // Generate and upload TTS
    try {
      const audioUrl = await generateAndUploadTTS(
        question.audio_script,
        question.id,
        question.quiz_id,
        user.id
      );

      // Update question with audio URL
      const { error: updateError } = await supabase
        .from("quiz_question_multiple_choice")
        .update({ audio_url: audioUrl })
        .eq("id", question.id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        message: "Audio generated successfully",
        audioUrl,
      });
    } catch (error) {
      console.error(`Error generating TTS for question ${question.id}:`, error);
      return NextResponse.json(
        {
          error: "Failed to generate audio",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in generate audio API:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
