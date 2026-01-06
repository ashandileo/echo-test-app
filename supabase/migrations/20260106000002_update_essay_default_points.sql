-- Update default points for essay questions from 1 to 5
-- This migration changes the default value and updates existing records

-- First, update existing essay questions that have 1 point to 5 points
UPDATE public.quiz_question_essay
SET points = 5
WHERE points = 1;

-- Then alter the table to change the default value
ALTER TABLE public.quiz_question_essay
ALTER COLUMN points SET DEFAULT 5;

-- Add comment for documentation
COMMENT ON COLUMN public.quiz_question_essay.points IS 'Points assigned to this question (default: 5)';
