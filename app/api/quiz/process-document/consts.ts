// OpenAI Configuration
export const OPENAI_MODEL_EMBEDDING = "text-embedding-3-small" as const;
export const EMBEDDING_DIMENSIONS = 1536 as const;

// Text Chunking Configuration
export const DEFAULT_CHUNK_SIZE = 1000 as const;
export const DEFAULT_CHUNK_OVERLAP = 200 as const;

// Storage Configuration
export const STORAGE_BUCKET_NAME = "learning-documents" as const;

// File Validation
export const MAX_FILE_SIZE = 1024 * 1024 * 50; // 50MB (Supabase default limit)
export const ACCEPTED_FILE_TYPES = ["application/pdf"] as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized. Please login.",
  MISSING_REQUIRED_FIELDS: "Missing required fields: markdown and fileName",
  MISSING_FILE_DATA: "Missing file data. Please upload a file.",
  FILE_TOO_LARGE: "File size exceeds maximum limit of 50MB.",
  INVALID_FILE_TYPE: "Invalid file type. Only PDF files are accepted.",
  NO_CHUNKS_GENERATED: "No valid text chunks generated from the document",
  STORAGE_UPLOAD_FAILED: "Failed to upload file to storage",
  EMBEDDING_GENERATION_FAILED: "Failed to generate embeddings",
  DATABASE_INSERT_FAILED: "Failed to save embeddings to database",
  PROCESSING_FAILED: "Failed to process document and generate embeddings",
} as const;
