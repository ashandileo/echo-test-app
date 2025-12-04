import { createClient } from "@/lib/supabase/server";

/**
 * Get all chunks for a document, ordered by chunk_index
 */
export async function getDocumentChunks(filePath: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("document_learnings")
    .select("*")
    .eq("file_path", filePath)
    .order("chunk_index", { ascending: true });

  if (error) {
    console.error("Error fetching document chunks:", error);
    return [];
  }

  return data;
}

/**
 * Get document metadata (from first chunk)
 */
export async function getDocumentMetadata(filePath: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("document_learnings")
    .select(
      "id, file_name, file_path, file_size, file_type, total_chunks, created_at, mistral_file_id"
    )
    .eq("file_path", filePath)
    .eq("chunk_index", 0)
    .single();

  if (error || !data) {
    console.error("Error fetching document metadata:", error);
    return null;
  }

  return data;
}

/**
 * Get all documents for a user (unique by file_path, only first chunk)
 */
export async function getUserDocuments(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("document_learnings")
    .select(
      "id, file_name, file_path, file_size, file_type, total_chunks, created_at"
    )
    .eq("user_id", userId)
    .eq("chunk_index", 0)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user documents:", error);
    return [];
  }

  return data;
}

/**
 * Search for similar content using vector similarity
 * @param query The embedding vector to search for
 * @param userId The user ID to filter by
 * @param limit Maximum number of results
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  userId: string,
  limit: number = 10
) {
  const supabase = await createClient();

  // Note: This uses pgvector's cosine distance operator (<=>)
  // You'll need to use a custom RPC function for this
  const { data, error } = await supabase.rpc("search_document_chunks", {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_count: limit,
  });

  if (error) {
    console.error("Error searching similar chunks:", error);
    return [];
  }

  return data;
}

/**
 * Delete all chunks for a document
 */
export async function deleteDocument(filePath: string) {
  const supabase = await createClient();

  // Delete from database
  const { error: dbError } = await supabase
    .from("document_learnings")
    .delete()
    .eq("file_path", filePath);

  if (dbError) {
    console.error("Error deleting document from database:", dbError);
    return { success: false, error: dbError };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("learning-documents")
    .remove([filePath]);

  if (storageError) {
    console.error("Error deleting document from storage:", storageError);
    return { success: false, error: storageError };
  }

  return { success: true };
}
