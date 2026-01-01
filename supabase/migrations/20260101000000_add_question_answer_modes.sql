-- Add question_mode column to quiz_question_multiple_choice table
-- This allows teachers to set whether the question is text-based or audio (listening test)
ALTER TABLE public.quiz_question_multiple_choice
ADD COLUMN question_mode TEXT NOT NULL DEFAULT 'text' CHECK (question_mode IN ('text', 'audio'));

-- Add comment for documentation
COMMENT ON COLUMN public.quiz_question_multiple_choice.question_mode IS 'Mode for displaying the question: text (default) or audio (listening test)';

-- Add answer_mode column to quiz_question_essay table
-- This allows teachers to set whether students answer with text or voice note (speaking test)
ALTER TABLE public.quiz_question_essay
ADD COLUMN answer_mode TEXT NOT NULL DEFAULT 'text' CHECK (answer_mode IN ('text', 'voice'));

-- Add comment for documentation
COMMENT ON COLUMN public.quiz_question_essay.answer_mode IS 'Mode for student answers: text (default) or voice (speaking test)';
