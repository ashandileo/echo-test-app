-- Remove is_published column from quiz table as it's redundant with status column
-- The quiz table already has a status column with values: 'published', 'draft', 'archived'

-- Drop index on is_published if it exists
DROP INDEX IF EXISTS public.idx_quiz_is_published;

-- Drop the is_published column if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz' AND column_name = 'is_published'
    ) THEN
        ALTER TABLE public.quiz DROP COLUMN is_published;
    END IF;
END $$;

-- Add comment to clarify status usage
COMMENT ON COLUMN public.quiz.status IS 'Quiz status: draft (default), published (available to students), or archived';
