import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// Initialize R2 Client
const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export interface UploadAudioResult {
  audioUrl: string;
  path: string;
}

/**
 * Upload audio file to R2 Storage
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
    // Validate environment variables
    if (
      !process.env.R2_ACCOUNT_ID ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY ||
      !process.env.R2_BUCKET_NAME
    ) {
      throw new Error("R2 configuration is missing");
    }

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(audioBuffer);

    // Create file path: userId/quizId/audio/fileName
    const filePath = `${options.userId}/${options.quizId}/audio/${options.fileName}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: options.contentType || "audio/webm",
    });

    await R2.send(command);

    // Generate public URL
    const publicUrl = process.env.R2_PUBLIC_URL
      ? `${process.env.R2_PUBLIC_URL}/${filePath}`
      : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${filePath}`;

    return {
      audioUrl: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload audio to R2");
  }
}

/**
 * Delete audio file from R2 Storage
 */
export async function deleteAudioFromR2(filePath: string): Promise<void> {
  try {
    // Validate environment variables
    if (
      !process.env.R2_ACCOUNT_ID ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY ||
      !process.env.R2_BUCKET_NAME
    ) {
      throw new Error("R2 configuration is missing");
    }

    // Delete from R2
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filePath,
    });

    await R2.send(command);
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete audio from R2");
  }
}
