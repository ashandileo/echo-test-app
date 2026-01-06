import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { generateAndUploadTTS } from "./tts-utils";

export async function POST(request: Request) {
  try {
    const { quizId } = await request.json();

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
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

    // 1. Check if quiz exists and is not already published
    const { data: quiz, error: quizError } = await supabase
      .from("quiz")
      .select("id, name, status, created_by")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        {
          error: "Quiz not found",
          details: quizError?.message || "No quiz found with this ID",
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quiz.created_by !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to publish this quiz" },
        { status: 403 }
      );
    }

    if (quiz.status === "published") {
      return NextResponse.json(
        { error: "Quiz is already published" },
        { status: 400 }
      );
    }

    // 2. Get all listening test questions (question_mode = 'audio')
    const { data: listeningQuestions, error: questionsError } = await supabase
      .from("quiz_question_multiple_choice")
      .select("id, audio_script, question_text")
      .eq("quiz_id", quizId)
      .eq("question_mode", "audio")
      .is("deleted_at", null);

    if (questionsError) {
      console.error("Error fetching listening questions:", questionsError);
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    // 3. Generate TTS for each listening test question
    const ttsResults = [];
    const errors = [];

    for (const question of listeningQuestions || []) {
      try {
        // Check if audio_script exists
        if (!question.audio_script || question.audio_script.trim() === "") {
          errors.push({
            questionId: question.id,
            error:
              "Missing audio script - please add audio script for listening test questions",
          });
          continue;
        }

        // Generate and upload TTS from audio_script
        const audioUrl = await generateAndUploadTTS(
          question.audio_script,
          question.id,
          quizId,
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

        ttsResults.push({
          questionId: question.id,
          audioUrl,
          success: true,
        });
      } catch (error) {
        console.error(
          `Error generating TTS for question ${question.id}:`,
          error
        );
        errors.push({
          questionId: question.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // 4. If there were errors, don't publish
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Failed to generate audio for some questions",
          details: errors,
        },
        { status: 500 }
      );
    }

    // 5. Mark quiz as published
    const { error: publishError } = await supabase
      .from("quiz")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", quizId);

    if (publishError) {
      console.error("Error publishing quiz:", publishError);
      return NextResponse.json(
        { error: "Failed to publish quiz" },
        { status: 500 }
      );
    }

    // 6. Return success response
    return NextResponse.json({
      success: true,
      message: "Quiz published successfully",
      ttsGenerated: ttsResults.length,
      audioFiles: ttsResults,
    });
  } catch (error) {
    console.error("Error in publish quiz API:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
