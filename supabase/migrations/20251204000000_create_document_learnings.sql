-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create storage bucket for learning documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-documents', 'learning-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create document_learnings table
CREATE TABLE IF NOT EXISTS public.document_learnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mistral_file_id TEXT,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  total_chunks INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small uses 1536 dimensions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_learnings_user_id ON public.document_learnings(user_id);
CREATE INDEX IF NOT EXISTS idx_document_learnings_file_name ON public.document_learnings(file_name);
CREATE INDEX IF NOT EXISTS idx_document_learnings_created_at ON public.document_learnings(created_at DESC);

-- Create index for vector similarity search using HNSW (Hierarchical Navigable Small World)
CREATE INDEX IF NOT EXISTS idx_document_learnings_embedding ON public.document_learnings 
USING hnsw (embedding vector_cosine_ops);

-- Enable Row Level Security
ALTER TABLE public.document_learnings ENABLE ROW LEVEL SECURITY;

-- Create policies for document_learnings table
CREATE POLICY "Users can view their own documents"
  ON public.document_learnings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
  ON public.document_learnings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.document_learnings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.document_learnings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for document_learnings table
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.document_learnings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Storage policies for learning-documents bucket
CREATE POLICY "Users can upload their own documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'learning-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'learning-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'learning-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

