import { NextResponse } from "next/server";

import OpenAI from "openai";

import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SpeechToTextRequest {
  audioUrl: string;
}

interface SpeechToTextResponse {
  transcription: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SpeechToTextRequest = await request.json();
    const { audioUrl } = body;

    // Validate input
    if (!audioUrl) {
      return NextResponse.json(
        { error: "Missing required field: audioUrl" },
        { status: 400 }
      );
    }

    // Download audio from URL
    console.log("Downloading audio from:", audioUrl);
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
    }

    // Get audio as blob
    const audioBlob = await audioResponse.blob();

    // Convert blob to File object (required by OpenAI API)
    const audioFile = new File([audioBlob], "audio.webm", {
      type: audioBlob.type || "audio/webm",
    });

    console.log("Audio file size:", audioFile.size, "bytes");
    console.log("Audio file type:", audioFile.type);

    // Call OpenAI Whisper API for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en", // Specify English for better accuracy
      response_format: "text",
    });

    console.log("Transcription successful:", transcription.substring(0, 100));

    return NextResponse.json<SpeechToTextResponse>({
      transcription: transcription.trim(),
    });
  } catch (error) {
    console.error("Error in speech-to-text:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Speech-to-text Error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
