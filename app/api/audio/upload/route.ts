import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { uploadAudioToR2 } from "@/lib/utils/r2-audio-storage";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const questionId = formData.get("questionId") as string;
    const quizId = formData.get("quizId") as string;
    const userId = formData.get("userId") as string;

    if (!audioFile || !questionId || !quizId || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user matches
    if (userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: User ID mismatch" },
        { status: 403 }
      );
    }

    // Convert file to buffer
    const bytes = await audioFile.arrayBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${questionId}_${timestamp}.webm`;

    // Upload to R2
    const result = await uploadAudioToR2(bytes, {
      fileName,
      userId,
      quizId,
      contentType: audioFile.type || "audio/webm",
    });

    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      path: result.path,
    });
  } catch (error) {
    console.error("Upload audio error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
