-- Add column to link quiz with source document
ALTER TABLE public.quiz 
ADD COLUMN IF NOT EXISTS source_document_path TEXT;

-- Add index for source_document_path
CREATE INDEX IF NOT EXISTS idx_quiz_source_document ON public.quiz(source_document_path);

-- Add comment
COMMENT ON COLUMN public.quiz.source_document_path IS 'Path to source document in document_learnings table';
