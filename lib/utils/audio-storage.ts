import { createClient } from "@/lib/supabase/client";

export interface UploadAudioResult {
  audioUrl: string;
  path: string;
}

/**
 * Upload audio file to R2 Storage via API route
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

  // Create FormData for API request
  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("questionId", options.questionId);
  formData.append("quizId", options.quizId);
  formData.append("userId", options.userId);

  // Upload via API route (which has access to R2 credentials)
  const response = await fetch("/api/audio/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload audio");
  }

  const result = await response.json();

  return {
    audioUrl: result.audioUrl,
    path: result.path,
  };
}

/**
 * Delete audio file from R2 Storage via API route
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

  // Delete via API route (which has access to R2 credentials)
  const response = await fetch(
    `/api/audio/delete?filePath=${encodeURIComponent(filePath)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete audio");
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
