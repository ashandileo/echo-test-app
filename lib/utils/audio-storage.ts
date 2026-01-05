import { createClient } from "@/lib/supabase/client";

export interface UploadAudioResult {
  audioUrl: string;
  path: string;
}

/**
 * Upload audio file to Supabase Storage
 */
export async function uploadAudio(
  audioBlob: Blob,
  options: {
    questionId: string;
    quizId: string;
    userId: string;
  }
): Promise<UploadAudioResult> {
  const supabase = createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  // Verify user matches
  if (options.userId !== user.id) {
    throw new Error("Unauthorized: User ID mismatch");
  }

  // Convert blob to array buffer
  const arrayBuffer = await audioBlob.arrayBuffer();

  // Generate unique filename
  const timestamp = Date.now();
  const fileName = `${options.userId}/${options.quizId}/${options.questionId}_${timestamp}.webm`;

  // Upload to Supabase storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("quiz-assets")
    .upload(fileName, arrayBuffer, {
      contentType: "audio/webm",
      upsert: true,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("Failed to upload audio");
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("quiz-assets").getPublicUrl(uploadData.path);

  return {
    audioUrl: publicUrl,
    path: uploadData.path,
  };
}

/**
 * Delete audio file from Supabase Storage
 */
export async function deleteAudio(filePath: string): Promise<void> {
  const supabase = createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  // Verify the file belongs to the user (check if path starts with userId)
  if (!filePath.startsWith(user.id)) {
    throw new Error(
      "Unauthorized: Cannot delete file that doesn't belong to you"
    );
  }

  // Delete from storage
  const { error: deleteError } = await supabase.storage
    .from("quiz-assets")
    .remove([filePath]);

  if (deleteError) {
    console.error("Delete error:", deleteError);
    throw new Error("Failed to delete audio");
  }
}

/**
 * Delete audio by parsing URL to get the file path
 */
export async function deleteAudioByUrl(audioUrl: string): Promise<void> {
  // Extract path from public URL
  // Example URL: https://xxx.supabase.co/storage/v1/object/public/quiz-assets/userId/quizId/file.webm
  const pathMatch = audioUrl.match(/quiz-assets\/(.+)$/);

  if (!pathMatch || !pathMatch[1]) {
    throw new Error("Invalid audio URL format");
  }

  const filePath = pathMatch[1];
  await deleteAudio(filePath);
}
