import OpenAI from "openai";

import { createClient } from "@/lib/supabase/server";
import { chunkBySentence } from "@/lib/utils/text-chunking";

import {
  DEFAULT_CHUNK_SIZE,
  ERROR_MESSAGES,
  OPENAI_MODEL_EMBEDDING,
  STORAGE_BUCKET_NAME,
} from "./consts";

// Types
export interface ProcessDocumentRequest {
  markdown: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mistralFileId?: string;
  file: string; // base64 encoded
}

export interface DocumentChunk {
  id?: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mistral_file_id: string | null;
  chunk_text: string;
  chunk_index: number;
  total_chunks: number;
  embedding: number[];
  created_at?: string;
  updated_at?: string;
}

export interface ProcessDocumentResponse {
  success: boolean;
  message: string;
  data: {
    documentId: string;
    fileName: string;
    filePath: string;
    fileUrl: string;
    totalChunks: number;
    chunksProcessed: number;
  };
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation
export const validateRequest = (
  body: Partial<ProcessDocumentRequest>
): { valid: boolean; error?: string } => {
  if (!body.markdown || !body.fileName) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
    };
  }

  if (!body.file) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_FILE_DATA,
    };
  }

  return { valid: true };
};

// File Upload
export const uploadFileToStorage = async (
  base64File: string,
  fileName: string,
  fileType: string,
  userId: string
): Promise<{ filePath: string; error?: string }> => {
  try {
    const supabase = await createClient();

    // Convert base64 to buffer
    const base64Data = base64File.split(",")[1] || base64File;
    const buffer = Buffer.from(base64Data, "base64");

    // Create unique file path: userId/timestamp-filename
    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: fileType || "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return {
        filePath: "",
        error: ERROR_MESSAGES.STORAGE_UPLOAD_FAILED,
      };
    }

    return { filePath };
  } catch (error) {
    return {
      filePath: "",
      error: ERROR_MESSAGES.STORAGE_UPLOAD_FAILED,
    };
  }
};

// Text Chunking
export const chunkDocument = (
  markdown: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): string[] => {
  return chunkBySentence(markdown, chunkSize);
};

// Embedding Generation
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: OPENAI_MODEL_EMBEDDING,
      input: text,
    });

    return embeddingResponse.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(ERROR_MESSAGES.EMBEDDING_GENERATION_FAILED);
  }
};

// Create Document Chunks with Embeddings
export const createDocumentChunks = async (
  chunks: string[],
  userId: string,
  fileName: string,
  filePath: string,
  fileSize: number,
  fileType: string,
  mistralFileId?: string
): Promise<DocumentChunk[]> => {
  const embeddingPromises = chunks.map(async (chunk, index) => {
    try {
      const embedding = await generateEmbedding(chunk);

      return {
        user_id: userId,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize || 0,
        file_type: fileType || "application/pdf",
        mistral_file_id: mistralFileId || null,
        chunk_text: chunk,
        chunk_index: index,
        total_chunks: chunks.length,
        embedding: embedding,
      };
    } catch (error) {
      console.error(`Error generating embedding for chunk ${index}:`, error);
      throw error;
    }
  });

  return Promise.all(embeddingPromises);
};

// Save to Database
export const saveDocumentChunks = async (
  chunks: DocumentChunk[]
): Promise<{ success: boolean; data?: DocumentChunk[]; error?: string }> => {
  try {
    const supabase = await createClient();

    const { data: insertedData, error: insertError } = await supabase
      .from("document_learnings")
      .insert(chunks)
      .select();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return {
        success: false,
        error: ERROR_MESSAGES.DATABASE_INSERT_FAILED,
      };
    }

    return { success: true, data: insertedData };
  } catch (error) {
    console.error("Save document chunks error:", error);
    return {
      success: false,
      error: ERROR_MESSAGES.DATABASE_INSERT_FAILED,
    };
  }
};

// Get Public URL
export const getFilePublicUrl = async (filePath: string): Promise<string> => {
  const supabase = await createClient();

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET_NAME)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};
