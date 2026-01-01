import OpenAI from "openai";

import { createClient as createServerClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Prepare text for TTS by replacing blanks/underscores with readable text
 * Example: "She ____ study" → "She... dot... dot... dot... study"
 *
 * Uses "dot dot dot" with pauses to make it clear there's a blank
 * The periods and commas create natural pauses in TTS
 */
function prepareTextForTTS(text: string): string {
  // Replace consecutive underscores (3 or more) with "dot... dot... dot..."
  // The ellipsis (...) creates natural pauses in TTS, making it sound slower
  let processedText = text.replace(/_{3,}/g, "... dot... dot... dot... ");

  // Also handle cases with spaces around underscores: " ____ "
  processedText = processedText.replace(
    /\s+_{2,}\s+/g,
    " ... dot... dot... dot... "
  );

  // Clean up multiple spaces
  processedText = processedText.replace(/\s+/g, " ").trim();

  return processedText;
}

/**
 * Generate audio from text using OpenAI TTS
 */
export async function generateTTS(text: string): Promise<ArrayBuffer> {
  try {
    // Prepare text by replacing blanks with readable version
    const preparedText = prepareTextForTTS(text);

    console.log(`Original text: "${text}"`);
    console.log(`Prepared text for TTS: "${preparedText}"`);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy", // Options: alloy, echo, fable, onyx, nova, shimmer
      input: preparedText,
      speed: 0.9, // Slightly slower (0.25 to 4.0, default 1.0) - makes "dot dot dot" clearer
    });

    return await mp3.arrayBuffer();
  } catch (error) {
    console.error("Error generating TTS:", error);
    throw new Error("Failed to generate audio from text");
  }
}

/**
 * Upload audio file to Supabase Storage
 */
export async function uploadAudioToStorage(
  audioBuffer: ArrayBuffer,
  fileName: string,
  quizId: string
): Promise<string> {
  try {
    const supabase = await createServerClient();

    // Convert ArrayBuffer to Buffer for upload
    const buffer = Buffer.from(audioBuffer);

    // Upload to Supabase Storage
    const filePath = `quiz/${quizId}/audio/${fileName}`;

    console.log(`Uploading audio file to: ${filePath}`);

    const { error } = await supabase.storage
      .from("quiz-assets") // Make sure this bucket exists
      .upload(filePath, buffer, {
        contentType: "audio/mpeg",
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error("Error uploading to storage:", error);
      throw new Error(
        `Failed to upload audio file: ${error.message || "Unknown storage error"}`
      );
    }

    console.log(`Audio file uploaded successfully: ${filePath}`);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("quiz-assets").getPublicUrl(filePath);

    console.log(`Public URL generated: ${publicUrl}`);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading audio:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload audio file");
  }
}

/**
 * Generate TTS and upload to storage in one step
 */
export async function generateAndUploadTTS(
  text: string,
  questionId: string,
  quizId: string
): Promise<string> {
  // Generate TTS
  const audioBuffer = await generateTTS(text);

  // Create filename
  const fileName = `question-${questionId}.mp3`;

  // Upload to storage
  const audioUrl = await uploadAudioToStorage(audioBuffer, fileName, quizId);

  return audioUrl;
}
