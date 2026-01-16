-- Add concepts column to quiz table
-- This stores the extracted concepts from the learning material
-- Used to ensure consistency when generating explanations and rubrics
ALTER TABLE public.quiz
ADD COLUMN IF NOT EXISTS concepts TEXT[] DEFAULT '{}';

-- Create index on concepts for potential future searches
CREATE INDEX IF NOT EXISTS idx_quiz_concepts ON public.quiz USING GIN(concepts);

-- Add comment explaining the column
COMMENT ON COLUMN public.quiz.concepts IS 'Extracted key concepts from the learning material used for AI generation consistency';
