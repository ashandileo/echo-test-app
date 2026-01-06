-- Add expected_word_count column to quiz_question_essay table
-- This field stores the expected word count or time duration for essay answers
ALTER TABLE public.quiz_question_essay
ADD COLUMN expected_word_count TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.quiz_question_essay.expected_word_count IS 'Expected word count for text mode (e.g., "100-180") or time duration for voice mode (e.g., "60-120 seconds")';

-- Create index for faster queries (optional)
CREATE INDEX IF NOT EXISTS idx_quiz_question_essay_answer_mode 
  ON public.quiz_question_essay(answer_mode);
