-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION search_document_chunks(
  query_embedding vector(1536),
  match_user_id uuid,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  file_name text,
  file_path text,
  chunk_text text,
  chunk_index int,
  total_chunks int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_learnings.id,
    document_learnings.user_id,
    document_learnings.file_name,
    document_learnings.file_path,
    document_learnings.chunk_text,
    document_learnings.chunk_index,
    document_learnings.total_chunks,
    1 - (document_learnings.embedding <=> query_embedding) as similarity
  FROM document_learnings
  WHERE document_learnings.user_id = match_user_id
  ORDER BY document_learnings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment
COMMENT ON FUNCTION search_document_chunks IS 'Search for similar document chunks using vector similarity (cosine distance)';
