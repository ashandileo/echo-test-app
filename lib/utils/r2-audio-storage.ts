import { createClient } from "@/lib/supabase/server";

export interface UploadAudioResult {
  audioUrl: string;
  path: string;
}

/**
 * Upload audio file to Supabase Storage
 * Bucket name: quiz-assets (already exists from previous migration)
 */
export async function uploadAudioToR2(
  audioBuffer: ArrayBuffer,
  options: {
    fileName: string;
    userId: string;
    quizId: string;
    contentType?: string;
  }
): Promise<UploadAudioResult> {
  try {
    const supabase = await createClient();

    // Convert ArrayBuffer to Uint8Array for Supabase
    const uint8Array = new Uint8Array(audioBuffer);

    // Create file path: userId/quizId/audio/fileName
    const filePath = `${options.userId}/${options.quizId}/audio/${options.fileName}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("quiz-assets")
      .upload(filePath, uint8Array, {
        contentType: options.contentType || "audio/webm",
        upsert: true, // Replace if exists
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("quiz-assets").getPublicUrl(filePath);

    return {
      audioUrl: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Error uploading to Supabase Storage:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload audio to Supabase Storage");
  }
}

/**
 * Delete audio file from Supabase Storage
 */
export async function deleteAudioFromR2(filePath: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from("quiz-assets")
      .remove([filePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      throw new Error(`Failed to delete from Supabase: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting from Supabase Storage:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete audio from Supabase Storage");
  }
}
